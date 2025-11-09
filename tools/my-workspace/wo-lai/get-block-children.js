import { getCachedToken } from '../../../lib/tokenCache.js';

/**
 * Function to retrieve the children of a specific block from the WoLai API.
 *
 * @param {Object} args - Arguments for the request to get block children.
 * @param {string} args.id - The ID of the parent block.
 * @param {string} args.token - Optional token. If not provided, will use cached token.
 * @returns {Promise<Object>} - The result of the request to get block children.
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
    // Construct the URL for the request
    const url = `${baseUrl}/${id}/children`;

    // Set up headers for the request
    const headers = {
      'Authorization': finalToken,
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
    
    // 提取并返回子块的实际内容信息
    if (data && data.data) {
      const children = Array.isArray(data.data) ? data.data : (data.data.results || []);
      return {
        blocks: children.map(block => ({
          id: block.id,
          type: block.type,
          content: block.content || block.title || block.text || '',
          parent_id: block.parent_id,
          created_time: block.created_time,
          updated_time: block.updated_time,
          ...(block.children_count !== undefined && { children_count: block.children_count }),
          ...(block.level !== undefined && { level: block.level }),
        })),
        // 保留分页信息
        ...(data.data.has_more !== undefined && { has_more: data.data.has_more }),
        ...(data.data.next_cursor && { next_cursor: data.data.next_cursor }),
      };
    }
    
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
      description: '从 WoLai API 检索特定块的子块。返回子块的实际内容信息数组（每个块包含 id、type、content 等），以及分页信息（如果有）。返回的是内容数据，而不是接口响应结构。',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: '父块的 ID。可以从 wolai 页面 URL 获取页面 ID（wolai.com/ 后面的部分）。'
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