/**
 * Function to obtain a token from the WoLai API.
 *
 * @param {Object} args - Arguments for the token request.
 * @param {string} args.appId - The application ID for authentication.
 * @param {string} args.appSecret - The application secret for authentication.
 * @returns {Promise<Object>} - The response from the token request.
 */
const executeFunction = async ({ appId, appSecret }) => {
  const url = 'https://openapi.wolai.com/v1/token';
  
  // appId and appSecret can come from parameters or environment variables
  const finalAppId = appId || process.env.WOLAI_APP_ID;
  const finalAppSecret = appSecret || process.env.WOLAI_APP_SECRET;
  
  if (!finalAppId) {
    throw new Error('App ID is required. Provide it as a parameter or set WOLAI_APP_ID environment variable.');
  }
  
  if (!finalAppSecret) {
    throw new Error('App Secret is required. Provide it as a parameter or set WOLAI_APP_SECRET environment variable.');
  }
  
  const headers = {
    'Content-Type': 'application/json'
  };

  // Prepare the request body
  const body = JSON.stringify({
    appId: finalAppId,
    appSecret: finalAppSecret
  });

  try {
    // Perform the fetch request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(JSON.stringify(errorData));
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obtaining token:', error);
    return {
      error: `An error occurred while obtaining the token: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for obtaining a token from the WoLai API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_token',
      description: 'Obtain a token from the WoLai API. The response contains a "data" object with "app_token" (the token to use), "app_id", "create_time", "expire_time" (-1 means no expiration), and "update_time". Use the "app_token" value directly as the Authorization header value (not Bearer format) for other API calls.',
      parameters: {
        type: 'object',
        properties: {
          appId: {
            type: 'string',
            description: 'The application ID for authentication. If not provided, will use WOLAI_APP_ID from environment variables.'
          },
          appSecret: {
            type: 'string',
            description: 'The application secret for authentication. If not provided, will use WOLAI_APP_SECRET from environment variables.'
          }
        },
        required: []
      }
    }
  }
};

export { apiTool };