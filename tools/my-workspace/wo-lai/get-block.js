/**
 * Function to retrieve a specific block from the WoLai API.
 *
 * @param {Object} args - Arguments for the block retrieval.
 * @param {string} args.id - The ID of the block to retrieve.
 * @returns {Promise<Object>} - The result of the block retrieval.
 */
const executeFunction = async ({ id, token }) => {
  const baseUrl = 'https://openapi.wolai.com/v1/blocks';
  
  if (!token) {
    throw new Error('Token is required. Please call get_token first to obtain a token.');
  }
  
  if (!id) {
    throw new Error('Block ID is required');
  }
  
  try {
    // Set up headers for the request
    const headers = {
      'Authorization': token,
      'Content-Type': 'application/json'
    };

    // Construct the full URL with block ID
    const url = `${baseUrl}/${id}`;

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'GET',
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
    console.error('Error retrieving block:', error);
    return {
      error: `An error occurred while retrieving block: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for retrieving a specific block from the WoLai API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_block',
      description: 'Retrieve a specific block from the WoLai API by its ID. The response will contain a "data" field with the block information on success.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The ID of the block to retrieve. You can get the page ID from a wolai page URL (the part after wolai.com/).'
          },
          token: {
            type: 'string',
            description: 'The Wolai API token (obtained from get_token tool).'
          }
        },
        required: ['id', 'token']
      }
    }
  }
};

export { apiTool };