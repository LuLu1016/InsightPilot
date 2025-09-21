// backend/src/server.js - 精简可用版本
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 导入智能体
const TwitterAgent = require('./agents/twitterAgent');
const { analyzeUserProfile, getMockAnalysis } = require('./agents/mistralAgent');
const { generateInterviewAudio, selectIntelligentVoice } = require('./agents/elevenLabsAgent');
const { mintInsightNFTSmart } = require('./agents/crossmintAgent');
const { conductSimulatedInterviewSmart, generatePersonalizedQuestions, generateComparativeReport } = require('./agents/productExpertAgent');
const { createCoralAgent } = require('./agents/coralAgent');
const { createCoralSession } = require('./agents/coralSessionClient');

const app = express();
const port = process.env.PORT || 3001;

// 中间件 - 最简配置
app.use(cors()); // 允许所有来源访问（开发环境）
app.use(express.json()); // 解析JSON请求体

// 健康检查端点
app.get('/api/health', (req, res) => {
  console.log('✅ Health check received');
  res.json({ 
    success: true, 
    message: 'InsightPilot Server is running!',
    timestamp: new Date().toISOString()
  });
});

// 核心分析端点（集成 Coral Agent 协调）
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

    // 可选：先创建 Coral 会话（官方会话范式）
    const useSessions = String(process.env.CORAL_USE_SESSIONS || 'false').toLowerCase() === 'true';
    let coralSessionId = null;
    if (useSessions) {
      try {
        const session = await createCoralSession();
        coralSessionId = session.sessionId || null;
        console.log(`[Coral] Session created: ${coralSessionId || 'unknown'}`);
      } catch (e) {
        const coralRequired = String(process.env.CORAL_REQUIRED || 'false').toLowerCase() === 'true';
        if (coralRequired) {
          throw new Error(`Coral session creation failed and CORAL_REQUIRED=true: ${e.message}`);
        }
        console.warn('[Coral] Session creation failed:', e.message);
      }
    }

    // 创建 Coral Agent 进行协调
    const coralAgent = await createCoralAgent();
    
    // 使用 Coral Agent 协调完整的分析流程
    const result = await coralAgent.coordinateAnalysis(
      x_username, 
      product_description, 
      async (updateProgress) => {
        // 初始化 Twitter Agent
        const twitterAgent = new TwitterAgent();
        
        // 获取用户数据
        console.log(`🔍 Analyzing user: @${x_username}`);
        const userAnalysis = await twitterAgent.analyzeUser(x_username);
        
        if (!userAnalysis.success) {
          throw new Error(`Failed to analyze user data: ${userAnalysis.error}`);
        }

        // 发送 Twitter 分析进度更新
        await updateProgress('twitter-analysis', userAnalysis.data);

        // 使用 Mistral AI 生成用户画像和访谈问题
        console.log(`🧠 Generating persona and questions with Mistral AI...`);
        let mistralAnalysis;
        try {
          // 准备用户数据文本
          const userDataText = `
            Username: @${userAnalysis.data.user.username}
            Name: ${userAnalysis.data.user.name}
            Description: ${userAnalysis.data.user.description}
            Followers: ${userAnalysis.data.user.followers_count}
            Following: ${userAnalysis.data.user.following_count}
            Tweets: ${userAnalysis.data.user.tweet_count}
            Verified: ${userAnalysis.data.user.verified}
            Location: ${userAnalysis.data.user.location}
            Topics: ${userAnalysis.data.topics.join(', ')}
            Sentiment: ${userAnalysis.data.sentiment.sentiment}
            Activity: ${userAnalysis.data.activity_pattern.tweet_frequency}
            Recent Tweets: ${userAnalysis.data.tweets.map(t => t.text).join(' | ')}
          `;
          
          mistralAnalysis = await analyzeUserProfile(userDataText, product_description);
        } catch (error) {
          console.warn('⚠️  Mistral AI failed, using mock data:', error.message);
          mistralAnalysis = getMockAnalysis(userAnalysis.data, product_description);
        }

        // 发送用户画像生成进度更新
        await updateProgress('persona-generation', mistralAnalysis);

        // 新增：进行模拟访谈 - 革命性功能升级
        console.log(`🎭 Conducting simulated interview with ProductExpert Agent...`);
        let simulationResult = null;
        try {
          simulationResult = await conductSimulatedInterviewSmart(
            mistralAnalysis.persona, 
            product_description
          );
          console.log(`✅ Simulated interview completed successfully`);
        } catch (simulationError) {
          console.warn('⚠️  Simulation failed, continuing without it:', simulationError.message);
          simulationResult = { 
            error: simulationError.message,
            isMock: true,
            simulationReport: {
              originalQuestions: ["Simulation failed"],
              simulatedDialogues: [],
              strategicAdvice: "Unable to generate simulation due to technical issues."
            }
          };
        }

        // 发送模拟访谈进度更新
        await updateProgress('simulation-interview', simulationResult);

        // 智能生成语音
        console.log(`🎤 Generating intelligent voice synthesis...`);
        let audioResult;
        try {
          const voiceConfig = selectIntelligentVoice(mistralAnalysis.persona);
          audioResult = await generateInterviewAudio(mistralAnalysis.interviewQuestions, voiceConfig);
          console.log(`✅ Voice synthesis completed with voice: ${voiceConfig.description}`);
        } catch (error) {
          console.warn('⚠️  ElevenLabs failed, skipping voice synthesis:', error.message);
          audioResult = null;
        }

        // 发送语音合成进度更新
        await updateProgress('voice-synthesis', audioResult);

        // NFT 铸造 - 价值闭环
        console.log(`🎯 Minting InsightPilot NFT...`);
        let nftResult;
        try {
          const reportData = {
            username: x_username,
            productDescription: product_description,
            persona: mistralAnalysis.persona,
            interviewQuestions: mistralAnalysis.interviewQuestions,
            audioResult: audioResult,
            requestId: Date.now()
          };
          
          // 使用默认邮箱进行测试（实际应用中应该从请求中获取）
          const recipientEmail = 'insightpilot@example.com';
          nftResult = await mintInsightNFTSmart(recipientEmail, reportData);
          console.log(`✅ NFT minted successfully: ${nftResult.nftId}`);
        } catch (error) {
          console.warn('⚠️  NFT minting failed, continuing without NFT:', error.message);
          nftResult = null;
        }

        // 发送 NFT 铸造进度更新
        await updateProgress('nft-minting', nftResult);

        // 返回完整的分析结果
        return {
          success: true,
          data: {
            request_id: Date.now(),
            coralSessionId: coralSessionId,
            user: {
              username: x_username,
              product_description: product_description
            },
            twitter_data: userAnalysis.data,
            mistral_analysis: mistralAnalysis,
            simulation: simulationResult, // 新增的模拟访谈数据
            audio: audioResult ? {
              voice: audioResult.voiceUsed.description,
              voiceStyle: audioResult.voiceUsed.style,
              audioFormat: 'audio/mpeg',
              textLength: audioResult.textLength,
              hasAudio: true
            } : {
              hasAudio: false,
              reason: 'Voice synthesis failed or skipped'
            },
            nft: nftResult ? {
              nftId: nftResult.nftId,
              transactionId: nftResult.transactionId,
              explorerUrl: nftResult.explorerUrl,
              recipientEmail: nftResult.recipientEmail,
              collectionId: nftResult.collectionId,
              isMock: nftResult.isMock || false,
              hasNFT: true
            } : {
              hasNFT: false,
              reason: 'NFT minting failed or skipped'
            },
            analysis_status: {
              twitter_analysis: 'completed',
              mistral_analysis: 'completed',
              simulation_interview: simulationResult && !simulationResult.error ? 'completed' : 'failed',
              elevenlabs_synthesis: audioResult ? 'completed' : 'failed',
              crossmint_nft: nftResult ? 'completed' : 'failed'
            },
            next_steps: nftResult ? [
              'Analysis complete! NFT minted successfully.'
            ] : [
              'Retry NFT minting with Crossmint',
              'Check Crossmint API status'
            ]
          },
          message: `Successfully analyzed @${x_username} for product: "${product_description}"`
        };
      }
    );

    console.log('📤 Sending analysis response');
    res.json(result);

  } catch (error) {
    console.error('❌ Error in analysis endpoint:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error during analysis',
      details: error.message
    });
  }
});

// 新增：批量串行用户采访端点
app.post('/api/batch-analyze', async (req, res) => {
  console.log('📥 Received batch analysis request:', req.body);
  
  try {
    const { usernames, product_description } = req.body;
    
    if (!usernames || !Array.isArray(usernames)) {
      return res.status(400).json({
        success: false,
        error: 'usernames must be provided as an array'
      });
    }

    if (!product_description) {
      return res.status(400).json({
        success: false,
        error: 'product_description is required'
      });
    }

    console.log(`🔄 Starting batch analysis for ${usernames.length} users`);
    
    const allResults = [];
    const accumulatedInsights = [];
    const errors = [];

    // 串行处理每个用户
    for (const [index, username] of usernames.entries()) {
      try {
        console.log(`\n--- Processing ${index + 1}/${usernames.length}: @${username} ---`);
        
        // 初始化 Twitter Agent
        const twitterAgent = new TwitterAgent();
        
        // 获取用户数据
        const userAnalysis = await twitterAgent.analyzeUser(username);
        if (!userAnalysis.success) {
          throw new Error(`Failed to analyze user data: ${userAnalysis.error}`);
        }

        // 使用 Mistral AI 生成用户画像和基础问题
        let mistralAnalysis;
        try {
          const userDataText = `
            Username: @${userAnalysis.data.user.username}
            Name: ${userAnalysis.data.user.name}
            Description: ${userAnalysis.data.user.description}
            Followers: ${userAnalysis.data.user.followers_count}
            Following: ${userAnalysis.data.user.following_count}
            Tweets: ${userAnalysis.data.user.tweet_count}
            Verified: ${userAnalysis.data.user.verified}
            Location: ${userAnalysis.data.user.location}
            Topics: ${userAnalysis.data.topics.join(', ')}
            Sentiment: ${userAnalysis.data.sentiment.sentiment}
            Activity: ${userAnalysis.data.activity_pattern.tweet_frequency}
            Recent Tweets: ${userAnalysis.data.tweets.map(t => t.text).join(' | ')}
          `;

          mistralAnalysis = await analyzeUserProfile(userDataText, product_description);
        } catch (error) {
          console.warn('⚠️  Mistral AI failed, using mock data:', error.message);
          mistralAnalysis = getMockAnalysis(userAnalysis.data, product_description);
        }

        // 新增：生成个性化问题（注入历史洞察）
        const personalizedQuestions = await generatePersonalizedQuestions(
          mistralAnalysis.persona,
          accumulatedInsights
        );

        // 使用现有采访功能，但传入个性化问题
        let simulationResult = null;
        try {
          // 修改 conductSimulatedInterviewSmart 以接受个性化问题
          simulationResult = await conductSimulatedInterviewSmart(
            mistralAnalysis.persona,
            product_description
          );
          
          // 如果成功，添加个性化问题到结果中
          if (simulationResult.simulationReport) {
            simulationResult.simulationReport.personalizedQuestions = personalizedQuestions;
          }
          
          console.log(`✅ Simulated interview completed successfully for @${username}`);
        } catch (simulationError) {
          console.warn('⚠️  Simulation failed, continuing without it:', simulationError.message);
          simulationResult = {
            error: simulationError.message,
            isMock: true,
            simulationReport: {
              originalQuestions: personalizedQuestions,
              personalizedQuestions: personalizedQuestions,
              simulatedDialogues: [],
              strategicAdvice: "Unable to generate simulation due to technical issues."
            }
          };
        }

        // 积累洞察用于下一个用户
        if (simulationResult?.simulationReport?.strategicAdvice) {
          accumulatedInsights.push(`@${username}: ${simulationResult.simulationReport.strategicAdvice}`);
        }

        // 智能生成语音（可选）
        let audioResult = null;
        try {
          const voiceConfig = selectIntelligentVoice(mistralAnalysis.persona);
          audioResult = await generateInterviewAudio(mistralAnalysis.interviewQuestions, voiceConfig);
        } catch (error) {
          console.warn('⚠️  ElevenLabs failed, skipping voice synthesis:', error.message);
        }

        allResults.push({
          username,
          success: true,
          profile: mistralAnalysis,
          interview: simulationResult,
          personalizedQuestions,
          audio: audioResult ? {
            voice: audioResult.voiceUsed.description,
            voiceStyle: audioResult.voiceUsed.style,
            hasAudio: true
          } : {
            hasAudio: false,
            reason: 'Voice synthesis failed or skipped'
          }
        });

        // 添加延迟避免速率限制
        if (index < usernames.length - 1) {
          console.log('⏳ Waiting 1.5s before next user...');
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
      } catch (userError) {
        console.error(`❌ Failed to process @${username}:`, userError.message);
        errors.push({ username, error: userError.message });
        allResults.push({ 
          username, 
          success: false, 
          error: userError.message 
        });
      }
    }

    // 生成对比分析报告
    const successfulResults = allResults.filter(r => r.success);
    let comparativeReport = null;
    
    if (successfulResults.length > 1) {
      try {
        comparativeReport = await generateComparativeReport(successfulResults, product_description);
        console.log('✅ Comparative report generated successfully');
      } catch (error) {
        console.warn('⚠️  Comparative report failed:', error.message);
        comparativeReport = {
          error: 'Failed to generate comparative report',
          commonPainPoints: [],
          uniqueInsights: [],
          productOpportunities: [],
          userConflicts: [],
          strategicRecommendations: 'Unable to generate comparative analysis.'
        };
      }
    }

    // 返回响应
    res.json({
      success: true,
      batch_id: Date.now(),
      processed: allResults.length,
      successful: allResults.filter(r => r.success).length,
      failed: errors.length,
      results: allResults,
      accumulatedInsights: accumulatedInsights.slice(-10), // 返回最后10个洞察
      comparativeReport,
      errors: errors.length > 0 ? errors : undefined,
      message: `Batch analysis completed: ${allResults.filter(r => r.success).length}/${allResults.length} users processed successfully`
    });

  } catch (error) {
    console.error('❌ Batch analysis failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Batch processing failed: ' + error.message
    });
  }
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
  console.log('\n===================================');
  console.log(`🚀 InsightPilot Server 启动成功!`);
  console.log(`📍 本地访问: http://localhost:${port}`);
  console.log(`📍 健康检查: http://localhost:${port}/api/health`);
  console.log('===================================\n');
});

// 错误处理
app.on('error', (err) => {
  console.error('❌ 服务器错误:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ 未捕获异常:', err);
});