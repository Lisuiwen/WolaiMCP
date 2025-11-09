/**
 * Function to create blocks in WoLai.
 *
 * @param {Object} args - Arguments for creating blocks.
 * @param {string} args.parent_id - The ID of the parent block.
 * @param {Array<Object>} args.blocks - An array of block objects to create.
 * @returns {Promise<Object>} - The result of the block creation.
 */
const executeFunction = async ({ parent_id, blocks, token }) => {
  const baseUrl = 'https://openapi.wolai.com/v1/blocks';
  
  // parent_id can come from parameter or environment variable
  const finalParentId = parent_id || process.env.WOLAI_BLOCK_ID;
  
  if (!finalParentId) {
    throw new Error('Parent ID is required. Provide it as a parameter or set WOLAI_BLOCK_ID environment variable.');
  }
  
  if (!token) {
    throw new Error('Token is required. Please call get_token first to obtain a token.');
  }
  
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    throw new Error('Blocks array is required and must not be empty');
  }

  const requestBody = {
    parent_id: finalParentId,
    blocks
  };

  try {
    // Set up headers for the request
    const headers = {
      'Authorization': token,
      'Content-Type': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
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
    console.error('Error creating blocks:', error);
    return {
      error: `An error occurred while creating blocks: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for creating blocks in WoLai.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_blocks',
      description: 'Create one or more blocks in WoLai. The blocks will be inserted into the specified parent block or page. Note: parent_id must be a valid page ID or block ID. If you get a permission error, check that the application has been added to the page in the page collaboration settings. The response will contain a "data" field with the created block information on success.',
      parameters: {
        type: 'object',
        properties: {
          parent_id: {
            type: 'string',
            description: 'The ID of the parent block or page where the new blocks will be inserted. This can be a page ID (from wolai.com/ URL) or a block ID. If not provided, will use WOLAI_BLOCK_ID from environment variables. Note: If you get a permission error, ensure the application has been added to the page in page collaboration settings.'
          },
          token: {
            type: 'string',
            description: 'The Wolai API token (obtained from get_token tool).'
          },
          blocks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: 'The type of the block (e.g., "text", "heading", etc.).'
                },
                content: {
                  description: 'The content of the block. For text blocks, this is a string. For heading blocks, this can be an object with properties like "title" and "front_color".'
                },
                text_alignment: {
                  type: 'string',
                  description: 'The alignment of the text (e.g., "center", "left", "right").'
                },
                level: {
                  type: 'integer',
                  description: 'The heading level (1-6, only applicable for heading type blocks).'
                }
              },
              required: ['type']
            },
            description: 'An array of block objects to create. Each block object must have a "type" field. The "content" field format varies by block type: for text blocks it\'s a string, for heading blocks it can be an object with "title" and "front_color" properties.'
          }
        },
        required: ['blocks', 'token']
      }
    }
  }
};

export { apiTool };