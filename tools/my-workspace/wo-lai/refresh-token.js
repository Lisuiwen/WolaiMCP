import { getCachedToken, cacheToken } from '../../../lib/tokenCache.js';

/**
 * Function to refresh a token from the WoLai API.
 *
 * @param {Object} args - Arguments for the token refresh request.
 * @param {string} args.token - Optional token. If not provided, will use cached token.
 * @returns {Promise<Object>} - The response from the token refresh request.
 */
const executeFunction = async ({ token }) => {
  const url = 'https://openapi.wolai.com/v1/token';
  
  // 如果没有提供token，尝试从缓存获取
  const finalToken = token || getCachedToken();
  
  if (!finalToken) {
    throw new Error('Token is required. Please call get_token first to obtain a token.');
  }
  
  try {
    // Set up headers for the request
    const headers = {
      'Authorization': finalToken,
      'Content-Type': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'PUT',
      headers
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(JSON.stringify(errorData));
    }

    // Parse and return the response data
    const data = await response.json();
    
    // 如果成功刷新token，更新缓存
    if (data && data.data && data.data.app_token) {
      const expireTime = data.data.expire_time;
      cacheToken(data.data.app_token, expireTime);
      
      // 返回简化的token信息
      return {
        token: data.data.app_token,
        app_id: data.data.app_id,
        expire_time: expireTime,
        is_permanent: expireTime === -1,
        message: 'Token 已刷新并更新缓存',
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return {
      error: `An error occurred while refreshing token: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for refreshing a token from the WoLai API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'refresh_token',
      description: '刷新 WoLai API 的 token。如果 token 已泄露或需要重置，请使用此工具。返回简化的 token 信息，新 token 会自动更新到缓存中。',
      parameters: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: '要刷新的当前 token。这应该是从 get_token 获取的 app_token。如果未提供，将自动使用缓存的token。'
          }
        },
        required: []
      }
    }
  }
};

export { apiTool };

