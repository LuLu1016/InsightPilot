// backend/src/agents/productExpertAgent.js
const { analyzeWithMistral } = require('./mistralAgent');

/**
 * 产品专家智能体 - 生成关键问题并模拟对话
 * 这是 InsightPilot 的革命性升级：从单向分析到双向对话
 * @param {string} personaSummary - 用户画像摘要
 * @param {string} productDescription - 产品描述
 * @returns {Promise<Object>} - 包含模拟对话和策略建议的对象
 */
async function conductSimulatedInterview(personaSummary, productDescription) {
  try {
    console.log('[ProductExpert Agent] Starting simulated interview...');

    // 1. 生成关键问题
    const questionsPrompt = `
As a seasoned product expert, generate 3-5 of the most critical questions a business should ask this user profile about their product.

User Profile: ${personaSummary}
Product: ${productDescription}

Output ONLY a JSON array of questions: ["question1", "question2", "question3", "question4", "question5"]
    `;

    const questionsArray = await analyzeWithMistral(questionsPrompt);
    const questions = JSON.parse(questionsArray);

    console.log('[ProductExpert Agent] Generated questions:', questions);

    // 2. 模拟对话 - 对每个问题获取用户画像Agent的回答
    const dialogues = [];
    for (const question of questions) {
      try {
        const answer = await simulateUserResponse(question, personaSummary);
        const analysis = await analyzeResponse(question, answer, productDescription);
        
        dialogues.push({
          question,
          answer: answer.answer,
          analysis: analysis.analysis
        });

        // 短暂暂停，避免速率限制
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.warn(`[ProductExpert Agent] Failed to simulate Q: "${question}"`, error.message);
        dialogues.push({
          question,
          answer: "Simulation failed for this question.",
          analysis: "Unable to analyze due to simulation error."
        });
      }
    }

    // 3. 生成战略建议
    const advicePrompt = `
As a product strategist, analyze this simulated interview dialogue and provide concrete advice for the business.

Dialogues: ${JSON.stringify(dialogues)}
Product: ${productDescription}

Provide strategic advice in 2-3 sentences focused on:
1. Key user pain points revealed
2. Product opportunities to focus on
3. Potential risks or concerns

Output: { "advice": "your advice here" }
    `;

    const adviceResult = await analyzeWithMistral(advicePrompt);
    const { advice } = JSON.parse(adviceResult);

    return {
      simulationReport: {
        originalQuestions: questions,
        simulatedDialogues: dialogues,
        strategicAdvice: advice
      }
    };

  } catch (error) {
    console.error('[ProductExpert Agent] Interview simulation failed:', error);
    throw new Error(`Product expert simulation failed: ${error.message}`);
  }
}

/**
 * 模拟用户对单个问题的回答
 * @param {string} question - 问题
 * @param {string} personaSummary - 用户画像摘要
 * @returns {Promise<Object>} - 用户回答
 */
async function simulateUserResponse(question, personaSummary) {
  const prompt = `
As the user described below, answer this question authentically from their perspective.

User Profile: ${personaSummary}
Question: ${question}

Respond naturally as this user would. Output: { "answer": "your response" }
  `;

  const response = await analyzeWithMistral(prompt);
  return JSON.parse(response);
}

/**
 * 分析单个问答对
 * @param {string} question - 问题
 * @param {Object} answer - 用户回答
 * @param {string} productDescription - 产品描述
 * @returns {Promise<Object>} - 分析结果
 */
async function analyzeResponse(question, answer, productDescription) {
  const prompt = `
Analyze this Q&A pair for product insights.

Question: ${question}
Answer: ${answer}
Product: ${productDescription}

Provide 1-2 sentence analysis of what this reveals about user needs. 
Output: { "analysis": "your analysis" }
  `;

  const response = await analyzeWithMistral(prompt);
  return JSON.parse(response);
}

/**
 * 备用模拟实现 - 用于开发和测试
 * @param {string} personaSummary - 用户画像摘要
 * @param {string} productDescription - 产品描述
 * @returns {Promise<Object>} - 模拟的对话结果
 */
async function conductSimulatedInterviewMock(personaSummary, productDescription) {
  console.log('[ProductExpert Agent] Using mock simulation');
  return {
    simulationReport: {
      originalQuestions: [
        "What's your biggest frustration with current solutions?",
        "How would this product fit into your daily workflow?",
        "What would make this product indispensable to you?",
        "What features do you prioritize most?",
        "How do you currently handle this problem?"
      ],
      simulatedDialogues: [
        {
          question: "What's your biggest frustration with current solutions?",
          answer: "They're too complex and don't solve the real problem. I need something that just works.",
          analysis: "User values simplicity and actual problem-solving over feature richness."
        },
        {
          question: "How would this product fit into your daily workflow?",
          answer: "I'd want it to integrate seamlessly with my existing tools and not disrupt my current process.",
          analysis: "Integration and workflow compatibility are critical success factors."
        },
        {
          question: "What would make this product indispensable to you?",
          answer: "If it saves me significant time and provides insights I can't get elsewhere.",
          analysis: "Time-saving and unique value proposition are key differentiators."
        },
        {
          question: "What features do you prioritize most?",
          answer: "Reliability, ease of use, and actionable insights. Fancy features are nice but not essential.",
          analysis: "Core functionality and reliability trump advanced features for this user."
        },
        {
          question: "How do you currently handle this problem?",
          answer: "I use multiple tools and manual processes, which is inefficient but necessary.",
          analysis: "Current fragmented approach creates opportunity for unified solution."
        }
      ],
      strategicAdvice: "Focus on simplicity and core problem-solving. Avoid feature bloat. Prioritize integration with existing workflows and emphasize time-saving benefits. Reliability and actionable insights are more important than advanced features."
    },
    isMock: true
  };
}

/**
 * 基于用户画像和历史洞察生成个性化问题
 * @param {string} userProfile - 用户画像摘要
 * @param {Array} previousInsights - 之前采访的洞察数组
 * @returns {Promise<Array>} - 个性化问题数组
 */
async function generatePersonalizedQuestions(userProfile, previousInsights = []) {
  try {
    console.log('[ProductExpert] Generating personalized questions based on profile and', previousInsights.length, 'previous insights');
    
    const prompt = `
As a product expert, generate 3-5 personalized interview questions based on this user profile and learnings from previous interviews.

USER PROFILE: ${userProfile}

LEARNINGS FROM PREVIOUS INTERVIEWS:
${previousInsights.slice(-5).map((insight, index) => `${index + 1}. ${insight}`).join('\n')}

Generate questions that are specifically tailored to this user's background and context.
Output ONLY a JSON array: ["question1", "question2", "question3", "question4", "question5"]
    `;

    const response = await analyzeWithMistral(prompt);
    return JSON.parse(response);
    
  } catch (error) {
    console.error('[ProductExpert] Personalized questions failed, using fallback:', error);
    // 降级方案：返回通用问题
    return [
      "What's your biggest challenge related to this product area?",
      "How would this product fit into your workflow?",
      "What would make this solution indispensable for you?",
      "What features do you prioritize most?",
      "How do you currently handle this problem?"
    ];
  }
}

/**
 * 生成多用户对比分析报告
 * @param {Array} userResults - 所有用户的采访结果
 * @param {string} productDescription - 产品描述
 * @returns {Promise<Object>} - 对比分析报告
 */
async function generateComparativeReport(userResults, productDescription) {
  try {
    console.log('[ProductExpert] Generating comparative report for', userResults.length, 'users');
    
    const prompt = `
As a product strategist, analyze the interview results from multiple users and generate a comprehensive comparative report.

PRODUCT: ${productDescription}

USER INTERVIEWS:
${userResults.map((result, index) => `
User ${index + 1}: @${result.username}
Persona: ${result.profile?.persona || 'N/A'}
Key Insights: ${result.interview?.simulationReport?.strategicAdvice || 'N/A'}
`).join('\n')}

Generate a comparative analysis focusing on:
1. Common pain points across all users
2. Unique insights from each user segment
3. Product opportunities prioritized by user needs
4. Potential conflicts or contradictions in user feedback
5. Strategic recommendations for product development

Output: { 
  "commonPainPoints": ["point1", "point2", "point3"],
  "uniqueInsights": ["insight1", "insight2", "insight3"],
  "productOpportunities": ["opportunity1", "opportunity2", "opportunity3"],
  "userConflicts": ["conflict1", "conflict2"],
  "strategicRecommendations": "comprehensive strategic advice"
}
    `;

    const response = await analyzeWithMistral(prompt);
    return JSON.parse(response);
    
  } catch (error) {
    console.error('[ProductExpert] Comparative report failed, using fallback:', error);
    return {
      commonPainPoints: ["Complexity", "Integration challenges", "Time constraints"],
      uniqueInsights: ["User-specific insights unavailable"],
      productOpportunities: ["Simplification", "Better integration", "Time-saving features"],
      userConflicts: ["Conflicts analysis unavailable"],
      strategicRecommendations: "Focus on core functionality and user experience based on individual user feedback."
    };
  }
}

/**
 * 智能对话模拟 - 自动选择真实或模拟模式
 * @param {string} personaSummary - 用户画像摘要
 * @param {string} productDescription - 产品描述
 * @returns {Promise<Object>} - 对话模拟结果
 */
async function conductSimulatedInterviewSmart(personaSummary, productDescription) {
  // 检查是否有API密钥
  if (!process.env.MISTRAL_API_KEY) {
    console.warn('[ProductExpert Agent] MISTRAL_API_KEY not found, using mock mode');
    return await conductSimulatedInterviewMock(personaSummary, productDescription);
  }

  try {
    return await conductSimulatedInterview(personaSummary, productDescription);
  } catch (error) {
    console.warn('[ProductExpert Agent] Real simulation failed, falling back to mock:', error.message);
    return await conductSimulatedInterviewMock(personaSummary, productDescription);
  }
}

module.exports = { 
  conductSimulatedInterview, 
  conductSimulatedInterviewMock, 
  conductSimulatedInterviewSmart,
  generatePersonalizedQuestions,
  generateComparativeReport,
  simulateUserResponse,
  analyzeResponse
};
