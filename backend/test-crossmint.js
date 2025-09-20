// test-crossmint.js
require('dotenv').config();
const { mintInsightNFTSmart, buildNFTMetadata, NFT_METADATA_TEMPLATE } = require('./src/agents/crossmintAgent');

// 测试NFT元数据构建
console.log('🧪 测试NFT元数据构建:\n');

const testReportData = {
  username: 'techceo',
  productDescription: 'AI-powered business intelligence platform',
  persona: 'Techceo User是一位活跃在科技中心的产品经理，专注于AI和用户体验领域，正在构建下一代数字产品。',
  interviewQuestions: [
    '作为产品经理，您在评估AI驱动的业务智能平台时，最看重哪些核心功能？',
    '您提到正在开发能够革命性改变用户入职流程的功能，您认为AI在用户体验优化中的作用是什么？',
    '在您的产品开发过程中，您如何平衡用户反馈与技术创新？'
  ],
  audioResult: {
    voiceUsed: { description: '深沉、权威、自信的男声', style: 'authoritative' },
    textLength: 409
  },
  requestId: Date.now()
};

const metadata = buildNFTMetadata(testReportData);
console.log('📝 构建的NFT元数据:');
console.log(JSON.stringify(metadata, null, 2));

// 测试智能NFT铸造
console.log('\n🎯 测试智能NFT铸造...');

mintInsightNFTSmart('test@example.com', testReportData)
  .then(result => {
    console.log('✅ NFT铸造结果:');
    console.log(`   NFT ID: ${result.nftId}`);
    console.log(`   交易ID: ${result.transactionId}`);
    console.log(`   浏览器链接: ${result.explorerUrl}`);
    console.log(`   接收邮箱: ${result.recipientEmail}`);
    console.log(`   是否模拟: ${result.isMock ? '是' : '否'}`);
    
    if (result.isMock) {
      console.log('\nℹ️  当前使用模拟模式，如需真实铸造请设置CROSSMINT_API_KEY');
    }
  })
  .catch(error => {
    console.log('❌ NFT铸造失败:', error.message);
  });
