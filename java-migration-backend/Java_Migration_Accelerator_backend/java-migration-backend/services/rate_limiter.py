"""
GitHub API Rate Limiter - Handles rate limiting with exponential backoff, queuing, and intelligent retries
"""
import time
import asyncio
import threading
from typing import Dict, Callable, Any, Optional
from functools import wraps
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


class RateLimitTracker:
    """Track rate limits across different GitHub API endpoints"""
    
    def __init__(self):
        self.limits = {
            'core': {
                'limit': 60,  # Unauthenticated: 60 requests/hour
                'remaining': 60,
                'reset': None,
                'endpoint': 'core'
            },
            'search': {
                'limit': 10,  # Unauthenticated: 10 requests/minute
                'remaining': 10,
                'reset': None,
                'endpoint': 'search'
            },
            'graphql': {
                'limit': 0,  # GraphQL has different limits
                'remaining': 0,
                'reset': None,
                'endpoint': 'graphql'
            }
        }
        self.lock = threading.RLock()
        self.authenticated = False
    
    def update_from_response(self, headers: Dict, endpoint: str = 'core'):
        """Update rate limits from response headers"""
        with self.lock:
            try:
                limit = int(headers.get('X-RateLimit-Limit', self.limits[endpoint]['limit']))
                remaining = int(headers.get('X-RateLimit-Remaining', self.limits[endpoint]['remaining']))
                reset = int(headers.get('X-RateLimit-Reset', 0))
                
                self.limits[endpoint] = {
                    'limit': limit,
                    'remaining': remaining,
                    'reset': reset,
                    'endpoint': endpoint
                }
                
                # Detect if authenticated (authenticated requests have higher limits)
                if endpoint == 'core' and limit >= 5000:
                    self.authenticated = True
                    logger.info(f"[RATE_LIMIT] Authenticated token detected. Core limit: {limit}/hour")
                
                logger.debug(f"[RATE_LIMIT] Updated {endpoint}: {remaining}/{limit} remaining, reset at {reset}")
                return True
            except Exception as e:
                logger.warning(f"[RATE_LIMIT] Failed to parse rate limit headers: {e}")
                return False
    
    def get_status(self, endpoint: str = 'core') -> Dict[str, Any]:
        """Get current rate limit status"""
        with self.lock:
            if endpoint not in self.limits:
                endpoint = 'core'
            return self.limits[endpoint].copy()
    
    def get_all_statuses(self) -> Dict[str, Dict[str, Any]]:
        """Get all rate limit statuses"""
        with self.lock:
            return {k: v.copy() for k, v in self.limits.items()}
    
    def get_wait_time(self, endpoint: str = 'core') -> float:
        """Get time to wait before next request (in seconds)"""
        with self.lock:
            status = self.limits.get(endpoint, self.limits['core'])
            if status['remaining'] > 0:
                return 0
            
            reset_time = status['reset']
            if reset_time:
                current_time = time.time()
                wait = max(0, reset_time - current_time)
                return wait
            
            # Fallback: 1 hour if we don't know the reset time
            return 3600
    
    def is_rate_limited(self, endpoint: str = 'core') -> bool:
        """Check if we're rate limited"""
        with self.lock:
            status = self.limits.get(endpoint, self.limits['core'])
            return status['remaining'] <= 0


class ExponentialBackoffRetry:
    """Implement exponential backoff with jitter for retries"""
    
    def __init__(self, max_retries: int = 5, initial_delay: float = 1.0, max_delay: float = 300.0):
        self.max_retries = max_retries
        self.initial_delay = initial_delay
        self.max_delay = max_delay
    
    def get_delay(self, attempt: int, jitter: bool = True) -> float:
        """Calculate delay for given attempt number (0-indexed)"""
        # Exponential backoff: initial_delay * (2 ^ attempt)
        delay = self.initial_delay * (2 ** attempt)
        delay = min(delay, self.max_delay)
        
        if jitter:
            # Add random jitter (±20%)
            import random
            jitter_amount = delay * 0.2 * random.random()
            delay += jitter_amount
        
        return delay


class RequestQueue:
    """Queue for managing GitHub API requests with rate limiting"""
    
    def __init__(self, rate_limiter: RateLimitTracker):
        self.rate_limiter = rate_limiter
        self.queue = asyncio.Queue()
        self.processing = False
        self.executor_task = None
    
    async def add_request(self, func: Callable, *args, **kwargs) -> Any:
        """Add request to queue and wait for execution"""
        future = asyncio.Future()
        await self.queue.put((func, args, kwargs, future))
        return await future
    
    async def process_queue(self):
        """Process requests from queue with rate limiting"""
        self.processing = True
        try:
            while True:
                func, args, kwargs, future = await self.queue.get()
                
                # Check rate limits and wait if necessary
                endpoint = kwargs.pop('_endpoint', 'core')
                max_retries = kwargs.pop('_max_retries', 3)
                
                retry = ExponentialBackoffRetry(max_retries=max_retries)
                last_error = None
                
                for attempt in range(max_retries):
                    wait_time = self.rate_limiter.get_wait_time(endpoint)
                    if wait_time > 0:
                        logger.info(f"[QUEUE] Rate limited. Waiting {wait_time:.1f}s before request (attempt {attempt + 1}/{max_retries})")
                        await asyncio.sleep(wait_time)
                    
                    try:
                        result = func(*args, **kwargs)
                        future.set_result(result)
                        break
                    except Exception as e:
                        last_error = e
                        if attempt < max_retries - 1:
                            delay = retry.get_delay(attempt)
                            logger.warning(f"[QUEUE] Request failed (attempt {attempt + 1}/{max_retries}): {str(e)}. Retrying in {delay:.1f}s")
                            await asyncio.sleep(delay)
                        else:
                            logger.error(f"[QUEUE] Request failed after {max_retries} attempts: {str(e)}")
                            future.set_exception(last_error)
                
                if not future.done() and last_error:
                    future.set_exception(last_error)
                
                self.queue.task_done()
        except asyncio.CancelledError:
            self.processing = False


def with_rate_limit_handling(rate_limiter: RateLimitTracker, endpoint: str = 'core', max_retries: int = 3):
    """Decorator for functions that make GitHub API calls"""
    retry_handler = ExponentialBackoffRetry(max_retries=max_retries)
    
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            
            for attempt in range(max_retries):
                try:
                    # Check rate limits
                    wait_time = rate_limiter.get_wait_time(endpoint)
                    if wait_time > 0:
                        logger.info(f"[RATE_LIMIT] {func.__name__}: Rate limited. Waiting {wait_time:.1f}s")
                        time.sleep(wait_time)
                    
                    # Execute function
                    result = func(*args, **kwargs)
                    return result
                
                except Exception as e:
                    last_error = e
                    error_str = str(e).lower()
                    
                    # Check if this is a rate limit error
                    is_rate_limit = ('rate limit' in error_str or 
                                   '403' in error_str or
                                   'abuse' in error_str)
                    
                    if is_rate_limit and attempt < max_retries - 1:
                        # Extract wait time if available
                        delay = retry_handler.get_delay(attempt)
                        logger.warning(f"[RATE_LIMIT] {func.__name__} attempt {attempt + 1}/{max_retries} failed: {str(e)}. Retrying in {delay:.1f}s")
                        time.sleep(delay)
                    else:
                        if not is_rate_limit:
                            # Non-rate-limit error, don't retry
                            raise
                        else:
                            # Rate limit error on last attempt
                            logger.error(f"[RATE_LIMIT] {func.__name__} failed after {max_retries} attempts: {str(e)}")
            
            if last_error:
                raise last_error
        
        return wrapper
    return decorator


# Global rate limiter instance
_global_rate_limiter = RateLimitTracker()


def get_rate_limiter() -> RateLimitTracker:
    """Get global rate limiter instance"""
    return _global_rate_limiter


def format_rate_limit_status() -> str:
    """Format rate limit status for logging"""
    status = _global_rate_limiter.get_all_statuses()
    messages = []
    
    for endpoint, limits in status.items():
        if limits['limit'] > 0:
            messages.append(
                f"{endpoint.upper()}: {limits['remaining']}/{limits['limit']} "
                f"(reset: {datetime.fromtimestamp(limits['reset'], tz=timezone.utc).strftime('%H:%M:%S UTC') if limits['reset'] else 'N/A'})"
            )
    
    return " | ".join(messages) if messages else "No rate limit data"
