import { getCachedToken } from '../../../lib/tokenCache.js';

/**
 * Function to retrieve a specific block from the WoLai API.
 *
 * @param {Object} args - Arguments for the block retrieval.
 * @param {string} args.id - The ID of the block to retrieve.
 * @param {string} args.token - Optional token. If not provided, will use cached token.
 * @returns {Promise<Object>} - The result of the block retrieval.
 */
const executeFunction = async ({ id, token }) => {
  const baseUrl = 'https://openapi.wolai.com/v1/blocks';
  
  // 如果没有提供token，尝试从缓存获取
  const finalToken = token || getCachedToken();
  
  if (!finalToken) {
    throw new Error('Token is required. Please call get_token first to obtain a token.');
  }
  
  if (!id) {
    throw new Error('Block ID is required');
  }
  
  try {
    // Set up headers for the request
    const headers = {
      'Authorization': finalToken,
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
    
    // 提取并返回块的实际内容信息，而不是接口响应结构
    if (data && data.data) {
      const block = data.data;
      return {
        id: block.id,
        type: block.type,
        content: block.content || block.title || block.text || '',
        parent_id: block.parent_id,
        created_time: block.created_time,
        updated_time: block.updated_time,
        // 保留其他可能有用的字段
        ...(block.children_count !== undefined && { children_count: block.children_count }),
        ...(block.level !== undefined && { level: block.level }),
      };
    }
    
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
      description: '通过 ID 从 WoLai API 检索特定块。返回块的实际内容信息（id、type、content、parent_id 等），而不是接口响应结构。',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: '要检索的块的 ID。可以从 wolai 页面 URL 获取页面 ID（wolai.com/ 后面的部分）。'
          },
          token: {
            type: 'string',
            description: 'Wolai API token（从 get_token 工具获取）。如果未提供，将自动使用缓存的token。'
          }
        },
        required: ['id']
      }
    }
  }
};

export { apiTool };