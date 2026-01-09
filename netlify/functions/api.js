// Netlify Function for Java Migration Accelerator API
// This provides a basic API for demo purposes
// In production, you'd want to use a proper backend service

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const path = event.path.replace('/.netlify/functions/api/', '');
  const method = event.httpMethod;

  console.log(`API Request: ${method} ${path}`);

  try {
    // Health check endpoint
    if (path === 'health' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          message: 'Java Migration Accelerator API (Netlify Functions Demo)'
        })
      };
    }

    // Java versions endpoint
    if (path === 'java-versions' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          source_versions: [
            { value: '7', label: 'Java 7' },
            { value: '8', label: 'Java 8 (LTS)' },
            { value: '11', label: 'Java 11 (LTS)' },
            { value: '17', label: 'Java 17 (LTS)' },
            { value: '21', label: 'Java 21 (LTS)' }
          ],
          target_versions: [
            { value: '8', label: 'Java 8 (LTS)' },
            { value: '11', label: 'Java 11 (LTS)' },
            { value: '17', label: 'Java 17 (LTS)' },
            { value: '21', label: 'Java 21 (LTS)' }
          ]
        })
      };
    }

    // Conversion types endpoint
    if (path === 'conversion-types' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([
          {
            id: 'java_version',
            name: 'Java Version Upgrade',
            description: 'Upgrade Java version with modern features',
            category: 'Language',
            icon: '☕'
          },
          {
            id: 'spring_boot_2_to_3',
            name: 'Spring Boot 2 → 3',
            description: 'Upgrade Spring Boot with Jakarta EE',
            category: 'Framework',
            icon: '🌱'
          }
        ])
      };
    }

    // Migration start endpoint (mock response)
    if (path === 'migration/start' && method === 'POST') {
      const jobId = 'demo-' + Date.now();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          job_id: jobId,
          status: 'pending',
          source_repo: 'demo-repo',
          source_java_version: '8',
          target_java_version: '17',
          conversion_types: ['java_version'],
          started_at: new Date().toISOString(),
          current_step: 'Demo migration started',
          message: 'This is a demo response. For full functionality, deploy the Python backend separately.'
        })
      };
    }

    // Migration status endpoint
    if (path.startsWith('migration/') && method === 'GET') {
      const jobId = path.split('/')[1];
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          job_id: jobId,
          status: 'completed',
          source_repo: 'demo-repo',
          target_repo: 'migrated-demo-repo',
          source_java_version: '8',
          target_java_version: '17',
          conversion_types: ['java_version'],
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          current_step: 'Demo migration completed',
          files_modified: 5,
          issues_fixed: 3,
          progress_percent: 100,
          message: 'Demo migration successful!'
        })
      };
    }

    // GitHub repos endpoint (mock)
    if (path === 'github/repos' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([
          {
            name: 'demo-java-app',
            full_name: 'demo/demo-java-app',
            url: 'https://github.com/demo/demo-java-app',
            default_branch: 'main',
            language: 'Java',
            description: 'Demo Java application'
          }
        ])
      };
    }

    // Default response for unhandled endpoints
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Endpoint not implemented in demo',
        message: 'This is a demo API. For full functionality, deploy the Python backend.',
        available_endpoints: [
          'GET /api/health',
          'GET /api/java-versions',
          'GET /api/conversion-types',
          'POST /api/migration/start',
          'GET /api/migration/{job_id}',
          'GET /api/github/repos'
        ]
      })
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};