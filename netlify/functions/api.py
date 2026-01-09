import json
from datetime import datetime, timezone

def handler(event, context):
    """Netlify Function for Java Migration API"""

    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    }

    # Handle preflight OPTIONS request
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }

    try:
        path = event.get('path', '').replace('/.netlify/functions/api', '')

        # Health check endpoint
        if path == '/health' or path == '':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'status': 'healthy',
                    'timestamp': datetime.now(timezone.utc).isoformat(),
                    'platform': 'netlify'
                })
            }

        # Java versions endpoint
        elif path == '/java-versions':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'source_versions': [
                        {'value': '7', 'label': 'Java 7'},
                        {'value': '8', 'label': 'Java 8 (LTS)'},
                        {'value': '11', 'label': 'Java 11 (LTS)'},
                        {'value': '17', 'label': 'Java 17 (LTS)'},
                        {'value': '21', 'label': 'Java 21 (LTS)'}
                    ],
                    'target_versions': [
                        {'value': '8', 'label': 'Java 8 (LTS)'},
                        {'value': '11', 'label': 'Java 11 (LTS)'},
                        {'value': '17', 'label': 'Java 17 (LTS)'},
                        {'value': '21', 'label': 'Java 21 (LTS)'}
                    ]
                })
            }

        # Conversion types endpoint
        elif path == '/conversion-types':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps([
                    {
                        'id': 'java_version',
                        'name': 'Java Version Upgrade',
                        'description': 'Upgrade Java version (e.g., Java 8 → Java 17)',
                        'category': 'Language',
                        'icon': '☕'
                    },
                    {
                        'id': 'spring_boot_2_to_3',
                        'name': 'Spring Boot 2 → 3',
                        'description': 'Upgrade Spring Boot 2.x to 3.x with Jakarta EE',
                        'category': 'Framework',
                        'icon': '🌱'
                    },
                    {
                        'id': 'junit_4_to_5',
                        'name': 'JUnit 4 → JUnit 5',
                        'description': 'Migrate JUnit 4 tests to JUnit 5 (Jupiter)',
                        'category': 'Testing',
                        'icon': '✅'
                    }
                ])
            }

        # Mock migration start
        elif path == '/migration/start' and event['httpMethod'] == 'POST':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'job_id': 'mock-job-12345',
                    'status': 'completed',
                    'message': 'Migration completed successfully (demo)',
                    'source_repo': 'demo-repo',
                    'target_repo': 'migrated-demo-repo',
                    'source_java_version': '8',
                    'target_java_version': '17',
                    'conversion_types': ['java_version'],
                    'started_at': datetime.now(timezone.utc).isoformat(),
                    'completed_at': datetime.now(timezone.utc).isoformat(),
                    'files_modified': 5,
                    'issues_fixed': 3
                })
            }

        # Mock migration status
        elif path.startswith('/migration/') and event['httpMethod'] == 'GET':
            job_id = path.replace('/migration/', '')
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'job_id': job_id,
                    'status': 'completed',
                    'progress_percent': 100,
                    'message': 'Migration completed successfully'
                })
            }

        # Default response for unknown endpoints
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({
                'error': 'Endpoint not found',
                'available_endpoints': [
                    '/health',
                    '/java-versions',
                    '/conversion-types',
                    '/migration/start',
                    '/migration/{id}'
                ]
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }