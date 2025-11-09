/**
 * Function to retrieve a specific database from the WoLai API.
 *
 * @param {Object} args - Arguments for the database retrieval.
 * @param {string} args.id - The ID of the database to retrieve.
 * @returns {Promise<Object>} - The result of the database retrieval.
 */
const executeFunction = async ({ id, token }) => {
  const baseUrl = 'https://openapi.wolai.com/v1/databases';
  
  if (!token) {
    throw new Error('Token is required. Please call get_token first to obtain a token.');
  }
  
  if (!id) {
    throw new Error('Database ID is required');
  }
  
  try {
    // Set up headers for the request
    const headers = {
      'Authorization': token,
      'Content-Type': 'application/json'
    };

    // Construct the full URL with database ID
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
    console.error('Error retrieving database:', error);
    return {
      error: `An error occurred while retrieving database: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for retrieving a specific database from the WoLai API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_database',
      description: 'Retrieve a specific database from the WoLai API by its ID. The response will contain a "data" field with the database information on success.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The ID of the database to retrieve. Database ID can be obtained from the wolai database page URL: open the database page in Wolai, and the ID is the part after wolai.com/ in the URL. For example, if the URL is https://www.wolai.com/wolai/abc123xyz, then the database ID is "abc123xyz". The database must already exist in Wolai (databases cannot be created via API, only rows can be inserted).'
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