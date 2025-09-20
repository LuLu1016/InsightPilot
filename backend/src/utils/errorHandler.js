// src/utils/errorHandler.js - 统一错误处理模块
const axios = require('axios');

/**
 * 统一错误处理类
 */
class ErrorHandler {
  /**
   * 处理 API 调用错误
   * @param {Error} error - 错误对象
   * @param {string} serviceName - 服务名称
   * @param {Object} fallbackData - 降级数据
   * @returns {Object} - 处理后的结果
   */
  static handleApiError(error, serviceName, fallbackData = null) {
    console.error(`[${serviceName}] API Error:`, error.message);
    
    // 根据错误类型提供不同的处理
    if (error.response) {
      // API 响应错误
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 401:
          console.warn(`[${serviceName}] 认证失败: API密钥无效`);
          break;
        case 429:
          console.warn(`[${serviceName}] 请求限制: API调用次数超限`);
          break;
        case 500:
          console.warn(`[${serviceName}] 服务器错误: ${data?.message || 'Internal Server Error'}`);
          break;
        case 502:
          console.warn(`[${serviceName}] 网关错误: 服务暂时不可用`);
          break;
        default:
          console.warn(`[${serviceName}] HTTP错误 ${status}: ${data?.message || error.message}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      console.warn(`[${serviceName}] 请求超时: ${error.message}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.warn(`[${serviceName}] 连接被拒绝: 服务不可用`);
    } else if (error.code === 'ENOTFOUND') {
      console.warn(`[${serviceName}] 域名解析失败: ${error.message}`);
    } else {
      console.warn(`[${serviceName}] 未知错误: ${error.message}`);
    }

    // 返回降级结果
    return {
      success: false,
      error: error.message,
      fallback: true,
      data: fallbackData
    };
  }

  /**
   * 安全执行异步操作
   * @param {Function} asyncFunction - 异步函数
   * @param {string} operationName - 操作名称
   * @param {Object} fallbackData - 降级数据
   * @returns {Promise<Object>} - 执行结果
   */
  static async safeExecute(asyncFunction, operationName, fallbackData = null) {
    try {
      console.log(`[${operationName}] 开始执行...`);
      const result = await asyncFunction();
      console.log(`[${operationName}] 执行成功`);
      return {
        success: true,
        data: result,
        fallback: false
      };
    } catch (error) {
      console.error(`[${operationName}] 执行失败:`, error.message);
      return {
        success: false,
        error: error.message,
        fallback: true,
        data: fallbackData
      };
    }
  }

  /**
   * 带重试的 API 调用
   * @param {Function} apiCall - API 调用函数
   * @param {number} maxRetries - 最大重试次数
   * @param {number} delay - 重试延迟（毫秒）
   * @returns {Promise<Object>} - 调用结果
   */
  static async retryApiCall(apiCall, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Retry] 尝试 ${attempt}/${maxRetries}`);
        const result = await apiCall();
        if (attempt > 1) {
          console.log(`[Retry] 重试成功 (第${attempt}次尝试)`);
        }
        return {
          success: true,
          data: result,
          attempts: attempt
        };
      } catch (error) {
        lastError = error;
        console.warn(`[Retry] 第${attempt}次尝试失败: ${error.message}`);
        
        if (attempt < maxRetries) {
          console.log(`[Retry] ${delay}ms后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // 指数退避
        }
      }
    }
    
    console.error(`[Retry] 所有重试失败 (${maxRetries}次尝试)`);
    return {
      success: false,
      error: lastError.message,
      attempts: maxRetries
    };
  }

  /**
   * 验证环境变量
   * @param {string} envVar - 环境变量名
   * @param {string} serviceName - 服务名称
   * @returns {boolean} - 是否有效
   */
  static validateEnvVar(envVar, serviceName) {
    if (!process.env[envVar]) {
      console.warn(`[${serviceName}] 环境变量 ${envVar} 未设置，将使用模拟模式`);
      return false;
    }
    
    if (process.env[envVar].length < 10) {
      console.warn(`[${serviceName}] 环境变量 ${envVar} 值过短，可能无效`);
      return false;
    }
    
    return true;
  }

  /**
   * 创建超时 Promise
   * @param {number} timeout - 超时时间（毫秒）
   * @param {string} operation - 操作名称
   * @returns {Promise} - 超时 Promise
   */
  static createTimeoutPromise(timeout, operation) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} 操作超时 (${timeout}ms)`));
      }, timeout);
    });
  }

  /**
   * 带超时的 Promise 竞争
   * @param {Promise} promise - 主要 Promise
   * @param {number} timeout - 超时时间（毫秒）
   * @param {string} operation - 操作名称
   * @returns {Promise} - 竞争结果
   */
  static async withTimeout(promise, timeout, operation) {
    return Promise.race([
      promise,
      this.createTimeoutPromise(timeout, operation)
    ]);
  }
}

module.exports = { ErrorHandler };
