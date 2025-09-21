// backend/src/agents/coralSessionClient.js
const axios = require('axios');

// Coral Sessions API 配置（对齐官方 /api/v1/sessions）
const CORAL_API_URL = process.env.CORAL_API_URL || process.env.CORAL_SERVER_URL || 'http://localhost:8000';
const CORAL_APPLICATION_ID = process.env.CORAL_APPLICATION_ID || 'insightpilot-demo';
const CORAL_PRIVACY_KEY = process.env.CORAL_PRIVACY_KEY || 'demo';
const CORAL_AGENT_NAME = process.env.CORAL_AGENT_NAME || 'insightpilot-analyzer';
const CORAL_AGENT_VERSION = process.env.CORAL_AGENT_VERSION || '0.0.1';
const CORAL_PROVIDER_RUNTIME = process.env.CORAL_PROVIDER_RUNTIME || 'executable'; // or 'docker'

// 可选：Coral API 鉴权（如果服务端要求）
const CORAL_API_TOKEN = process.env.CORAL_API_TOKEN || '';

/**
 * 将 .env 中的密钥映射为 Coral 会话 options 对象
 * 参考 Guide: options.* 以 { type, value } 传入
 */
function buildAgentOptionsFromEnv() {
  const wrap = (val, type = 'string') => (val ? { type, value: String(val) } : undefined);
  const opts = {
    MISTRAL_API_KEY: wrap(process.env.MISTRAL_API_KEY),
    ELEVENLABS_API_KEY: wrap(process.env.ELEVENLABS_API_KEY),
    CROSSMINT_PROJECT_ID: wrap(process.env.CROSSMINT_PROJECT_ID),
    // Use type 'string' in request payload; secrecy is defined in registry metadata
    CROSSMINT_CLIENT_SECRET: wrap(process.env.CROSSMINT_CLIENT_SECRET),
    OPENAI_API_KEY: wrap(process.env.OPENAI_API_KEY)
  };
  // 移除未定义项
  Object.keys(opts).forEach((k) => opts[k] === undefined && delete opts[k]);
  return opts;
}

/**
 * 创建 Coral 会话（POST /api/v1/sessions）
 * 返回 { sessionId, raw }
 */
async function createCoralSession(extraAgentOptions = {}) {
  const url = `${CORAL_API_URL}/api/v1/sessions`;

  const headers = { 'Content-Type': 'application/json' };
  if (CORAL_API_TOKEN) {
    headers['Authorization'] = `Bearer ${CORAL_API_TOKEN}`;
  }

  const options = {
    ...buildAgentOptionsFromEnv(),
    ...extraAgentOptions
  };

  const body = {
    applicationId: CORAL_APPLICATION_ID,
    privacyKey: CORAL_PRIVACY_KEY,
    agentGraphRequest: {
      agents: [
        {
          id: { name: CORAL_AGENT_NAME, version: CORAL_AGENT_VERSION },
          name: 'analyzer',
          description: 'InsightPilot analyzer',
          options,
          systemPrompt: 'You analyze X(Twitter) user data and produce profile+questions+insights.',
          blocking: true,
          customToolAccess: [],
          coralPlugins: [ { type: 'close_session_tool' } ],
          provider: { type: 'local', runtime: CORAL_PROVIDER_RUNTIME }
        }
      ],
      groups: [['analyzer']],
      customTools: {}
    }
  };

  const response = await axios.post(url, body, { headers, timeout: 15000 });
  // 服务端返回结构未在 Guide 详细定义，这里只透传 raw，供上层根据需要解析
  return {
    sessionId: response.data?.sessionId || response.data?.id || response.data?.session?.id || null,
    raw: response.data
  };
}

module.exports = {
  createCoralSession,
  CORAL_APPLICATION_ID,
  CORAL_PRIVACY_KEY
};


