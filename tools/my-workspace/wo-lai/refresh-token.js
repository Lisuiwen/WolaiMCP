/**
 * Function to refresh a token from the WoLai API.
 *
 * @param {Object} args - Arguments for the token refresh request.
 * @param {string} args.token - The current token to refresh.
 * @returns {Promise<Object>} - The response from the token refresh request.
 */
const executeFunction = async ({ token }) => {
  const url = 'https://openapi.wolai.com/v1/token';
  
  if (!token) {
    throw new Error('Token is required');
  }
  
  try {
    // Set up headers for the request
    const headers = {
      'Authorization': token,
      'Content-Type': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'PUT',
      headers
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
    console.error('Error refreshing token:', error);
    return {
      error: `An error occurred while refreshing token: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for refreshing a token from the WoLai API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'refresh_token',
      description: 'Refresh a token from the WoLai API. Use this if your token has been compromised or needs to be reset.',
      parameters: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'The current token to refresh. This should be the app_token obtained from get_token.'
          }
        },
        required: ['token']
      }
    }
  }
};

export { apiTool };

