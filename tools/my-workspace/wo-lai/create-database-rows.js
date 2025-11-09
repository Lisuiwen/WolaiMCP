/**
 * Function to create rows in a database using the WoLai API.
 *
 * @param {Object} args - Arguments for creating rows.
 * @param {string} args.database_id - The ID of the database.
 * @param {Array<Object>} args.rows - An array of row objects to be created.
 * @returns {Promise<Object>} - The result of the row creation.
 */
const executeFunction = async ({ database_id, rows, token }) => {
  const baseUrl = 'https://openapi.wolai.com/v1/databases';
  
  if (!token) {
    throw new Error('Token is required. Please call get_token first to obtain a token.');
  }
  
  if (!database_id) {
    throw new Error('Database ID is required');
  }
  
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    throw new Error('Rows array is required and must not be empty');
  }
  
  try {
    // Set up headers for the request
    const headers = {
      'Authorization': token,
      'Content-Type': 'application/json'
    };

    // Construct the full URL with database ID
    const url = `${baseUrl}/${database_id}/rows`;

    // Prepare the request body
    const body = JSON.stringify({ rows });

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
    console.error('Error creating rows:', error);
    return {
      error: `An error occurred while creating rows: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for creating rows in a database using the WoLai API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_database_rows',
      description: 'Insert rows (data) into an existing database using the WoLai API. Note: The database must already exist in Wolai. You need to provide the database ID to specify which database to insert data into. The response will contain a "data" field with the result on success.',
      parameters: {
        type: 'object',
        properties: {
          database_id: {
            type: 'string',
            description: 'The ID of the existing database where rows will be created. Database ID can be obtained from the wolai database page URL (the part after wolai.com/). This ID is required because you need to specify which existing database to insert data into.'
          },
          token: {
            type: 'string',
            description: 'The Wolai API token (obtained from get_token tool).'
          },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              description: 'An object representing a row to be created.'
            },
            description: 'An array of row objects to be created.'
          }
        },
        required: ['database_id', 'rows', 'token']
      }
    }
  }
};

export { apiTool };