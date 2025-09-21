require('dotenv').config();
const axios = require('axios');

async function run() {
  const API_BASE = process.env.API_BASE || 'http://127.0.0.1:3001';
  const payload = {
    x_username: 'techinfluencer',
    product_description: 'AI-powered user research platform'
  };

  console.log('🧪 Agent 模式检测测试');
  console.log('📡 POST', `${API_BASE}/api/analyze`);

  try {
    const resp = await axios.post(`${API_BASE}/api/analyze`, payload, {
      timeout: 120000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ 响应成功，状态:', resp.status);
    const modes = resp.data?.data?.agent_modes || {};
    console.log('\n📋 Agent 使用清单 (api/mock):');
    Object.entries(modes).forEach(([k, v]) => {
      console.log(`   - ${k}: ${v}`);
    });

    console.log('\n🔎 关键说明:');
    console.log('   - elevenlabs: 无密钥/失败则为 mock');
    console.log('   - crossmint: 无密钥或智能回退时为 mock');
    console.log('   - twitter: web_scraping 或 twitter_api 视为 api，mock_data 视为 mock');
    console.log('   - mistral: 调用失败回退 mock');

  } catch (e) {
    console.error('❌ 调用失败:', e.response?.data || e.message);
    process.exit(1);
  }
}

run();



