// backend/src/agents/mistralAgent.js
const axios = require('axios');

// 从环境变量获取API密钥
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

/**
 * 基础 Mistral AI 调用函数 - 支持各种分析任务
 * @param {string} prompt - 提示词
 * @param {Object} options - 可选参数
 * @returns {Promise<string>} - AI 响应文本
 */
async function analyzeWithMistral(prompt, options = {}) {
  try {
    console.log('[Mistral Agent] Making API call...');
    
    const response = await axios.post(MISTRAL_API_URL, {
      model: options.model || 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      response_format: options.response_format || { type: "json_object" }
    }, {
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: options.timeout || 30000
    });

    const result = response.data.choices[0].message.content;
    console.log('[Mistral Agent] API call successful');
    return result;

  } catch (error) {
    console.error('[Mistral Agent] API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Mistral API密钥无效或未设置');
    } else if (error.response?.status === 429) {
      throw new Error('Mistral API限额已用完，请检查账户');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Mistral API请求超时，请检查网络连接');
    }
    
    throw new Error(`Mistral AI调用失败: ${error.message}`);
  }
}

/**
 * 调用Mistral AI API生成用户画像分析
 * @param {string} userData - 从Twitter或其他来源获取的用户数据文本
 * @param {string} productDescription - 产品描述
 * @returns {Promise<Object>} - 包含用户画像和访谈问题的对象
 */
async function analyzeUserProfile(userData, productDescription) {
  try {
    console.log('[Mistral Agent] Starting user profile analysis...');

    // 构建给Mistral AI的提示词
    const prompt = `
你是一名资深用户研究员。请基于提供的用户数据，生成一份详细的用户画像和针对性的访谈问题。

用户数据：${userData}

产品描述：${productDescription}

请按照以下结构输出纯JSON格式的分析结果，不要包含任何其他文字：
{
  "persona": "详细的三段式用户画像描述，包含角色、目标、痛点",
  "interviewQuestions": ["问题1", "问题2", "问题3", "问题4", "问题5"]
}

要求：
1. 用户画像要基于数据推理，不要虚构
2. 访谈问题要尖锐、开放，能够揭示用户深层次需求
3. 问题要针对提供的产品描述
    `;

    const analysis = await analyzeWithMistral(prompt);
    console.log('[Mistral Agent] Analysis completed successfully');
    
    // 解析返回的JSON字符串为对象
    return JSON.parse(analysis);

  } catch (error) {
    console.error('[Mistral Agent] Error:', error.message);
    throw new Error(`Mistral AI analysis failed: ${error.message}`);
  }
}

/**
 * 备用方案：如果API调用失败，返回模拟数据
 */
function getMockAnalysis(userData, productDescription) {
  console.log('[Mistral Agent] Using mock data for development');
  return {
    persona: `基于${userData}生成的模拟用户画像。这是一个科技爱好者，喜欢创新产品，关注AI和用户体验。`,
    interviewQuestions: [
      "你最看重产品的哪些特性？",
      "当前解决方案在哪些方面让你不满意？",
      "你希望这个产品如何融入你的工作流程？",
      "什么样的创新功能会让你感到兴奋？",
      "你愿意为什么样的价值付费？"
    ]
  };
}

module.exports = { analyzeUserProfile, getMockAnalysis, analyzeWithMistral };
