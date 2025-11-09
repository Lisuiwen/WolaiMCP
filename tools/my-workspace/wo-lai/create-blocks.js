import { getCachedToken } from '../../../lib/tokenCache.js';

/**
 * Function to create blocks in WoLai.
 *
 * @param {Object} args - Arguments for creating blocks.
 * @param {string} args.parent_id - The ID of the parent block.
 * @param {Array<Object>} args.blocks - An array of block objects to create.
 * @param {string} args.token - Optional token. If not provided, will use cached token.
 * @returns {Promise<Object>} - The result of the block creation.
 */
const executeFunction = async ({ parent_id, blocks, token }) => {
  const baseUrl = 'https://openapi.wolai.com/v1/blocks';
  
  // parent_id can come from parameter or environment variable
  const finalParentId = parent_id || process.env.WOLAI_BLOCK_ID;
  
  if (!finalParentId) {
    throw new Error('Parent ID is required. Provide it as a parameter or set WOLAI_BLOCK_ID environment variable.');
  }
  
  // 如果没有提供token，尝试从缓存获取
  const finalToken = token || getCachedToken();
  
  if (!finalToken) {
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
      'Authorization': finalToken,
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
    
    // 提取并返回创建的块的实际内容信息
    if (data && data.data) {
      const createdBlocks = Array.isArray(data.data) ? data.data : [data.data];
      return {
        success: true,
        created_blocks: createdBlocks.map(block => ({
          id: block.id,
          type: block.type,
          content: block.content || block.title || block.text || '',
          parent_id: block.parent_id,
          created_time: block.created_time,
        })),
        count: createdBlocks.length,
      };
    }
    
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
      description: '在 WoLai 中创建一个或多个块。块将被插入到指定的父块或页面中。重要提示：如果未提供 parent_id，将使用环境变量 WOLAI_BLOCK_ID。此工具可以创建各种块类型，包括文本、标题和 simple-table（用于在页面中创建表格）。注意：parent_id 必须是有效的页面 ID 或块 ID。如果遇到权限错误，请检查应用程序是否已在页面协作设置中添加到页面。成功时返回创建的块的实际内容信息（id、type、content 等），而不是接口响应结构。',
      parameters: {
        type: 'object',
        properties: {
          parent_id: {
            type: 'string',
            description: '要插入新块的父块或页面的 ID。这可以是页面 ID（来自 wolai.com/ URL）或块 ID。重要提示：如果未提供，将自动使用环境变量 WOLAI_BLOCK_ID 的值。注意：如果遇到权限错误，请确保应用程序已在页面协作设置中添加到页面。'
          },
          token: {
            type: 'string',
            description: 'Wolai API token（从 get_token 工具获取）。如果未提供，将自动使用缓存的token。'
          },
          blocks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: '块的类型（例如 "text"、"heading"、"simple-table" 用于在页面中创建表格等）。使用 "simple-table" 在页面中创建表格块，而不是使用 create_database_rows（后者用于数据库行）。'
                },
                content: {
                  description: '块的内容。对于文本块，这是一个字符串。对于标题块，这可以是一个包含 "title" 和 "front_color" 等属性的对象。'
                },
                text_alignment: {
                  type: 'string',
                  description: '文本的对齐方式（例如 "center"、"left"、"right"）。'
                },
                level: {
                  type: 'integer',
                  description: '标题级别（1-6，仅适用于标题类型的块）。'
                }
              },
              required: ['type']
            },
            description: '要创建的块对象数组。每个块对象必须有一个 "type" 字段。"content" 字段的格式因块类型而异：对于文本块，它是一个字符串；对于标题块，它可以是一个包含 "title" 和 "front_color" 属性的对象。'
          }
        },
        required: ['blocks']
      }
    }
  }
};

export { apiTool };