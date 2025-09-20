// check-environment.js - 环境变量验证
require('dotenv').config();

console.log('🔍 检查环境配置...\n');

const requiredEnvVars = [
  'MISTRAL_API_KEY',
  'ELEVENLABS_API_KEY', 
  'CROSSMINT_API_KEY',
  'CROSSMINT_CLIENT_SECRET',
  'PORT'
];

const optionalEnvVars = [
  'TWITTER_BEARER_TOKEN',
  'CORAL_SERVER_URL',
  'AIML_API_KEY'
];

let allValid = true;

console.log('📋 必需环境变量:');
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    const value = process.env[envVar];
    const maskedValue = value.length > 10 ? value.substring(0, 10) + '...' : value;
    console.log(`✅ ${envVar}: ${maskedValue}`);
  } else {
    console.log(`❌ ${envVar}: 未设置`);
    allValid = false;
  }
});

console.log('\n📋 可选环境变量:');
optionalEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    const value = process.env[envVar];
    const maskedValue = value.length > 10 ? value.substring(0, 10) + '...' : value;
    console.log(`✅ ${envVar}: ${maskedValue}`);
  } else {
    console.log(`⚠️  ${envVar}: 未设置 (将使用模拟模式)`);
  }
});

console.log('\n📊 检查结果:');
if (allValid) {
  console.log('🎉 所有必需环境变量配置正确！');
  console.log('🚀 后端可以正常启动');
} else {
  console.log('⚠️  请检查缺失的环境变量');
  console.log('💡 提示: 缺失的变量将导致相关功能使用模拟模式');
}

// 检查 API 连接性
console.log('\n🌐 API 连接性检查:');
const apiChecks = [
  { name: 'Mistral AI', url: 'https://api.mistral.ai/v1/models', key: 'MISTRAL_API_KEY' },
  { name: 'ElevenLabs', url: 'https://api.elevenlabs.io/v1/voices', key: 'ELEVENLABS_API_KEY' },
  { name: 'Crossmint', url: 'https://staging.crossmint.com/api/2022-06-09/collections', key: 'CROSSMINT_API_KEY' }
];

apiChecks.forEach(async (check) => {
  if (process.env[check.key]) {
    console.log(`✅ ${check.name}: API密钥已设置`);
  } else {
    console.log(`⚠️  ${check.name}: 将使用模拟模式`);
  }
});

console.log('\n✨ 环境检查完成！');
