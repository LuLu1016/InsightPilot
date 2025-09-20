// backend/src/agents/elevenLabsAgent.js
const axios = require('axios');

// 配置 - 从环境变量获取API密钥
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1';

// 声音预设库（来自ElevenLabs官方语音库）
const VOICE_PRESETS = {
  // 专业清晰型 - 适合大多数商业场景
  RACHEL: { 
    id: '21m00Tcm4TlvDq8ikWAM', 
    description: '清晰、专业、友好的女声，适合通用商业场景',
    style: 'professional'
  },
  // 权威自信型 - 适合高管、严肃话题
  ARNOLD: { 
    id: 'VR6AewLTigWG4xSOukaG', 
    description: '深沉、权威、自信的男声，适合严肃或重要内容',
    style: 'authoritative'
  },
  // 活力热情型 - 适合创意、创新话题
  DOMI: { 
    id: 'AZnzlk1XvdvUeBnXmlld', 
    description: '充满活力、热情的女声，适合创意和创新主题',
    style: 'energetic'
  },
  // 冷静分析型 - 适合技术、数据相关内容
  BELLA: { 
    id: 'EXAVITQu4vr4xnSDxMaL', 
    description: '冷静、清晰、分析型的女声，适合技术内容',
    style: 'analytical'
  }
};

/**
 * 智能语音选择器 - 根据用户画像分析选择最合适的声音
 * @param {string} personaSummary - Mistral生成的用户画像摘要
 * @returns {Object} 选中的声音对象
 */
function selectIntelligentVoice(personaSummary) {
  console.log('[ElevenLabs Agent] Analyzing persona for voice selection:', personaSummary);
  
  const summary = personaSummary.toLowerCase();
  
  // 基于用户画像的智能语音匹配逻辑
  if (summary.includes('高管') || summary.includes('ceo') || summary.includes('创始人') || 
      summary.includes('资深') || summary.includes('权威') || summary.includes('决策')) {
    console.log('[ElevenLabs Agent] Selected authoritative voice for executive persona');
    return VOICE_PRESETS.ARNOLD;
  }
  
  if (summary.includes('创意') || summary.includes('设计') || summary.includes('艺术') || 
      summary.includes('创新') || summary.includes('热情') || summary.includes('活力')) {
    console.log('[ElevenLabs Agent] Selected energetic voice for creative persona');
    return VOICE_PRESETS.DOMI;
  }
  
  if (summary.includes('技术') || summary.includes('工程') || summary.includes('开发') || 
      summary.includes('分析') || summary.includes('数据') || summary.includes('研发')) {
    console.log('[ElevenLabs Agent] Selected analytical voice for technical persona');
    return VOICE_PRESETS.BELLA;
  }
  
  // 默认选择 - 专业清晰型
  console.log('[ElevenLabs Agent] Selected default professional voice');
  return VOICE_PRESETS.RACHEL;
}

/**
 * 核心功能：将文本转换为语音
 * @param {string} text - 要转换为语音的文本
 * @param {Object} voiceConfig - 声音配置对象
 * @returns {Promise<Buffer>} - 包含MP3音频数据的缓冲区
 */
async function generateSpeech(text, voiceConfig = VOICE_PRESETS.RACHEL) {
  try {
    console.log(`[ElevenLabs Agent] Generating speech with voice: ${voiceConfig.description}`);
    console.log('[ElevenLabs Agent] Text length:', text.length, 'characters');

    const response = await axios.post(
      `${BASE_URL}/text-to-speech/${voiceConfig.id}`,
      {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,    // 声音稳定性 (0-1)
          similarity_boost: 0.75, // 声音相似度 (0-1)
          style: 0.3,       // 表现力程度 (0-1)
          use_speaker_boost: true // 增强语音清晰度
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer', // 接收二进制数据
        timeout: 30000 // 30秒超时
      }
    );

    console.log('[ElevenLabs Agent] Speech generated successfully');
    return {
      audioBuffer: Buffer.from(response.data),
      voiceUsed: voiceConfig,
      textLength: text.length
    };

  } catch (error) {
    console.error('[ElevenLabs Agent] API Error:', error.response?.data || error.message);
    
    // 提供详细的错误信息
    if (error.response?.status === 401) {
      throw new Error('ElevenLabs API密钥无效或未设置');
    } else if (error.response?.status === 429) {
      throw new Error('ElevenLabs API限额已用完，请检查账户');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('ElevenLabs API请求超时，请检查网络连接');
    }
    
    throw new Error(`语音生成失败: ${error.message}`);
  }
}

/**
 * 生成带提示音的完整访谈音频
 * @param {Array} questions - 访谈问题数组
 * @param {Object} voiceConfig - 声音配置
 * @returns {Promise<Buffer>} - 完整的音频缓冲区
 */
async function generateInterviewAudio(questions, voiceConfig) {
  try {
    console.log('[ElevenLabs Agent] Generating full interview audio with', questions.length, 'questions');
    
    // 将问题数组转换为带编号的文本
    const questionsText = questions.map((q, index) => 
      `问题 ${index + 1}: ${q}. ...（思考暂停）`
    ).join('\n\n');

    // 添加专业开场白
    const fullText = `欢迎使用InsightPilot用户洞察访谈。以下是基于分析生成的深度问题，请仔细思考每个问题。\n\n${questionsText}\n\n访谈结束，感谢您的思考。`;

    return await generateSpeech(fullText, voiceConfig);
    
  } catch (error) {
    console.error('[ElevenLabs Agent] Interview audio generation failed:', error);
    throw error;
  }
}

/**
 * 备用方案：模拟语音生成（用于开发和测试）
 */
async function generateSpeechMock(text, personaSummary = '') {
  console.log('[ElevenLabs Agent] Using mock implementation for development');
  // 返回一个空的缓冲区，但记录语音选择逻辑
  const voiceConfig = selectIntelligentVoice(personaSummary);
  console.log(`[ElevenLabs Agent] Would use voice: ${voiceConfig.description}`);
  
  return {
    audioBuffer: Buffer.from(''), // 空缓冲区
    voiceUsed: voiceConfig,
    textLength: text.length,
    isMock: true
  };
}

module.exports = { 
  generateSpeech, 
  generateSpeechMock, 
  generateInterviewAudio,
  selectIntelligentVoice,
  VOICE_PRESETS 
};
