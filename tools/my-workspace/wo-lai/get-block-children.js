/**
 * Function to retrieve the children of a specific block from the WoLai API.
 *
 * @param {Object} args - Arguments for the request to get block children.
 * @param {string} args.id - The ID of the parent block.
 * @returns {Promise<Object>} - The result of the request to get block children.
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
    // Construct the URL for the request
    const url = `${baseUrl}/${id}/children`;

    // Set up headers for the request
    const headers = {
      'Authorization': token,
      'Content-Type': 'application/json'
    };

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
    console.error('Error retrieving block children:', error);
    return {
      error: `An error occurred while retrieving block children: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for retrieving block children from the WoLai API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_block_children',
      description: 'Retrieve the children (sub-blocks) of a specific block from the WoLai API. This is a batch query interface that may return pagination parameters (has_more, next_cursor) if there are more results. The response will contain a "data" field with the block information on success.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The ID of the parent block. You can get the page ID from a wolai page URL (the part after wolai.com/).'
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