// backend/src/agents/coralAgent.js
const axios = require('axios');

// Coral Server 配置
const CORAL_SERVER_URL = process.env.CORAL_SERVER_URL || 'http://localhost:5555';
const CORAL_AGENT_ID = 'insightpilot-agent';
const CORAL_AGENT_NAME = 'InsightPilot Analysis Agent';

/**
 * Coral Agent - 基于 MCP 协议的智能体协调
 * 参考: https://github.com/Coral-Protocol/coral-server
 */
class CoralAgent {
  constructor() {
    this.serverUrl = CORAL_SERVER_URL;
    this.agentId = CORAL_AGENT_ID;
    this.agentName = CORAL_AGENT_NAME;
    this.isRegistered = false;
  }

  /**
   * 注册 InsightPilot Agent 到 Coral Server
   */
  async registerAgent() {
    try {
      console.log('[Coral Agent] Registering InsightPilot agent...');
      
      const registrationData = {
        agentId: this.agentId,
        name: this.agentName,
        capabilities: [
          'user-profile-analysis',
          'interview-question-generation',
          'voice-synthesis',
          'nft-minting'
        ],
        description: 'AI-powered user insight analysis platform for product managers',
        version: '1.0.0'
      };

      const response = await axios.post(
        `${this.serverUrl}/agents/register`,
        registrationData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      this.isRegistered = true;
      console.log('[Coral Agent] Successfully registered with Coral Server');
      return response.data;

    } catch (error) {
      console.warn('[Coral Agent] Registration failed:', error.message);
      console.warn('[Coral Agent] Continuing without Coral coordination');
      return null;
    }
  }

  /**
   * 创建分析线程
   * @param {string} username - 用户名
   * @param {string} productDescription - 产品描述
   * @returns {Promise<string>} - 线程ID
   */
  async createAnalysisThread(username, productDescription) {
    try {
      console.log('[Coral Agent] Creating analysis thread...');
      
      const threadData = {
        title: `InsightPilot Analysis: @${username}`,
        description: `User analysis for product: ${productDescription}`,
        participants: [this.agentId],
        metadata: {
          username,
          productDescription,
          analysisType: 'comprehensive-user-insight'
        }
      };

      const response = await axios.post(
        `${this.serverUrl}/threads/create`,
        threadData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      console.log('[Coral Agent] Analysis thread created:', response.data.threadId);
      return response.data.threadId;

    } catch (error) {
      console.warn('[Coral Agent] Thread creation failed:', error.message);
      return null;
    }
  }

  /**
   * 发送分析进度消息到线程
   * @param {string} threadId - 线程ID
   * @param {string} stage - 分析阶段
   * @param {Object} data - 分析数据
   */
  async sendAnalysisUpdate(threadId, stage, data) {
    try {
      const message = {
        threadId,
        content: this.formatAnalysisMessage(stage, data),
        sender: this.agentId,
        messageType: 'analysis-update',
        metadata: {
          stage,
          timestamp: new Date().toISOString()
        }
      };

      await axios.post(
        `${this.serverUrl}/threads/${threadId}/messages`,
        message,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );

      console.log(`[Coral Agent] Sent ${stage} update to thread ${threadId}`);

    } catch (error) {
      console.warn('[Coral Agent] Failed to send update:', error.message);
    }
  }

  /**
   * 格式化分析消息
   * @param {string} stage - 分析阶段
   * @param {Object} data - 分析数据
   * @returns {string} - 格式化的消息
   */
  formatAnalysisMessage(stage, data) {
    const stageMessages = {
      'twitter-analysis': `🔍 Twitter analysis completed for @${data.username}. Found ${data.followers_count} followers and ${data.tweet_count} tweets.`,
      'persona-generation': `🧠 Generated user persona: ${data.persona?.substring(0, 100)}...`,
      'simulation-interview': `🎭 Conducted simulated interview with ${data.simulatedDialogues?.length || 0} questions.`,
      'voice-synthesis': `🎤 Voice synthesis completed using ${data.voiceStyle} voice.`,
      'nft-minting': `🎯 NFT minted successfully: ${data.nftId}`
    };

    return stageMessages[stage] || `📊 Analysis stage completed: ${stage}`;
  }

  /**
   * 协调完整的分析流程
   * @param {string} username - 用户名
   * @param {string} productDescription - 产品描述
   * @param {Function} analysisFunction - 分析函数
   * @returns {Promise<Object>} - 分析结果
   */
  async coordinateAnalysis(username, productDescription, analysisFunction) {
    let threadId = null;
    
    try {
      // 1. 注册代理（如果尚未注册）
      if (!this.isRegistered) {
        await this.registerAgent();
      }

      // 2. 创建分析线程
      threadId = await this.createAnalysisThread(username, productDescription);

      // 3. 执行分析并发送进度更新
      const result = await analysisFunction(async (stage, data) => {
        if (threadId) {
          await this.sendAnalysisUpdate(threadId, stage, data);
        }
      });

      // 4. 发送完成消息
      if (threadId) {
        await this.sendAnalysisUpdate(threadId, 'analysis-complete', {
          username,
          productDescription,
          success: true,
          timestamp: new Date().toISOString()
        });
      }

      return {
        ...result,
        coralThreadId: threadId,
        coralCoordinated: true
      };

    } catch (error) {
      console.error('[Coral Agent] Analysis coordination failed:', error.message);
      
      // 发送错误消息
      if (threadId) {
        await this.sendAnalysisUpdate(threadId, 'analysis-error', {
          error: error.message,
          username,
          productDescription
        });
      }

      return {
        success: false,
        error: error.message,
        coralThreadId: threadId,
        coralCoordinated: false
      };
    }
  }

  /**
   * 检查 Coral Server 状态
   */
  async checkServerStatus() {
    try {
      const response = await axios.get(`${this.serverUrl}/health`, { timeout: 5000 });
      return {
        status: 'online',
        version: response.data.version || 'unknown',
        uptime: response.data.uptime || 'unknown'
      };
    } catch (error) {
      return {
        status: 'offline',
        error: error.message
      };
    }
  }
}

/**
 * 备用方案：模拟 Coral 协调
 */
class MockCoralAgent {
  async coordinateAnalysis(username, productDescription, analysisFunction) {
    console.log('[Coral Agent] Using mock coordination (Coral Server offline)');
    
    const result = await analysisFunction(async (stage, data) => {
      console.log(`[Mock Coral] ${stage}:`, data);
    });

    return {
      ...result,
      coralThreadId: `mock-thread-${Date.now()}`,
      coralCoordinated: false,
      isMock: true
    };
  }
}

/**
 * 智能 Coral Agent - 自动选择真实或模拟模式
 */
async function createCoralAgent() {
  const agent = new CoralAgent();
  const status = await agent.checkServerStatus();
  
  if (status.status === 'online') {
    console.log('[Coral Agent] Coral Server is online, using real coordination');
    return agent;
  } else {
    console.log('[Coral Agent] Coral Server is offline, using mock coordination');
    return new MockCoralAgent();
  }
}

module.exports = { 
  CoralAgent, 
  MockCoralAgent, 
  createCoralAgent 
};
