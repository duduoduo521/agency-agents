/**
 * 通用认证和安全验证模块
 * 
 * 功能:
 * - Token 验证
 * - HMAC 签名验证
 * - IP 白名单检查
 * - 速率限制
 */

const crypto = require('crypto');

class AuthManager {
 constructor(config = {}) {
    this.tokens = new Set(config.tokens || []);
    this.secrets = config.secrets || {};
    this.ipWhitelist = new Set(config.ipWhitelist || []);
    this.rateLimits = config.rateLimits || {
      windowMs:60 * 1000, // 1 分钟
      maxRequests:10
    };
    
   // 速率限制跟踪
    this.requestCounts = new Map();
  }

  /**
   * 验证 Token
   */
  verifyToken(token) {
  if (!token) return false;
 return this.tokens.has(token);
  }

  /**
   * 验证 HMAC 签名
   * @param {string} timestamp - 时间戳
   * @param {string} sign - 签名
   * @param {string} secret - 密钥
   * @param {string} algorithm - 算法 (sha256, sha512 等)
   * @returns {boolean}
   */
  verifySignature(timestamp, sign, secret, algorithm = 'sha256') {
  if (!secret) return true; // 未配置密钥时跳过验证

  try {
     const stringToSign = `${timestamp}\n${secret}`;
    const signature = crypto
       .createHmac(algorithm, secret)
       .update(stringToSign, 'utf8')
       .digest()
       .toString('base64');

     return encodeURIComponent(signature) === sign || signature === sign;
   } catch (error) {
    console.error('签名验证失败:', error);
    return false;
   }
  }

  /**
   * 检查 IP 是否在白名单中
   */
  isIpAllowed(ip) {
  // 如果白名单为空，则允许所有 IP
  if (this.ipWhitelist.size === 0) return true;
  
 return this.ipWhitelist.has(ip);
  }

  /**
   * 检查速率限制
   * @param {string} identifier - 标识符（如用户 ID、IP）
   * @returns {{ allowed: boolean, remaining: number, resetTime: number }}
   */
  checkRateLimit(identifier) {
 const now = Date.now();
 const { windowMs, maxRequests } = this.rateLimits;
  
 const userRequests = this.requestCounts.get(identifier) || [];
  
  // 移除过期的请求记录
 const validRequests = userRequests.filter(time => now - time < windowMs);
  
  // 检查是否超出限制
 const allowed = validRequests.length < maxRequests;
  
  // 更新记录
  if (allowed) {
     validRequests.push(now);
    this.requestCounts.set(identifier, validRequests);
   }
  
  // 计算剩余请求数和重置时间
 const remaining = Math.max(0, maxRequests - validRequests.length);
 const resetTime = validRequests.length > 0 
     ? validRequests[0] + windowMs 
     : now + windowMs;
  
 return {
     allowed,
    remaining,
    resetTime
   };
  }

  /**
   * 添加 Token
   */
  addToken(token) {
  this.tokens.add(token);
  }

  /**
   * 移除 Token
   */
 removeToken(token) {
  this.tokens.delete(token);
  }

  /**
   * 添加 IP 到白名单
   */
  addIpToWhitelist(ip) {
  this.ipWhitelist.add(ip);
  }

  /**
   * 从白名单移除 IP
   */
 removeIpFromWhitelist(ip) {
  this.ipWhitelist.delete(ip);
  }

  /**
   * 获取当前速率限制状态
   */
  getRateLimitStatus(identifier) {
 const userRequests = this.requestCounts.get(identifier) || [];
 const now = Date.now();
 const validRequests = userRequests.filter(time => now - time < this.rateLimits.windowMs);
  
 return {
     currentRequests: validRequests.length,
    maxRequests: this.rateLimits.maxRequests,
    remaining: Math.max(0, this.rateLimits.maxRequests - validRequests.length)
   };
  }

  /**
   * 清理过期的速率限制数据
   */
  cleanup() {
 const now = Date.now();
 const windowMs = this.rateLimits.windowMs;
  
  for (const [identifier, requests] of this.requestCounts.entries()) {
    const validRequests = requests.filter(time => now - time < windowMs);
    
   if (validRequests.length === 0) {
       this.requestCounts.delete(identifier);
     } else {
       this.requestCounts.set(identifier, validRequests);
     }
   }
  }
}

module.exports = AuthManager;
