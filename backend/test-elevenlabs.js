// test-elevenlabs.js
require('dotenv').config();
const { selectIntelligentVoice, VOICE_PRESETS, generateSpeech } = require('./src/agents/elevenLabsAgent');

// 测试智能语音选择
console.log('🧪 测试智能语音选择逻辑:\n');

const testPersonas = [
  '科技公司CEO，资深行业专家，决策者',
  '创意设计师，艺术总监，创新思维',
  '软件工程师，技术主管，数据分析',
  '市场营销经理，品牌策略'
];

testPersonas.forEach(persona => {
  const selectedVoice = selectIntelligentVoice(persona);
  console.log(`📝 Persona: "${persona}"`);
  console.log(`   🎤 Selected: ${selectedVoice.description}`);
  console.log(`   🎯 Style: ${selectedVoice.style}\n`);
});

// 测试实际语音生成（如果有API密钥）
if (process.env.ELEVENLABS_API_KEY) {
  console.log('🎧 测试实际语音生成...');
  generateSpeech('你好，这是InsightPilot语音合成测试。智能语音选择功能已成功启用！', VOICE_PRESETS.RACHEL)
    .then(result => {
      console.log('✅ 语音生成成功！');
      console.log(`   声音: ${result.voiceUsed.description}`);
      console.log(`   文本长度: ${result.textLength} 字符`);
      // 可以在这里保存音频文件: require('fs').writeFileSync('test.mp3', result.audioBuffer);
    })
    .catch(error => {
      console.log('❌ 语音生成失败:', error.message);
    });
} else {
  console.log('ℹ️  未设置ELEVENLABS_API_KEY，跳过实际API测试');
}
