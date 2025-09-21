import React, { useState, useEffect } from 'react'
import { postJSON } from './api/client'

// 下载报告功能 - 包含Insight和Strategy
function downloadReport(result) {
  const reportContent = `
# InsightPilot 用户分析报告

## 📊 基本信息
- **用户**: ${result.data.user}
- **产品**: ${result.data.product}
- **分析时间**: ${new Date(result.data.analysisDate).toLocaleString()}
- **推文数量**: ${result.data.twitter_analysis.recentTweets.length}

## 👤 用户Profile画像
- **用户名**: ${result.data.twitter_analysis.username}
- **粉丝数**: ${result.data.twitter_analysis.followers}
- **简介**: ${result.data.twitter_analysis.bio}
- **位置**: ${result.data.twitter_analysis.location}
- **认证状态**: ${result.data.twitter_analysis.verified ? '已认证' : '未认证'}
- **参与度**: ${result.data.twitter_analysis.engagementRate}%
- **兴趣领域**: ${result.data.twitter_analysis.interests ? result.data.twitter_analysis.interests.join(', ') : 'N/A'}

## 💬 5个问题 & 5个回答
${result.data.simulation.dialogues.map((dialogue, index) => `
### 问题 ${index + 1}
**Q**: ${dialogue.question}
**A**: ${dialogue.answer}
**分析**: ${dialogue.analysis}
`).join('')}

## 🔍 用户Insights洞察
基于以上分析，我们得出以下关键洞察：

### 用户特征
- **技术接受度**: ${result.data.twitter_analysis.interests && result.data.twitter_analysis.interests.includes('technology') ? '高' : '中等'}
- **购买意向**: ${result.data.simulation.dialogues.some(d => d.answer.includes('购买') || d.answer.includes('考虑')) ? '强烈' : '一般'}
- **价格敏感度**: ${result.data.simulation.dialogues.some(d => d.answer.includes('价格') || d.answer.includes('预算')) ? '高' : '中等'}

### 行为模式
- **关注重点**: 实用性、效率、创新技术
- **决策因素**: 价格合理性、性能表现、便利性
- **担忧点**: 充电基础设施、维修保养便利性

## 📈 营销策略建议

### 目标定位
- **核心用户群体**: 技术爱好者、追求效率的用户
- **价格策略**: 提供分期付款或租赁选项
- **功能强调**: 自动驾驶、续航里程、创新设计

### 营销渠道
- **社交媒体**: 重点在Twitter/X平台
- **内容策略**: 强调技术创新和实用性
- **KOL合作**: 寻找技术类意见领袖

### 产品优化建议
- **充电网络**: 加强充电基础设施建设宣传
- **售后服务**: 提供便捷的维修保养服务
- **价格透明**: 提供清晰的价格结构和优惠政策

---
*报告由 InsightPilot AI 生成 - 包含用户画像、问答分析、语音合成、NFT生成和策略建议*`
  
  const blob = new Blob([reportContent], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `InsightPilot_${result.data.user}_${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 下载单个音频
function downloadAudio(audioUrl, filename) {
  const a = document.createElement('a')
  a.href = audioUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// 下载所有音频
function downloadAllAudio(audioFiles) {
  audioFiles.forEach((file, index) => {
    setTimeout(() => {
      const filename = typeof file === 'string' ? file : file.filename
      const audioUrl = typeof file === 'string' ? file : file.url || `data:audio/mp3;base64,${file.content}`
      downloadAudio(audioUrl, filename || `audio_${index + 1}.mp3`)
    }, index * 500) // 延迟500ms避免浏览器阻止多个下载
  })
}

function App() {
  // 状态管理
  const [inputType, setInputType] = useState('link')
  const [username, setUsername] = useState('')
  const [userPosts, setUserPosts] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [simulationDialogues, setSimulationDialogues] = useState([])
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0)
  const [isShowingDialogue, setIsShowingDialogue] = useState(false)
  const [agentOutputs, setAgentOutputs] = useState({})
  const [result, setResult] = useState(null)

  // Preset dialogue data
  const presetDialogues = {
    preset1: {
      user: "Elon Musk",
      product: "iPhone",
      intro: "Hello Elon, thanks for joining. We'd love to understand your experience with the iPhone and how it impacts your daily productivity.",
      dialogues: [
        {
          question: "When using the iPhone for your daily communication, what do you find most efficient or limiting?",
          answer: "It's smooth for quick communication, but I find its closed ecosystem restrictive compared to other platforms.",
          analysis: "Values efficiency but frustrated by limitations"
        },
        {
          question: "How well does the iPhone support your need for cross-device workflows between Tesla, SpaceX, and your personal tools?",
          answer: "It integrates nicely with Apple products, but it doesn't connect easily with non-Apple systems, which slows me down.",
          analysis: "Cross-platform integration is a key pain point"
        },
        {
          question: "From your perspective, does the iPhone's design balance usability with the flexibility you need as a power user?",
          answer: "It's beautifully designed, but lacks customization — I'd like more control at the system level.",
          analysis: "Appreciates design but craves deeper control"
        },
        {
          question: "How important is security versus flexibility in your choice of smartphone?",
          answer: "Security is solid, but I'd sacrifice some of it for greater flexibility in how I use the device.",
          analysis: "Prioritizes flexibility over security constraints"
        },
        {
          question: "If Apple asked you for one recommendation to make the iPhone more valuable for you, what would it be?",
          answer: "Give me more openness and advanced features, even if that means complexity — that's what drives real innovation.",
          analysis: "Seeks openness and complexity for innovation"
        }
      ],
      persona: "Visionary technologist, values openness, cross-platform integration, and advanced control.",
      opportunities: "Emphasize efficiency, pro-level customization, and interoperability with broader ecosystems.",
      risks: "High skepticism toward closed design; must demonstrate that control and innovation are not compromised.",
      userInsights: {
        technologyAdoption: "Very high; eager to try new features and bold innovations, but resistant to closed ecosystems.",
        purchaseIntention: "Present, but conditional on greater freedom and cross-platform compatibility.",
        priceSensitivity: "Low; focuses more on whether features and performance support innovation."
      },
      marketingStrategy: {
        targetPositioning: "Aim at tech professionals, early adopters, and creators; position iPhone as a \"Pro-level productivity tool.\"",
        marketingChannels: "Focus on tech media, industry conferences, and platforms like X/Twitter where thought leaders gather.",
        pricingStrategy: "Premium pricing, but add optional advanced features/subscription services to emphasize flexibility."
      }
    },
    preset2: {
      user: "Tim Cook",
      product: "Cybertruck",
      intro: "Hi Tim, thank you for your time. We'd love to hear your perspective on the Cybertruck as a product and how you think consumers will respond to it.",
      dialogues: [
        {
          question: "From a consumer perspective, what's the first impression the Cybertruck gives you — appealing or intimidating?",
          answer: "It's bold and attention-grabbing, but that could make it harder for mainstream consumers to adopt.",
          analysis: "Concerned about mainstream adoption barriers"
        },
        {
          question: "How do you feel the Cybertruck balances futuristic design with everyday usability?",
          answer: "The courage in design is impressive, but it leans more toward shock value than Apple's usual elegance.",
          analysis: "Values elegant design over shock value"
        },
        {
          question: "Do you see consumers valuing the Cybertruck more for its utility or for its status as an innovation symbol?",
          answer: "Both matter, but the sustainability angle is what will resonate most strongly with buyers.",
          analysis: "Identifies sustainability as key value driver"
        },
        {
          question: "In your view, what signals would show that the Cybertruck has crossed from niche excitement to mass-market adoption?",
          answer: "It needs to prove it's more than just a truck — it should fit into a broader ecosystem, much like Apple products do.",
          analysis: "Emphasizes ecosystem thinking for mass adoption"
        },
        {
          question: "If Apple were to design a vehicle, what principles would you carry over that you feel are missing in the Cybertruck?",
          answer: "I'd focus on usability and simplicity, ensuring futuristic ambition doesn't overwhelm the consumer experience.",
          analysis: "Prioritizes usability and simplicity in design"
        }
      ],
      persona: "Strategic operator, cautious about radical design, focused on mainstream adoption and brand coherence.",
      opportunities: "Leverage sustainability narrative, ecosystem integration, and design refinement for broader acceptance.",
      risks: "Overemphasis on bold aesthetics without usability risks alienating the wider market.",
      userInsights: {
        technologyAdoption: "Medium-high; appreciates cutting-edge design but emphasizes balance with everyday usability.",
        purchaseIntention: "Strong if the product proves to be practical and not just hype.",
        priceSensitivity: "Moderate; willing to pay for sustainability and ecosystem value, but cautious of excessive premiums."
      },
      marketingStrategy: {
        targetPositioning: "Aim at eco-conscious, tech-savvy, and lifestyle-upgrading mid-to-high-end consumers.",
        marketingChannels: "Prioritize brand launch events, mainstream media, and lifestyle-driven platforms like YouTube/Instagram.",
        pricingStrategy: "Maintain mid-to-high price range, but lower the entry barrier with financing plans or leasing options."
      }
    }
  }

  // Default mock dialogues (kept for backward compatibility)
  const mockDialogues = presetDialogues.preset1.dialogues

  // 实时播报对话效果
  useEffect(() => {
    if (isShowingDialogue && simulationDialogues.length > 0) {
      const timer = setTimeout(() => {
        if (currentDialogueIndex < simulationDialogues.length - 1) {
          setCurrentDialogueIndex(currentDialogueIndex + 1)
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentDialogueIndex, isShowingDialogue, simulationDialogues.length])

  // 模糊匹配函数
  const fuzzyMatch = (input, target) => {
    const inputLower = input.toLowerCase().trim()
    const targetLower = target.toLowerCase().trim()
    
    // 直接匹配
    if (inputLower.includes(targetLower) || targetLower.includes(inputLower)) {
      return true
    }
    
    // 去除特殊字符匹配
    const cleanInput = inputLower.replace(/[@\s\-_.]/g, '')
    const cleanTarget = targetLower.replace(/[@\s\-_.]/g, '')
    
    return cleanInput.includes(cleanTarget) || cleanTarget.includes(cleanInput)
  }

  // 智能匹配预设
  const findMatchingPreset = (username, product) => {
    // 检查Elon Musk + iPhone组合
    const elonMatches = [
      'elon', 'musk', 'elonmusk', '@elonmusk', 'elon musk'
    ]
    const iphoneMatches = [
      'iphone', 'apple phone', 'ios', 'apple'
    ]
    
    // 检查Tim Cook + Cybertruck组合  
    const timMatches = [
      'tim', 'cook', 'timcook', '@tim_cook', 'tim cook'
    ]
    const cybertruckMatches = [
      'cybertruck', 'cyber truck', 'tesla truck', 'tesla cybertruck'
    ]
    
    const userMatched1 = elonMatches.some(match => fuzzyMatch(username, match))
    const productMatched1 = iphoneMatches.some(match => fuzzyMatch(product, match))
    
    const userMatched2 = timMatches.some(match => fuzzyMatch(username, match))
    const productMatched2 = cybertruckMatches.some(match => fuzzyMatch(product, match))
    
    if (userMatched1 && productMatched1) {
      return 'preset1'
    } else if (userMatched2 && productMatched2) {
      return 'preset2'
    }
    
    return null
  }

  // 处理智能分析
  const handleSmartAnalysis = async (e) => {
    e.preventDefault()
    
    console.log('🚀 Starting smart analysis')
    console.log('📝 Input:', { username, productDescription })
    
    // 验证输入
    if (!username.trim()) {
      alert('Please enter X username')
      return
    }
    if (!productDescription.trim()) {
      alert('Please enter product name')
      return
    }
    
    // 智能匹配预设
    const matchedPreset = findMatchingPreset(username, productDescription)
    
    if (matchedPreset) {
      console.log('✅ Found matching preset:', matchedPreset)
      await handlePresetAnalysis(matchedPreset)
    } else {
      alert(`Sorry, no matching analysis found for "${username}" + "${productDescription}". Try: Elon Musk + iPhone, or Tim Cook + Cybertruck`)
    }
  }

  // 处理预设分析
  const handlePresetAnalysis = async (presetKey) => {
    console.log('🚀 Starting preset analysis:', presetKey)
    
    const preset = presetDialogues[presetKey]
    
    // 立即设置所有状态
    setIsAnalyzing(true)
    setProgress(0)
    setCurrentStep('initializing')
    setSimulationDialogues(preset.dialogues)
    setIsShowingDialogue(true)
    setCurrentDialogueIndex(0)
    setAgentOutputs({})
    setResult(null)
    
    console.log('✅ Preset analysis started for:', preset.user, '+', preset.product)
    
    try {
      // 完全模拟分析流程，无需后端API
      setTimeout(() => {
        setCurrentStep('1️⃣ User Profile Analysis')
        setProgress(20)
        setAgentOutputs(prev => ({ ...prev, twitter: { user: preset.user, product: preset.product } }))
      }, 1000)
      
      setTimeout(() => {
        setCurrentStep('2️⃣ Generate 5 Questions')
        setProgress(40)
        setAgentOutputs(prev => ({ ...prev, mistral: preset }))
      }, 3000)
      
      setTimeout(() => {
        setCurrentStep('3️⃣ Simulate 5 User Answers')
        setProgress(60)
        setAgentOutputs(prev => ({ ...prev, simulation: preset }))
      }, 5000)
      
      setTimeout(() => {
        setCurrentStep('4️⃣ ElevenLabs Voice Synthesis')
        setProgress(80)
        setAgentOutputs(prev => ({ ...prev, elevenlabs: { hasAudio: false } }))
      }, 7000)
      
      setTimeout(() => {
        setCurrentStep('5️⃣ NFT Generation')
        setProgress(90)
        setAgentOutputs(prev => ({ ...prev, crossmint: { hasNFT: false } }))
      }, 9000)
      
      setTimeout(() => {
        setCurrentStep('6️⃣ User Report Generation')
        setProgress(100)
        setIsAnalyzing(false)
        setCurrentStep('')
        setIsShowingDialogue(false)
        
        // 格式化预设数据以匹配结果显示格式
        const formattedData = {
          data: {
            user: preset.user,
            product: preset.product,
            analysisDate: new Date().toISOString(),
            intro: preset.intro,
            twitter_analysis: {
              username: preset.user.toLowerCase().replace(' ', ''),
              followers: Math.floor(Math.random() * 100000) + 10000,
              bio: `${preset.user} - Technology Leader`,
              location: 'California, USA',
              verified: true,
              engagementRate: Math.round(Math.random() * 10 + 5),
              interests: ['technology', 'innovation', 'business'],
              recentTweets: preset.dialogues.map(d => d.question.substring(0, 100) + '...')
            },
            simulation: {
              dialogues: preset.dialogues
            },
            elevenlabs_analysis: {
              audioFiles: []
            },
            crossmint_analysis: {
              nftMetadata: {
                title: `InsightPilot Analysis - ${preset.user}`,
                description: `User analysis NFT for ${preset.product}`
              }
            },
            ai_analysis: {
              persona: preset.persona,
              opportunities: preset.opportunities,
              risks: preset.risks
            },
            user_insights: preset.userInsights,
            marketing_strategy: preset.marketingStrategy
          }
        }
        
        setResult(formattedData)
      }, 11000)
      
    } catch (error) {
      console.error('❌ Preset analysis failed:', error)
      alert(`Analysis failed: ${error.message}`)
      setIsAnalyzing(false)
      setIsShowingDialogue(false)
      setCurrentStep('')
      setProgress(0)
    }
  }

  // 处理表单提交 (隐藏但保留)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('🚀 开始分析')
    console.log('📝 输入:', { inputType, username, userPosts, productDescription })
    
    // Validate input
    if (inputType === 'link' && !username.trim()) {
      alert('Please enter X username or link')
      return
    }
    if (inputType === 'posts' && !userPosts.trim()) {
      alert('Please paste user post content')
      return
    }
    if (!productDescription.trim()) {
      alert('Please enter product description')
      return
    }
    
    // 立即设置所有状态
    setIsAnalyzing(true)
    setProgress(0)
    setCurrentStep('twitter')
    setSimulationDialogues(mockDialogues)
    setIsShowingDialogue(true)
    setCurrentDialogueIndex(0)
    setAgentOutputs({})
    setResult(null)
    
    console.log('✅ 实时播报状态已设置')
    
    try {
      console.log('🌐 调用API...')
      const data = await postJSON('/analyze', {
        x_username: inputType === 'link' ? username : 'test_user',
        product_description: productDescription
      })
      console.log('📊 API响应数据:', data)
      
      // 重新组织的工作流播报顺序
      setTimeout(() => {
        setCurrentStep('1️⃣ User Profile Analysis')
        setProgress(20)
        setAgentOutputs(prev => ({ ...prev, twitter: data.data.twitter_data }))
      }, 1000)
      
      setTimeout(() => {
        setCurrentStep('2️⃣ Generate 5 Questions')
        setProgress(40)
        setAgentOutputs(prev => ({ ...prev, mistral: data.data.mistral_analysis }))
      }, 3000)
      
      setTimeout(() => {
        setCurrentStep('3️⃣ Simulate 5 User Answers')
        setProgress(60)
        setAgentOutputs(prev => ({ ...prev, simulation: data.data.simulation }))
      }, 5000)
      
      setTimeout(() => {
        setCurrentStep('4️⃣ ElevenLabs Voice Synthesis')
        setProgress(80)
        setAgentOutputs(prev => ({ ...prev, elevenlabs: data.data.audio }))
      }, 7000)
      
      setTimeout(() => {
        setCurrentStep('5️⃣ NFT Generation')
        setProgress(90)
        setAgentOutputs(prev => ({ ...prev, crossmint: data.data.nft }))
      }, 9000)
      
      setTimeout(() => {
        setCurrentStep('6️⃣ User Report Generation')
        setProgress(100)
        setIsAnalyzing(false)
        setCurrentStep('')
        setIsShowingDialogue(false)
        
        // 转换数据格式以匹配前端期望
        const formattedData = {
          data: {
            user: data.data.user.username,
            product: data.data.user.product_description,
            analysisDate: new Date().toISOString(),
            twitter_analysis: {
              username: data.data.twitter_data.user.username,
              followers: data.data.twitter_data.user.followers_count,
              bio: data.data.twitter_data.user.description,
              location: data.data.twitter_data.user.location,
              verified: data.data.twitter_data.user.verified,
              engagementRate: Math.round(Math.random() * 10 + 5),
              interests: data.data.topics || ['technology', 'product'],
              recentTweets: data.data.twitter_data.tweets.map(t => t.text)
            },
            simulation: {
              dialogues: mockDialogues
            },
            elevenlabs_analysis: {
              audioFiles: data.data.audio?.hasAudio ? ['mock_audio_1.mp3', 'mock_audio_2.mp3'] : []
            },
            crossmint_analysis: {
              nftMetadata: {
                title: `InsightPilot Analysis - ${data.data.user.username}`,
                description: `User analysis NFT for ${data.data.user.product_description}`
              }
            }
          }
        }
        
        setResult(formattedData)
      }, 11000)
      
    } catch (error) {
      console.error('❌ API调用失败:', error)
      alert(`Analysis failed: ${error.message}`)
      setIsAnalyzing(false)
      setIsShowingDialogue(false)
      setCurrentStep('')
      setProgress(0)
    }
  }

  // 重置表单
  const resetForm = () => {
    setInputType('link')
    setUsername('')
    setUserPosts('')
    setProductDescription('')
    setIsAnalyzing(false)
    setProgress(0)
    setCurrentStep('')
    setSimulationDialogues([])
    setCurrentDialogueIndex(0)
    setIsShowingDialogue(false)
    setAgentOutputs({})
    setResult(null)
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(255, 119, 48, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 193, 7, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255, 87, 34, 0.2) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />
      
      {/* 标题 */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '50px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
          transform: 'perspective(1000px) rotateX(5deg)',
          marginBottom: '20px'
        }}>
          <h1 style={{ 
            background: 'linear-gradient(45deg, #ff6b35, #f7931e, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '4rem', 
            marginBottom: '15px',
            fontWeight: '900',
            textShadow: '0 0 30px rgba(255, 107, 53, 0.5)',
            letterSpacing: '-0.02em',
            fontFamily: "'Space Grotesk', sans-serif"
          }}>
            🚀 InsightPilot
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            fontSize: '1.4rem',
            margin: 0,
            fontWeight: '500',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}>
            ✨ AI-Powered User Insight Analysis Platform
          </p>
        </div>
      </div>
      
      {/* 智能分析表单 */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '40px', 
        borderRadius: '25px', 
        boxShadow: '0 30px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.2)',
        marginBottom: '40px',
        position: 'relative',
        zIndex: 1,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        transform: 'perspective(1000px) rotateX(2deg)',
        transition: 'all 0.3s ease'
      }}>
        <form onSubmit={handleSmartAnalysis}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '20px', 
              fontWeight: '700',
              fontSize: '1.6rem',
              background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center'
            }}>
              🎯 Smart Analysis Input
            </label>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '30px',
            marginBottom: '30px'
          }}>
            {/* X用户名输入 */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '15px', 
                fontWeight: '700',
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                👤 X Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="X Username"
                style={{
                  width: '100%',
                  padding: '20px',
                  border: '3px solid rgba(255, 107, 53, 0.3)',
                  borderRadius: '20px',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                  fontWeight: '500'
                }}
                disabled={isAnalyzing}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff6b35'
                  e.target.style.boxShadow = '0 15px 35px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'translateY(-2px)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 107, 53, 0.3)'
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
                  e.target.style.transform = 'translateY(0)'
                }}
              />
            </div>

            {/* 产品名输入 */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '15px', 
                fontWeight: '700',
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🎯 Product Name
              </label>
              <input
                type="text"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Product Description"
                style={{
                  width: '100%',
                  padding: '20px',
                  border: '3px solid rgba(255, 107, 53, 0.3)',
                  borderRadius: '20px',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                  fontWeight: '500'
                }}
                disabled={isAnalyzing}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff6b35'
                  e.target.style.boxShadow = '0 15px 35px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'translateY(-2px)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 107, 53, 0.3)'
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
                  e.target.style.transform = 'translateY(0)'
                }}
              />
            </div>
          </div>
          
          {/* 提交按钮 */}
          <div style={{ 
            display: 'flex', 
            gap: '20px',
            justifyContent: 'center',
            marginTop: '20px'
          }}>
            <button
              type="submit"
              disabled={isAnalyzing || !username.trim() || !productDescription.trim()}
              style={{
                flex: 1,
                maxWidth: '300px',
                padding: '20px 40px',
                borderRadius: '25px',
                border: 'none',
                background: isAnalyzing 
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                  : 'linear-gradient(135deg, #ff6b35, #f7931e, #ffd700)',
                color: 'white',
                fontSize: '1.3rem',
                fontWeight: '700',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isAnalyzing 
                  ? 'none' 
                  : '0 20px 40px rgba(255, 107, 53, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                transform: isAnalyzing ? 'none' : 'perspective(1000px) rotateX(5deg)',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                letterSpacing: '0.5px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isAnalyzing) {
                  e.target.style.transform = 'perspective(1000px) rotateX(8deg) scale(1.05)'
                  e.target.style.boxShadow = '0 25px 50px rgba(255, 107, 53, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isAnalyzing) {
                  e.target.style.transform = 'perspective(1000px) rotateX(5deg) scale(1)'
                  e.target.style.boxShadow = '0 20px 40px rgba(255, 107, 53, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              {isAnalyzing ? '🔄 Analyzing...' : '🚀 Start Smart Analysis'}
            </button>
            
            <button
              type="button"
              onClick={resetForm}
              disabled={isAnalyzing}
              style={{
                padding: '20px 30px',
                borderRadius: '25px',
                border: '3px solid rgba(255, 107, 53, 0.3)',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                color: '#ff6b35',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                transform: 'perspective(1000px) rotateX(3deg)'
              }}
              onMouseEnter={(e) => {
                if (!isAnalyzing) {
                  e.target.style.borderColor = '#ff6b35'
                  e.target.style.boxShadow = '0 15px 35px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'perspective(1000px) rotateX(5deg) scale(1.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isAnalyzing) {
                  e.target.style.borderColor = 'rgba(255, 107, 53, 0.3)'
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
                  e.target.style.transform = 'perspective(1000px) rotateX(3deg) scale(1)'
                }
              }}
            >
              🔄 Reset
            </button>
          </div>
        </form>
      </div>

      {/* 隐藏的主表单 - 保留但不显示 */}
      <div style={{ 
        display: 'none', // 隐藏但保留代码
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '40px', 
        borderRadius: '25px', 
        boxShadow: '0 30px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.2)',
        marginBottom: '40px',
        position: 'relative',
        zIndex: 1,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        transform: 'perspective(1000px) rotateX(2deg)',
        transition: 'all 0.3s ease'
      }}>
        <form onSubmit={handleSubmit}>
          {/* 输入方式选择 */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '20px', 
              fontWeight: '700',
              fontSize: '1.3rem',
              background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center'
            }}>
              🎯 Select Input Method
            </label>
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              marginBottom: '25px',
              justifyContent: 'center'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px', 
                padding: '20px 30px', 
                border: `3px solid ${inputType === 'link' ? '#ff6b35' : 'rgba(255, 107, 53, 0.3)'}`,
                borderRadius: '20px',
                cursor: 'pointer',
                background: inputType === 'link' 
                  ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))' 
                  : 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease',
                fontSize: '1.1rem',
                fontWeight: '600',
                boxShadow: inputType === 'link' 
                  ? '0 15px 35px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                  : '0 8px 25px rgba(0, 0, 0, 0.1)',
                transform: inputType === 'link' ? 'translateY(-2px) scale(1.02)' : 'translateY(0)',
                backdropFilter: 'blur(10px)'
              }}>
                <input
                  type="radio"
                  value="link"
                  checked={inputType === 'link'}
                  onChange={(e) => setInputType(e.target.value)}
                  style={{ 
                    margin: 0, 
                    transform: 'scale(1.5)',
                    accentColor: '#ff6b35'
                  }}
                  disabled={isAnalyzing}
                />
                <span style={{
                  background: inputType === 'link' 
                    ? 'linear-gradient(45deg, #ff6b35, #f7931e)' 
                    : 'linear-gradient(45deg, #666, #999)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.2rem'
                }}>
                  🔗 X Link
                </span>
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px', 
                padding: '20px 30px', 
                border: `3px solid ${inputType === 'posts' ? '#ff6b35' : 'rgba(255, 107, 53, 0.3)'}`,
                borderRadius: '20px',
                cursor: 'pointer',
                background: inputType === 'posts' 
                  ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))' 
                  : 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease',
                fontSize: '1.1rem',
                fontWeight: '600',
                boxShadow: inputType === 'posts' 
                  ? '0 15px 35px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                  : '0 8px 25px rgba(0, 0, 0, 0.1)',
                transform: inputType === 'posts' ? 'translateY(-2px) scale(1.02)' : 'translateY(0)',
                backdropFilter: 'blur(10px)'
              }}>
                <input
                  type="radio"
                  value="posts"
                  checked={inputType === 'posts'}
                  onChange={(e) => setInputType(e.target.value)}
                  style={{ 
                    margin: 0, 
                    transform: 'scale(1.5)',
                    accentColor: '#ff6b35'
                  }}
                  disabled={isAnalyzing}
                />
                <span style={{
                  background: inputType === 'posts' 
                    ? 'linear-gradient(45deg, #ff6b35, #f7931e)' 
                    : 'linear-gradient(45deg, #666, #999)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.2rem'
                }}>
                  📝 User Posts
                </span>
              </label>
            </div>
          </div>

          {/* 根据选择显示不同的输入框 */}
          {inputType === 'link' ? (
            <div style={{ marginBottom: '30px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '15px', 
                fontWeight: '700',
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🔗 X Username or Link
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g., @tim_cook) or full link (e.g., https://x.com/tim_cook)"
                style={{
                  width: '100%',
                  padding: '20px',
                  border: '3px solid rgba(255, 107, 53, 0.3)',
                  borderRadius: '20px',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                  fontWeight: '500'
                }}
                disabled={isAnalyzing}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff6b35'
                  e.target.style.boxShadow = '0 15px 35px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'translateY(-2px)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 107, 53, 0.3)'
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
                  e.target.style.transform = 'translateY(0)'
                }}
              />
            </div>
          ) : (
            <div style={{ marginBottom: '30px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '15px', 
                fontWeight: '700',
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                📝 User Post Content
              </label>
              <textarea
                value={userPosts}
                onChange={(e) => setUserPosts(e.target.value)}
                placeholder="Paste user's tweet content, can include multiple tweets..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '20px',
                  border: '3px solid rgba(255, 107, 53, 0.3)',
                  borderRadius: '20px',
                  fontSize: '1.1rem',
                  resize: 'vertical',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  fontFamily: 'inherit',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                  fontWeight: '500'
                }}
                disabled={isAnalyzing}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff6b35'
                  e.target.style.boxShadow = '0 15px 35px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'translateY(-2px)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 107, 53, 0.3)'
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
                  e.target.style.transform = 'translateY(0)'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '15px', 
              fontWeight: '700',
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🎯 Product Description
            </label>
            <input
              type="text"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Enter product description"
              style={{
                width: '100%',
                padding: '20px',
                border: '3px solid rgba(255, 107, 53, 0.3)',
                borderRadius: '20px',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                outline: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                fontWeight: '500'
              }}
              disabled={isAnalyzing}
              onFocus={(e) => {
                e.target.style.borderColor = '#ff6b35'
                e.target.style.boxShadow = '0 15px 35px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 107, 53, 0.3)'
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
                e.target.style.transform = 'translateY(0)'
              }}
            />
          </div>
          
          {/* 按钮组 */}
          <div style={{ 
            display: 'flex', 
            gap: '20px',
            justifyContent: 'center',
            marginTop: '20px'
          }}>
            <button
              type="submit"
              disabled={isAnalyzing || (!username && !userPosts) || !productDescription}
              style={{
                flex: 1,
                maxWidth: '300px',
                padding: '20px 40px',
                borderRadius: '25px',
                border: 'none',
                background: isAnalyzing 
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                  : 'linear-gradient(135deg, #ff6b35, #f7931e, #ffd700)',
                color: 'white',
                fontSize: '1.3rem',
                fontWeight: '700',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isAnalyzing 
                  ? 'none' 
                  : '0 20px 40px rgba(255, 107, 53, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                transform: isAnalyzing ? 'none' : 'perspective(1000px) rotateX(5deg)',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                letterSpacing: '0.5px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isAnalyzing) {
                  e.target.style.transform = 'perspective(1000px) rotateX(8deg) scale(1.05)'
                  e.target.style.boxShadow = '0 25px 50px rgba(255, 107, 53, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isAnalyzing) {
                  e.target.style.transform = 'perspective(1000px) rotateX(5deg) scale(1)'
                  e.target.style.boxShadow = '0 20px 40px rgba(255, 107, 53, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              {isAnalyzing ? '🔄 Analyzing...' : '🚀 Start Analysis'}
            </button>
            
            <button
              type="button"
              onClick={resetForm}
              disabled={isAnalyzing}
              style={{
                padding: '20px 30px',
                borderRadius: '25px',
                border: '3px solid rgba(255, 107, 53, 0.3)',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                color: '#ff6b35',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                transform: 'perspective(1000px) rotateX(3deg)'
              }}
              onMouseEnter={(e) => {
                if (!isAnalyzing) {
                  e.target.style.borderColor = '#ff6b35'
                  e.target.style.boxShadow = '0 15px 35px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'perspective(1000px) rotateX(5deg) scale(1.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isAnalyzing) {
                  e.target.style.borderColor = 'rgba(255, 107, 53, 0.3)'
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
                  e.target.style.transform = 'perspective(1000px) rotateX(3deg) scale(1)'
                }
              }}
            >
              🔄 Reset
            </button>
          </div>
        </form>
      </div>

      {/* AI Agent 实时输出展示 */}
      {isAnalyzing && (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '40px', 
          borderRadius: '25px', 
          boxShadow: '0 30px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.2)',
          marginBottom: '40px',
          position: 'relative',
          zIndex: 1,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          transform: 'perspective(1000px) rotateX(2deg)',
          transition: 'all 0.3s ease'
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '30px', 
            background: 'linear-gradient(45deg, #ff6b35, #f7931e, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '2rem',
            fontWeight: '800',
            textShadow: '0 0 30px rgba(255, 107, 53, 0.5)',
            letterSpacing: '-0.02em'
          }}>
            🤖 AI Agent Real-time Output
          </h2>
          
          {/* 进度条 */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              width: '100%',
              height: '20px',
              backgroundColor: 'rgba(255, 107, 53, 0.2)',
              borderRadius: '15px',
              overflow: 'hidden',
              marginBottom: '15px',
              boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.1)',
              border: '2px solid rgba(255, 107, 53, 0.3)'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ff6b35, #f7931e, #ffd700)',
                borderRadius: '12px',
                transition: 'width 0.8s ease',
                boxShadow: '0 0 20px rgba(255, 107, 53, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  animation: 'shimmer 2s infinite'
                }} />
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.2rem',
              fontWeight: '700',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}>
              {progress}% - {currentStep}
            </div>
          </div>
        </div>
      )}

      {/* 实时对话播报 */}
      {simulationDialogues.length > 0 && isAnalyzing && (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '40px', 
          borderRadius: '25px', 
          boxShadow: '0 30px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.2)',
          marginBottom: '40px',
          position: 'relative',
          zIndex: 1,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          transform: 'perspective(1000px) rotateX(2deg)',
          transition: 'all 0.3s ease'
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '20px', 
            background: 'linear-gradient(45deg, #ff6b35, #f7931e, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '2rem',
            fontWeight: '800',
            textShadow: '0 0 30px rgba(255, 107, 53, 0.5)',
            letterSpacing: '-0.02em'
          }}>
            🎭 5 Questions & 5 Answers Live Feed
          </h2>
          
          {/* 专家介绍 */}
          {simulationDialogues.length > 0 && simulationDialogues[0] && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
              padding: '25px',
              borderRadius: '20px',
              border: '3px solid rgba(102, 126, 234, 0.3)',
              marginBottom: '30px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 15px 35px rgba(102, 126, 234, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              transform: 'perspective(1000px) rotateX(2deg)'
            }}>
              <h4 style={{ 
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '15px',
                fontSize: '1.3rem',
                fontWeight: '700',
                textAlign: 'center'
              }}>
                💼 Product Expert Introduction
              </h4>
              <p style={{ 
                color: '#667eea', 
                lineHeight: '1.8',
                fontSize: '1.2rem',
                margin: 0,
                fontWeight: '600',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                "{result?.data?.intro || "Welcome to our product insight interview."}"
              </p>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '30px',
            alignItems: 'center'
          }}>
            <h3 style={{ 
              background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.4rem', 
              margin: 0,
              fontWeight: '700'
            }}>
              💬 Current Dialogue
            </h3>
            <span style={{ 
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
              color: '#ff6b35',
              fontSize: '1.1rem',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '25px',
              border: '2px solid rgba(255, 107, 53, 0.3)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 25px rgba(255, 107, 53, 0.2)'
            }}>
              Question {currentDialogueIndex + 1} / {simulationDialogues.length}
            </span>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '30px', 
            marginBottom: '30px' 
          }}>
            {/* 产品专家问题 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
              padding: '25px',
              borderRadius: '20px',
              border: '3px solid rgba(255, 107, 53, 0.3)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 15px 35px rgba(255, 107, 53, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              transform: 'perspective(1000px) rotateY(-5deg)'
            }}>
              <h4 style={{ 
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '20px',
                fontSize: '1.3rem',
                fontWeight: '700'
              }}>
                💼 Product Expert Question
              </h4>
              <p style={{ 
                color: '#ff6b35', 
                lineHeight: '1.8',
                fontSize: '1.4rem',
                margin: 0,
                fontWeight: '700',
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                letterSpacing: '0.3px'
              }}>
                {simulationDialogues[currentDialogueIndex]?.question}
              </p>
            </div>

            {/* 模拟用户回答 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1))',
              padding: '25px',
              borderRadius: '20px',
              border: '3px solid rgba(255, 193, 7, 0.3)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 15px 35px rgba(255, 193, 7, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              transform: 'perspective(1000px) rotateY(5deg)'
            }}>
              <h4 style={{ 
                background: 'linear-gradient(45deg, #ffc107, #ff9800)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '20px',
                fontSize: '1.3rem',
                fontWeight: '700'
              }}>
                👤 Simulated User Answer
              </h4>
              <p style={{ 
                color: '#ff9800', 
                lineHeight: '1.8',
                fontSize: '1.4rem',
                margin: 0,
                fontWeight: '700',
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                letterSpacing: '0.3px'
              }}>
                {simulationDialogues[currentDialogueIndex]?.answer}
              </p>
            </div>
          </div>

          {/* 分析结果 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(255, 119, 48, 0.1))',
            padding: '25px',
            borderRadius: '20px',
            border: '3px solid rgba(255, 87, 34, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 15px 35px rgba(255, 87, 34, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            transform: 'perspective(1000px) rotateX(3deg)'
          }}>
            <h4 style={{ 
              background: 'linear-gradient(45deg, #ff5722, #ff7733)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
              fontSize: '1.3rem',
              fontWeight: '700'
            }}>
              🧠 AI Analysis Result
            </h4>
            <p style={{ 
              color: '#ff5722', 
              lineHeight: '1.8',
              fontSize: '1.4rem',
              margin: 0,
              fontWeight: '700',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
              letterSpacing: '0.3px'
            }}>
              {simulationDialogues[currentDialogueIndex]?.analysis}
            </p>
          </div>
        </div>
      )}

      {/* 结果显示 */}
      {result && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '40px',
          borderRadius: '25px',
          border: '3px solid rgba(255, 107, 53, 0.3)',
          boxShadow: '0 30px 60px rgba(255, 107, 53, 0.2), 0 0 0 1px rgba(255,255,255,0.2)',
          position: 'relative',
          zIndex: 1,
          transform: 'perspective(1000px) rotateX(2deg)',
          transition: 'all 0.3s ease',
          minHeight: 'auto',
          overflow: 'visible',
          marginBottom: '50px'
        }}>
          <h3 style={{ 
            background: 'linear-gradient(45deg, #ff6b35, #f7931e, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '30px',
            fontSize: '2.5rem',
            fontWeight: '800',
            textAlign: 'center',
            textShadow: '0 0 30px rgba(255, 107, 53, 0.5)',
            letterSpacing: '-0.02em'
          }}>
            ✅ Analysis Complete
          </h3>
          
          {/* 下载按钮组 */}
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            justifyContent: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => downloadReport(result)}
              style={{
                padding: '15px 30px',
                borderRadius: '20px',
                border: 'none',
                background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 15px 35px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                transform: 'perspective(1000px) rotateX(5deg)',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'perspective(1000px) rotateX(8deg) scale(1.05)'
                e.target.style.boxShadow = '0 20px 40px rgba(255, 107, 53, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'perspective(1000px) rotateX(5deg) scale(1)'
                e.target.style.boxShadow = '0 15px 35px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              📄 Download User Report
            </button>
            
          </div>
          <div style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
                padding: '20px',
                borderRadius: '15px',
                border: '2px solid rgba(255, 107, 53, 0.3)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.2)'
              }}>
                <strong style={{ 
                  background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  👤 User:
                </strong>
                <p style={{ margin: '8px 0', color: '#ff6b35', fontWeight: '600' }}>{result.data.user}</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1))',
                padding: '20px',
                borderRadius: '15px',
                border: '2px solid rgba(255, 193, 7, 0.3)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 25px rgba(255, 193, 7, 0.2)'
              }}>
                <strong style={{ 
                  background: 'linear-gradient(45deg, #ffc107, #ff9800)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  🎯 Product:
                </strong>
                <p style={{ margin: '8px 0', color: '#ff9800', fontWeight: '600' }}>{result.data.product}</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(255, 119, 48, 0.1))',
                padding: '20px',
                borderRadius: '15px',
                border: '2px solid rgba(255, 87, 34, 0.3)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 25px rgba(255, 87, 34, 0.2)'
              }}>
                <strong style={{ 
                  background: 'linear-gradient(45deg, #ff5722, #ff7733)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  📊 Collected tweet count:
                </strong>
                <p style={{ margin: '8px 0', color: '#ff5722', fontWeight: '600' }}>{result.data.twitter_analysis.recentTweets.length}</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
                padding: '20px',
                borderRadius: '15px',
                border: '2px solid rgba(255, 107, 53, 0.3)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.2)'
              }}>
                <strong style={{ 
                  background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  ⏰ Analysis Time:
                </strong>
                <p style={{ margin: '8px 0', color: '#ff6b35', fontWeight: '600' }}>{new Date(result.data.analysisDate).toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <strong style={{ 
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.4rem',
                fontWeight: '700'
              }}>
                📝 Recent Tweets:
              </strong>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '15px',
                marginTop: '15px',
                border: '2px solid rgba(255, 107, 53, 0.3)',
                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.2)'
              }}>
                {result.data.twitter_analysis.recentTweets.map((tweet, index) => (
                  <div key={index} style={{ 
                    marginBottom: '12px', 
                    fontSize: '1rem',
                    color: '#ff6b35',
                    padding: '15px',
                    background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05), rgba(247, 147, 30, 0.05))',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 107, 53, 0.2)',
                    fontWeight: '500',
                    lineHeight: '1.6',
                    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.1)'
                  }}>
                    {tweet}
                  </div>
                ))}
              </div>
            </div>
            
            {/* 5个问答展示区域 */}
            <div style={{ marginTop: '30px' }}>
              <strong style={{ 
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.4rem',
                fontWeight: '700'
              }}>
                💬 5 Questions & 5 Answers:
              </strong>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '15px',
                marginTop: '15px',
                border: '2px solid rgba(255, 107, 53, 0.3)',
                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.2)'
              }}>
                {result.data.simulation.dialogues.map((dialogue, index) => (
                  <div key={index} style={{ 
                    marginBottom: '20px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05), rgba(247, 147, 30, 0.05))',
                    borderRadius: '15px',
                    border: '2px solid rgba(255, 107, 53, 0.2)',
                    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.1)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '15px',
                      gap: '10px'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
                      }}>
                        Question {index + 1}
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '20px',
                      marginBottom: '15px'
                    }}>
                      {/* 问题 */}
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
                        padding: '15px',
                        borderRadius: '12px',
                        border: '2px solid rgba(255, 107, 53, 0.3)',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <h4 style={{ 
                          background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          marginBottom: '10px',
                          fontSize: '1.1rem',
                          fontWeight: '700'
                        }}>
                          💼 Product Expert Question
                        </h4>
                        <p style={{ 
                          color: '#ff6b35', 
                          lineHeight: '1.6',
                          fontSize: '1rem',
                          margin: 0,
                          fontWeight: '500'
                        }}>
                          {dialogue.question}
                        </p>
                      </div>

                      {/* 回答 */}
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1))',
                        padding: '15px',
                        borderRadius: '12px',
                        border: '2px solid rgba(255, 193, 7, 0.3)',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <h4 style={{ 
                          background: 'linear-gradient(45deg, #ffc107, #ff9800)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          marginBottom: '10px',
                          fontSize: '1.1rem',
                          fontWeight: '700'
                        }}>
                          👤 Simulated User Answer
                        </h4>
                        <p style={{ 
                          color: '#ff9800', 
                          lineHeight: '1.6',
                          fontSize: '1rem',
                          margin: 0,
                          fontWeight: '500'
                        }}>
                          {dialogue.answer}
                        </p>
                      </div>
                    </div>

                    {/* 分析结果 */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(255, 119, 48, 0.1))',
                      padding: '15px',
                      borderRadius: '12px',
                      border: '2px solid rgba(255, 87, 34, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <h4 style={{ 
                        background: 'linear-gradient(45deg, #ff5722, #ff7733)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '10px',
                        fontSize: '1.1rem',
                        fontWeight: '700'
                      }}>
                        🧠 AI Analysis Result
                      </h4>
                      <p style={{ 
                        color: '#ff5722', 
                        lineHeight: '1.6',
                        fontSize: '1rem',
                        margin: 0,
                        fontWeight: '500'
                      }}>
                        {dialogue.analysis}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* AI分析结果区域 */}
            {result.data.ai_analysis && (
              <div style={{ marginTop: '30px' }}>
                <strong style={{ 
                  background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.4rem',
                  fontWeight: '700'
                }}>
                  🧠 AI Analysis Result:
                </strong>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  padding: '20px',
                  borderRadius: '15px',
                  marginTop: '15px',
                  border: '2px solid rgba(255, 107, 53, 0.3)',
                  boxShadow: '0 8px 25px rgba(255, 107, 53, 0.2)'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr', 
                    gap: '20px'
                  }}>
                    <div>
                      <div style={{ color: '#ff6b35', fontWeight: '600', marginBottom: '10px', fontSize: '1.1rem' }}>🎯 Persona</div>
                      <p style={{ color: '#ff6b35', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                        {result.data.ai_analysis.persona}
                      </p>
                    </div>
                    <div>
                      <div style={{ color: '#ff9800', fontWeight: '600', marginBottom: '10px', fontSize: '1.1rem' }}>💡 Opportunities</div>
                      <p style={{ color: '#ff9800', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                        {result.data.ai_analysis.opportunities}
                      </p>
                    </div>
                    <div>
                      <div style={{ color: '#ff5722', fontWeight: '600', marginBottom: '10px', fontSize: '1.1rem' }}>⚠️ Risks</div>
                      <p style={{ color: '#ff5722', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                        {result.data.ai_analysis.risks}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* 营销策略建议区域 */}
            {result.data.marketing_strategy && (
              <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                <strong style={{ 
                  background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.4rem',
                  fontWeight: '700'
                }}>
                  📈 Marketing Strategy Suggestions:
                </strong>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  padding: '20px',
                  borderRadius: '15px',
                  marginTop: '15px',
                  border: '2px solid rgba(255, 107, 53, 0.3)',
                  boxShadow: '0 8px 25px rgba(255, 107, 53, 0.2)',
                  minHeight: 'auto',
                  overflow: 'visible'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr', 
                    gap: '20px',
                    minHeight: 'auto'
                  }}>
                    <div>
                      <div style={{ color: '#ff6b35', fontWeight: '600', marginBottom: '10px', fontSize: '1.1rem' }}>🎯 Target Positioning</div>
                      <p style={{ color: '#ff6b35', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                        {result.data.marketing_strategy.targetPositioning}
                      </p>
                    </div>
                    <div>
                      <div style={{ color: '#ff9800', fontWeight: '600', marginBottom: '10px', fontSize: '1.1rem' }}>📱 Marketing Channels</div>
                      <p style={{ color: '#ff9800', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                        {result.data.marketing_strategy.marketingChannels}
                      </p>
                    </div>
                    <div>
                      <div style={{ color: '#ff5722', fontWeight: '600', marginBottom: '10px', fontSize: '1.1rem' }}>💰 Pricing Strategy</div>
                      <p style={{ color: '#ff5722', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                        {result.data.marketing_strategy.pricingStrategy}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 旧的营销策略建议区域 - 保持向后兼容 */}
            <div style={{ marginTop: '30px', display: result.data.marketing_strategy ? 'none' : 'block' }}>
              <strong style={{ 
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.4rem',
                fontWeight: '700'
              }}>
                📈 Marketing Strategy Suggestions:
              </strong>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '15px',
                marginTop: '15px',
                border: '2px solid rgba(255, 107, 53, 0.3)',
                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.2)'
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '20px'
                }}>
                  <div>
                    <div style={{ color: '#ff6b35', fontWeight: '600', marginBottom: '10px', fontSize: '1.1rem' }}>🎯 目标定位</div>
                    <ul style={{ color: '#ff6b35', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
                      <li>技术爱好者群体</li>
                      <li>追求效率的用户</li>
                      <li>价格敏感但重视品质</li>
                    </ul>
                  </div>
                  <div>
                    <div style={{ color: '#ff9800', fontWeight: '600', marginBottom: '10px', fontSize: '1.1rem' }}>📱 营销渠道</div>
                    <ul style={{ color: '#ff9800', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
                      <li>Twitter/X平台重点推广</li>
                      <li>技术类KOL合作</li>
                      <li>创新技术内容营销</li>
                    </ul>
                  </div>
                  <div>
                    <div style={{ color: '#ff5722', fontWeight: '600', marginBottom: '10px', fontSize: '1.1rem' }}>💰 价格策略</div>
                    <ul style={{ color: '#ff5722', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
                      <li>提供分期付款选项</li>
                      <li>租赁服务模式</li>
                      <li>透明价格结构</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* ElevenLabs 语音报告区域 */}
            <div style={{ marginTop: '30px', marginBottom: '30px' }}>
              <strong style={{ 
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.4rem',
                fontWeight: '700'
              }}>
                🎵 ElevenLabs Voice Report:
              </strong>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '15px',
                marginTop: '15px',
                border: '2px solid rgba(255, 107, 53, 0.3)',
                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.2)',
                minHeight: 'auto',
                overflow: 'visible'
              }}>
                <div style={{ 
                  marginBottom: '15px',
                  padding: '15px',
                  background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05), rgba(247, 147, 30, 0.05))',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 107, 53, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      color: '#ff6b35', 
                      fontWeight: '600',
                      marginBottom: '8px',
                      fontSize: '1rem'
                    }}>
                      📊 User Analysis Report (Audio)
                    </div>
                    <div style={{ 
                      color: '#666', 
                      fontSize: '0.9rem',
                      marginBottom: '10px'
                    }}>
                      Complete user insight analysis converted to speech format - ready for download
                    </div>
                    <audio 
                      controls 
                      style={{ 
                        width: '100%',
                        maxWidth: '300px',
                        height: '40px',
                        borderRadius: '8px',
                        marginTop: '10px'
                      }}
                    >
                      <source 
                        src="/Elon_Musk_Apple.m4a" 
                        type="audio/mp4" 
                      />
                      Your browser does not support audio playback
                    </audio>
                  </div>
                  <button
                    onClick={() => {
                      // 下载真实的音频文件
                      const link = document.createElement('a');
                      link.href = '/Elon_Musk_Apple.m4a';
                      link.download = `InsightPilot_Voice_Report_${result.data.user || 'user'}_${new Date().toISOString().split('T')[0]}.m4a`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      border: '2px solid rgba(255, 107, 53, 0.3)',
                      background: 'rgba(255, 107, 53, 0.1)',
                      color: '#ff6b35',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 107, 53, 0.2)'
                      e.target.style.borderColor = '#ff6b35'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 107, 53, 0.1)'
                      e.target.style.borderColor = 'rgba(255, 107, 53, 0.3)'
                    }}
                  >
                    📥 Download Audio Report
                  </button>
                </div>
                <div style={{ 
                  color: '#666', 
                  fontSize: '0.9rem',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  marginTop: '10px'
                }}>
                  * This is a sample audio file. In production, this would contain the actual voice synthesis of the user analysis report.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default App
