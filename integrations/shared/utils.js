/**
 * 通用工具函数
 */

const crypto = require('crypto');

/**
 * 生成唯一 ID
 */
function generateId(prefix = '') {
 const timestamp = Date.now().toString(36);
const random = crypto.randomBytes(4).toString('hex');
 return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * 格式化时间戳为可读格式
 */
function formatTimestamp(timestamp) {
 const date = new Date(timestamp);
 return date.toLocaleString('zh-CN', {
   year: 'numeric',
   month: '2-digit',
   day: '2-digit',
   hour: '2-digit',
   minute: '2-digit',
   second: '2-digit'
 });
}

/**
 * 计算相对时间（如 "5 分钟前"）
 */
function relativeTime(timestamp) {
 const now = Date.now();
const diff = now - timestamp;
 
 const seconds = Math.floor(diff / 1000);
const minutes = Math.floor(seconds/ 60);
const hours = Math.floor(minutes/ 60);
const days = Math.floor(hours/ 24);
 
 if (days > 0) return `${days}天前`;
 if (hours > 0) return `${hours}小时前`;
 if (minutes > 0) return `${minutes}分钟前`;
 return '刚刚';
}

/**
 * 截断文本到指定长度
 */
function truncateText(text, maxLength = 500, suffix = '...') {
 if (text.length <= maxLength) return text;
 return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 安全地解析 JSON，避免抛出异常
 */
function safeJsonParse(str, defaultValue = null) {
 try {
   return JSON.parse(str);
 } catch (error) {
   return defaultValue;
 }
}

/**
 * 提取命令参数
 */
function extractCommandArgs(content, command) {
 if (!content.startsWith(command)) return '';
 return content.slice(command.length).trim();
}

/**
 * 验证邮箱格式
 */
function isValidEmail(email) {
 const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 return regex.test(email);
}

/**
 * 验证 URL 格式
 */
function isValidUrl(url) {
 try {
   new URL(url);
   return true;
 } catch (error) {
   return false;
 }
}

/**
 * 延迟执行
 */
function delay(ms) {
 return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试执行
 */
async function retry(fn, options = {}) {
 const {
   maxRetries = 3,
   delayMs = 1000,
   backoff = 2,
   onRetry
 } = options;
 
 let lastError;
 let currentDelay = delayMs;
 
for (let i = 0; i < maxRetries; i++) {
   try {
     return await fn();
   } catch (error) {
     lastError = error;
     
   if (onRetry) {
       onRetry(error, i + 1, maxRetries);
     }
     
   if (i < maxRetries - 1) {
       await delay(currentDelay);
       currentDelay *= backoff;
     }
   }
 }
 
 throw lastError;
}

/**
 * 并发限制执行
 */
async function limitConcurrency(tasks, limit) {
 const results = [];
 let index = 0;
 
 async function worker() {
   while (index < tasks.length) {
     const currentIndex = index++;
     const task = tasks[currentIndex];
     results[currentIndex] = await task();
   }
 }
 
 const workers = Array(Math.min(limit, tasks.length))
   .fill(null)
   .map(() => worker());
 
 await Promise.all(workers);
 return results;
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
 let timeout;
 return function executedFunction(...args) {
   const later = () => {
     clearTimeout(timeout);
     func(...args);
   };
   
   clearTimeout(timeout);
   timeout = setTimeout(later, wait);
 };
}

/**
 * 节流函数
 */
function throttle(func, limit) {
 let inThrottle;
 return function(...args) {
  if (!inThrottle) {
     func.apply(this, args);
     inThrottle = true;
     setTimeout(() => inThrottle = false, limit);
   }
 };
}

/**
 * 获取客户端 IP 地址
 */
function getClientIp(req) {
 return req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        'unknown';
}

module.exports = {
 generateId,
 formatTimestamp,
 relativeTime,
 truncateText,
 safeJsonParse,
 extractCommandArgs,
 isValidEmail,
 isValidUrl,
 delay,
 retry,
 limitConcurrency,
 debounce,
 throttle,
 getClientIp
};
