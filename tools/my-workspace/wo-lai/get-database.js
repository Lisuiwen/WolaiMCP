import { getCachedToken } from '../../../lib/tokenCache.js';

/**
 * Function to retrieve a specific database from the WoLai API.
 *
 * @param {Object} args - Arguments for the database retrieval.
 * @param {string} args.id - The ID of the database to retrieve.
 * @param {string} args.token - Optional token. If not provided, will use cached token.
 * @returns {Promise<Object>} - The result of the database retrieval.
 */
const executeFunction = async ({ id, token }) => {
  const baseUrl = 'https://openapi.wolai.com/v1/databases';
  
  // 如果没有提供token，尝试从缓存获取
  const finalToken = token || getCachedToken();
  
  if (!finalToken) {
    throw new Error('Token is required. Please call get_token first to obtain a token.');
  }
  
  if (!id) {
    throw new Error('Database ID is required');
  }
  
  try {
    // Set up headers for the request
    const headers = {
      'Authorization': finalToken,
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
      description: '通过 ID 从 WoLai API 检索特定数据库。重要提示：这适用于 Wolai 数据库（数据库页面），不适用于普通页面中的表格块。如果需要处理页面中的表格块，请改用 get_block。成功时响应将包含一个 "data" 字段，其中包含数据库信息。',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: '要检索的数据库的 ID。重要提示：这适用于 Wolai 数据库（数据库页面），不适用于普通页面中的表格块。如果需要处理页面中的表格块，请改用 get_block。数据库 ID 可以从 wolai 数据库页面 URL 获取：在 Wolai 中打开数据库页面，ID 是 URL 中 wolai.com/ 后面的部分。例如，如果 URL 是 https://www.wolai.com/wolai/abc123xyz，则数据库 ID 是 "abc123xyz"。数据库必须已在 Wolai 中存在（无法通过 API 创建数据库，只能插入行）。'
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