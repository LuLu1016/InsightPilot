// test-batch.js - 批量串行用户采访测试
require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testBatchAnalysis() {
  console.log('🧪 测试新的批量分析端点...\n');
  
  try {
    console.log('📋 发送批量分析请求...');
    const response = await axios.post(`${API_BASE}/api/batch-analyze`, {
      usernames: ['techinfluencer', 'startupfounder', 'productmanager'],
      product_description: 'AI-powered user research platform'
    }, { 
      timeout: 180000, // 3分钟超时
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ 批量分析成功！');
    console.log(`📊 处理结果:`);
    console.log(`   批次ID: ${response.data.batch_id}`);
    console.log(`   总用户数: ${response.data.processed}`);
    console.log(`   成功处理: ${response.data.successful}`);
    console.log(`   失败数量: ${response.data.failed}`);
    console.log(`   积累洞察: ${response.data.accumulatedInsights?.length || 0}个`);
    
    if (response.data.comparativeReport) {
      console.log('\n📈 对比分析报告:');
      console.log(`   共同痛点: ${response.data.comparativeReport.commonPainPoints?.length || 0}个`);
      console.log(`   独特洞察: ${response.data.comparativeReport.uniqueInsights?.length || 0}个`);
      console.log(`   产品机会: ${response.data.comparativeReport.productOpportunities?.length || 0}个`);
      console.log(`   用户冲突: ${response.data.comparativeReport.userConflicts?.length || 0}个`);
    }

    console.log('\n👥 用户处理详情:');
    response.data.results.forEach((result, index) => {
      console.log(`   ${index + 1}. @${result.username}: ${result.success ? '✅ 成功' : '❌ 失败'}`);
      if (result.success) {
        console.log(`      个性化问题: ${result.personalizedQuestions?.length || 0}个`);
        console.log(`      用户画像: ${result.profile?.persona ? '已生成' : '未生成'}`);
        console.log(`      模拟对话: ${result.interview?.simulationReport ? '已生成' : '未生成'}`);
        console.log(`      语音合成: ${result.audio?.hasAudio ? '已生成' : '未生成'}`);
      } else {
        console.log(`      错误: ${result.error}`);
      }
    });

    if (response.data.errors && response.data.errors.length > 0) {
      console.log('\n❌ 错误详情:');
      response.data.errors.forEach(error => {
        console.log(`   @${error.username}: ${error.error}`);
      });
    }

    console.log(`\n🎉 批量分析完成！消息: ${response.data.message}`);
    
  } catch (error) {
    console.log('❌ 批量测试失败:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 提示: 请确保服务器正在运行 (node src/server.js)');
    } else if (error.code === 'ECONNABORTED') {
      console.log('💡 提示: 请求超时，批量分析可能需要更长时间');
    }
  }
}

async function testErrorHandling() {
  console.log('\n🧪 测试错误处理...\n');
  
  const errorTests = [
    {
      name: '缺少 usernames 参数',
      data: { product_description: 'test product' },
      expectedError: 'usernames must be provided as an array'
    },
    {
      name: 'usernames 不是数组',
      data: { usernames: 'not-an-array', product_description: 'test product' },
      expectedError: 'usernames must be provided as an array'
    },
    {
      name: '缺少 product_description',
      data: { usernames: ['user1', 'user2'] },
      expectedError: 'product_description is required'
    }
  ];

  for (const test of errorTests) {
    try {
      console.log(`📋 测试: ${test.name}`);
      const response = await axios.post(`${API_BASE}/api/batch-analyze`, test.data, {
        timeout: 10000
      });
      
      if (response.data.success === false && response.data.error === test.expectedError) {
        console.log('✅ 通过 - 正确返回错误');
      } else {
        console.log('❌ 失败 - 错误处理不正确');
        console.log(`   期望: ${test.expectedError}`);
        console.log(`   实际: ${response.data.error}`);
      }
    } catch (error) {
      console.log('❌ 失败 - 意外错误:', error.response?.data?.error || error.message);
    }
    console.log('---');
  }
}

async function runAllTests() {
  console.log('🚀 开始批量分析功能测试\n');
  
  // 测试正常功能
  await testBatchAnalysis();
  
  // 测试错误处理
  await testErrorHandling();
  
  console.log('\n✨ 所有测试完成！');
}

// 运行测试
runAllTests().catch(console.error);
