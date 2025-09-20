// test-complete.js - 完整后端测试
require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function runCompleteTest() {
  console.log('🧪 开始完整后端测试\n');
  
  const testCases = [
    {
      name: '健康检查',
      url: '/api/health',
      method: 'GET',
      expected: { success: true },
      timeout: 5000
    },
    {
      name: '核心分析功能 - 基础测试',
      url: '/api/analyze',
      method: 'POST',
      data: {
        x_username: "techinfluencer",
        product_description: "AI-powered user research platform"
      },
      expected: { success: true },
      timeout: 60000
    },
    {
      name: '核心分析功能 - 复杂产品',
      url: '/api/analyze',
      method: 'POST',
      data: {
        x_username: "productmanager",
        product_description: "AI-powered multi-agent collaboration platform for enterprise teams"
      },
      expected: { success: true },
      timeout: 60000
    },
    {
      name: '错误处理 - 缺少参数',
      url: '/api/analyze',
      method: 'POST',
      data: {
        x_username: "testuser"
        // 缺少 product_description
      },
      expected: { success: false },
      timeout: 10000
    },
    {
      name: '错误处理 - 空参数',
      url: '/api/analyze',
      method: 'POST',
      data: {
        x_username: "",
        product_description: ""
      },
      expected: { success: false },
      timeout: 10000
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    try {
      console.log(`📋 测试: ${testCase.name}`);
      console.log(`   方法: ${testCase.method} ${testCase.url}`);
      
      const startTime = Date.now();
      const response = await axios({
        method: testCase.method,
        url: `${API_BASE}${testCase.url}`,
        data: testCase.data,
        timeout: testCase.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();

      // 验证响应
      if (response.data.success === testCase.expected.success) {
        console.log('✅ 通过');
        console.log(`   响应时间: ${endTime - startTime}ms`);
        
        if (response.data.data) {
          const data = response.data.data;
          console.log(`   用户: @${data.user?.username || 'N/A'}`);
          console.log(`   产品: ${data.user?.product_description?.substring(0, 50) || 'N/A'}...`);
          
          if (data.mistral_analysis) {
            console.log(`   用户画像: ${data.mistral_analysis.persona ? '已生成' : '未生成'}`);
            console.log(`   访谈问题: ${data.mistral_analysis.interviewQuestions?.length || 0}个`);
          }
          
          if (data.simulation) {
            console.log(`   模拟对话: ${data.simulation.simulationReport ? '已生成' : '未生成'}`);
            console.log(`   战略建议: ${data.simulation.simulationReport?.strategicAdvice ? '已生成' : '未生成'}`);
          }
          
          if (data.audio) {
            console.log(`   语音合成: ${data.audio.hasAudio ? '已生成' : '未生成'}`);
            console.log(`   语音类型: ${data.audio.voiceStyle || 'N/A'}`);
          }
          
          if (data.nft) {
            console.log(`   NFT铸造: ${data.nft.hasNFT ? '已生成' : '未生成'}`);
            console.log(`   NFT ID: ${data.nft.nftId || 'N/A'}`);
          }
          
          if (data.analysis_status) {
            console.log(`   分析状态: ${Object.entries(data.analysis_status).map(([k, v]) => `${k}:${v}`).join(', ')}`);
          }
          
          if (data.coralThreadId) {
            console.log(`   Coral线程: ${data.coralThreadId}`);
            console.log(`   Coral协调: ${data.coralCoordinated ? '是' : '否'}`);
          }
        }
        
        passedTests++;
      } else {
        console.log('❌ 失败 - 响应格式不正确');
        console.log(`   期望: success = ${testCase.expected.success}`);
        console.log(`   实际: success = ${response.data.success}`);
      }

    } catch (error) {
      if (testCase.expected.success === false) {
        // 对于期望失败的测试，错误是正常的
        console.log('✅ 通过 (预期错误)');
        console.log(`   错误: ${error.response?.data?.error || error.message}`);
        passedTests++;
      } else {
        console.log('❌ 失败 - 意外错误');
        console.log(`   错误: ${error.response?.data?.error || error.message}`);
        if (error.code === 'ECONNREFUSED') {
          console.log('   💡 提示: 请确保服务器正在运行 (node src/server.js)');
        }
      }
    }
    console.log('---');
  }

  // 测试总结
  console.log('\n📊 测试总结:');
  console.log(`✅ 通过: ${passedTests}/${totalTests}`);
  console.log(`❌ 失败: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！后端API完全可靠');
    console.log('🚀 可以进入部署阶段');
  } else {
    console.log('⚠️  部分测试失败，请检查并修复问题');
    console.log('💡 建议: 检查服务器日志和API连接');
  }

  return passedTests === totalTests;
}

// 运行测试
runCompleteTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ 测试运行失败:', error.message);
    process.exit(1);
  });
