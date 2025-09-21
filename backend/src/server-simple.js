// server-simple.js - 简化版服务器，避免Node.js兼容性问题
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查端点
app.get('/api/health', (req, res) => {
  console.log('✅ Health check received');
  res.json({ 
    success: true, 
    message: 'InsightPilot Server is running!',
    timestamp: new Date().toISOString()
  });
});

// 模拟分析端点
app.post('/api/analyze', async (req, res) => {
  console.log('📥 Received analysis request:', req.body);
  
  try {
    const { x_username, product_description } = req.body;
    
    if (!x_username || !product_description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: x_username and product_description'
      });
    }

    // 模拟分析过程
    console.log(`🔍 Analyzing user: ${x_username} for product: ${product_description}`);
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 返回模拟数据
    const mockResult = {
      success: true,
      data: {
        user: x_username,
        product_description: product_description,
        analysis_date: new Date().toISOString(),
        twitter_analysis: {
          userProfile: {
            username: x_username,
            followers: Math.floor(Math.random() * 1000000) + 10000,
            bio: `This is a mock profile for ${x_username}`,
            location: "Mock Location",
            verified: true,
            recentTweets: [
              "Mock tweet 1",
              "Mock tweet 2", 
              "Mock tweet 3"
            ],
            interests: ["Technology", "AI", "Innovation"]
          }
        },
        mistral_analysis: {
          persona: `Mock persona for ${x_username}: A tech-savvy individual interested in innovation and AI.`,
          interviewQuestions: [
            `Mock question 1 for ${product_description}`,
            `Mock question 2 for ${product_description}`,
            `Mock question 3 for ${product_description}`
          ]
        },
        simulation: {
          dialogues: [
            {
              question: `Mock interview question about ${product_description}`,
              answer: `Mock user response for ${x_username}`,
              analysis: "Mock analysis of user response"
            }
          ],
          insights: [
            "Mock insight 1",
            "Mock insight 2",
            "Mock insight 3"
          ]
        },
        elevenlabs_analysis: {
          audioFiles: [
            "mock_question_1.mp3",
            "mock_question_2.mp3",
            "mock_question_3.mp3"
          ],
          voiceQuality: "High quality mock voice synthesis"
        },
        crossmint_analysis: {
          nftMetadata: {
            title: `Mock NFT for ${x_username}`,
            description: `Mock NFT description for ${product_description}`,
            image: "mock_nft_image.png",
            attributes: [
              { trait_type: "User Type", value: "Mock User" },
              { trait_type: "Analysis Date", value: new Date().toISOString().split('T')[0] },
              { trait_type: "Confidence Score", value: "95%" }
            ]
          },
          transactionHash: "0x" + Math.random().toString(16).substr(2, 40)
        }
      }
    };
    
    console.log('✅ Analysis completed successfully');
    res.json(mockResult);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 批量分析端点
app.post('/api/batch-analyze', async (req, res) => {
  console.log('📥 Received batch analysis request:', req.body);
  
  try {
    const { usernames, product_description } = req.body;
    
    if (!usernames || !Array.isArray(usernames) || usernames.length === 0 || !product_description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: usernames (array) and product_description'
      });
    }

    console.log(`🔍 Batch analyzing ${usernames.length} users for product: ${product_description}`);
    
    // 模拟批量分析
    const results = [];
    for (const username of usernames) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟延迟
      results.push({
        username: username,
        status: 'completed',
        analysis: `Mock batch analysis for ${username}`
      });
    }
    
    const mockResult = {
      success: true,
      data: {
        batch_results: results,
        total_users: usernames.length,
        product_description: product_description,
        analysis_date: new Date().toISOString()
      }
    };
    
    console.log('✅ Batch analysis completed successfully');
    res.json(mockResult);
    
  } catch (error) {
    console.error('❌ Batch analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 InsightPilot Server running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/api/health`);
  console.log(`🔍 Analysis endpoint: http://localhost:${port}/api/analyze`);
  console.log(`📊 Batch analysis endpoint: http://localhost:${port}/api/batch-analyze`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});
