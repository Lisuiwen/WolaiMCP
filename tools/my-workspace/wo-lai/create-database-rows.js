import { getCachedToken } from '../../../lib/tokenCache.js';

/**
 * Function to create rows in a database using the WoLai API.
 *
 * @param {Object} args - Arguments for creating rows.
 * @param {string} args.database_id - The ID of the database.
 * @param {Array<Object>} args.rows - An array of row objects to be created.
 * @param {string} args.token - Optional token. If not provided, will use cached token.
 * @returns {Promise<Object>} - The result of the row creation.
 */
const executeFunction = async ({ database_id, rows, token }) => {
  const baseUrl = 'https://openapi.wolai.com/v1/databases';
  
  // database_id can come from parameter or environment variable
  const finalDatabaseId = database_id || process.env.WOLAI_DATABASE_ID;
  
  // 如果没有提供token，尝试从缓存获取
  const finalToken = token || getCachedToken();
  
  if (!finalToken) {
    throw new Error('Token is required. Please call get_token first to obtain a token.');
  }
  
  if (!finalDatabaseId) {
    throw new Error('Database ID is required. Provide it as a parameter or set WOLAI_DATABASE_ID environment variable.');
  }
  
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    throw new Error('Rows array is required and must not be empty');
  }
  
  try {
    // Set up headers for the request
    const headers = {
      'Authorization': finalToken,
      'Content-Type': 'application/json'
    };

    // Construct the full URL with database ID
    const url = `${baseUrl}/${finalDatabaseId}/rows`;

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
      description: '使用 WoLai API 向现有数据库插入行（数据）。重要提示：这适用于 Wolai 数据库（数据库页面），不适用于普通页面中的表格块。如果需要在页面中创建表格，请改用 create_blocks 并指定 type "simple-table"。注意：数据库必须已在 Wolai 中存在。需要提供数据库 ID 以指定要插入数据的数据库。如果未提供 database_id，将使用环境变量 WOLAI_DATABASE_ID。成功时响应将包含一个 "data" 字段，其中包含结果。',
      parameters: {
        type: 'object',
        properties: {
          database_id: {
            type: 'string',
            description: '要创建行的现有数据库的 ID。重要提示：这适用于 Wolai 数据库（数据库页面），不适用于普通页面中的表格块。如果需要在页面中创建表格，请改用 create_blocks 并指定 type "simple-table"。数据库 ID 可以从 wolai 数据库页面 URL 获取：在 Wolai 中打开数据库页面，ID 是 URL 中 wolai.com/ 后面的部分。例如，如果 URL 是 https://www.wolai.com/wolai/abc123xyz，则数据库 ID 是 "abc123xyz"。如果未提供，将自动使用环境变量 WOLAI_DATABASE_ID。注意：数据库必须已在 Wolai 中存在（无法通过 API 创建数据库，只能插入行）。'
          },
          token: {
            type: 'string',
            description: 'Wolai API token（从 get_token 工具获取）。如果未提供，将自动使用缓存的token。'
          },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              description: '表示要创建的行的对象。'
            },
            description: '要创建的行对象数组。'
          }
        },
        required: ['rows']
      }
    }
  }
};

export { apiTool };