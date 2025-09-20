// test-product-expert.js
require('dotenv').config();
const { conductSimulatedInterviewSmart } = require('./src/agents/productExpertAgent');

// 测试智能对话模拟
console.log('🧪 测试 ProductExpert Agent 智能对话模拟:\n');

const testPersona = 'Techceo User是一位活跃在科技中心的产品经理，专注于AI和用户体验领域，正在构建下一代数字产品。作为San Francisco本地的专业人士，他/她对AI趋势保持高度关注，并通过社交媒体分享行业见解。';
const testProduct = 'AI-powered business intelligence platform for executives';

console.log('📝 测试数据:');
console.log(`   用户画像: ${testPersona.substring(0, 100)}...`);
console.log(`   产品描述: ${testProduct}\n`);

conductSimulatedInterviewSmart(testPersona, testProduct)
  .then(result => {
    console.log('✅ 智能对话模拟结果:');
    console.log(`   是否模拟模式: ${result.isMock ? '是' : '否'}`);
    console.log(`   生成问题数量: ${result.simulationReport.originalQuestions.length}`);
    console.log(`   模拟对话数量: ${result.simulationReport.simulatedDialogues.length}`);
    
    console.log('\n📋 生成的关键问题:');
    result.simulationReport.originalQuestions.forEach((q, index) => {
      console.log(`   ${index + 1}. ${q}`);
    });
    
    console.log('\n💬 模拟对话示例:');
    const firstDialogue = result.simulationReport.simulatedDialogues[0];
    console.log(`   Q: ${firstDialogue.question}`);
    console.log(`   A: ${firstDialogue.answer}`);
    console.log(`   📊 分析: ${firstDialogue.analysis}`);
    
    console.log('\n🎯 战略建议:');
    console.log(`   ${result.simulationReport.strategicAdvice}`);
    
    if (result.isMock) {
      console.log('\nℹ️  当前使用模拟模式，如需真实对话模拟请设置MISTRAL_API_KEY');
    }
  })
  .catch(error => {
    console.log('❌ 智能对话模拟失败:', error.message);
  });
