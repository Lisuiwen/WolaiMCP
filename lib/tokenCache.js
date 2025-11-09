/**
 * Token缓存管理模块
 * 用于存储和管理WoLai API的token
 */

let cachedToken = null;
let tokenExpireTime = null;

/**
 * 缓存token
 * @param {string} token - 要缓存的token
 * @param {number} expireTime - token过期时间戳（-1表示永不过期）
 */
export function cacheToken(token, expireTime = -1) {
  cachedToken = token;
  tokenExpireTime = expireTime === -1 ? null : expireTime;
}

/**
 * 获取缓存的token
 * @returns {string|null} 缓存的token，如果不存在或已过期则返回null
 */
export function getCachedToken() {
  if (!cachedToken) {
    return null;
  }
  
  // 检查token是否过期
  if (tokenExpireTime !== null && Date.now() >= tokenExpireTime) {
    // token已过期，清除缓存
    cachedToken = null;
    tokenExpireTime = null;
    return null;
  }
  
  return cachedToken;
}

/**
 * 清除token缓存
 */
export function clearTokenCache() {
  cachedToken = null;
  tokenExpireTime = null;
}

/**
 * 检查token是否已缓存且有效
 * @returns {boolean}
 */
export function hasValidToken() {
  return getCachedToken() !== null;
}

