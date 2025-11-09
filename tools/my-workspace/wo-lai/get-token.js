import { cacheToken } from '../../../lib/tokenCache.js';

/**
 * Function to obtain a token from the WoLai API.
 *
 * @param {Object} args - Arguments for the token request.
 * @param {string} args.appId - The application ID for authentication.
 * @param {string} args.appSecret - The application secret for authentication.
 * @returns {Promise<Object>} - The response from the token request.
 */
const executeFunction = async ({ appId, appSecret }) => {
  const url = 'https://openapi.wolai.com/v1/token';
  
  // appId and appSecret can come from parameters or environment variables
  const finalAppId = appId || process.env.WOLAI_APP_ID;
  const finalAppSecret = appSecret || process.env.WOLAI_APP_SECRET;
  
  if (!finalAppId) {
    throw new Error('App ID is required. Provide it as a parameter or set WOLAI_APP_ID environment variable.');
  }
  
  if (!finalAppSecret) {
    throw new Error('App Secret is required. Provide it as a parameter or set WOLAI_APP_SECRET environment variable.');
  }
  
  const headers = {
    'Content-Type': 'application/json'
  };

  // Prepare the request body
  const body = JSON.stringify({
    appId: finalAppId,
    appSecret: finalAppSecret
  });

  try {
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
    
    // 如果成功获取token，自动缓存
    if (data && data.data && data.data.app_token) {
      const expireTime = data.data.expire_time;
      cacheToken(data.data.app_token, expireTime);
      
      // 返回简化的token信息，而不是完整的接口响应
      return {
        token: data.data.app_token,
        app_id: data.data.app_id,
        expire_time: expireTime,
        is_permanent: expireTime === -1,
        message: 'Token 已获取并自动缓存，后续调用无需再传递 token 参数',
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error obtaining token:', error);
    return {
      error: `An error occurred while obtaining the token: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for obtaining a token from the WoLai API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_token',
      description: '从 WoLai API 获取 token。返回简化的 token 信息（token、app_id、expire_time 等），token 会自动缓存，后续调用其他工具时无需再传递 token 参数。',
      parameters: {
        type: 'object',
        properties: {
          appId: {
            type: 'string',
            description: '用于身份验证的应用程序 ID。如果未提供，将使用环境变量 WOLAI_APP_ID。'
          },
          appSecret: {
            type: 'string',
            description: '用于身份验证的应用程序密钥。如果未提供，将使用环境变量 WOLAI_APP_SECRET。'
          }
        },
        required: []
      }
    }
  }
};

export { apiTool };