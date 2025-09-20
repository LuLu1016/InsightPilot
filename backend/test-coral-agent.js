// test-coral-agent.js
require('dotenv').config();
const { createCoralAgent } = require('./src/agents/coralAgent');

async function testCoralAgent() {
  console.log('🧪 Testing Coral Agent Integration\n');
  
  try {
    // 创建 Coral Agent
    const coralAgent = await createCoralAgent();
    
    // 测试分析协调
    const result = await coralAgent.coordinateAnalysis(
      'testuser',
      'AI-powered productivity tool',
      async (updateProgress) => {
        console.log('📊 Progress update received:', updateProgress);
        
        // 模拟分析步骤
        await updateProgress('twitter-analysis', { username: 'testuser', followers_count: 1000 });
        await updateProgress('persona-generation', { persona: 'Test user persona' });
        await updateProgress('simulation-interview', { questions: ['Q1', 'Q2'] });
        await updateProgress('voice-synthesis', { voice: 'test voice' });
        await updateProgress('nft-minting', { nftId: 'test-nft-123' });
        
        return {
          success: true,
          data: {
            username: 'testuser',
            product: 'AI-powered productivity tool',
            coralCoordinated: true
          }
        };
      }
    );
    
    console.log('✅ Coral Agent test successful!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('❌ Coral Agent test failed:', error.message);
  }
}

testCoralAgent();
