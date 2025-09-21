import React, { useState, useEffect } from 'react'

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

## 🎵 ElevenLabs语音输出
${result.data.elevenlabs_analysis.audioFiles.map(file => `- ${file.filename || file}`).join('\n')}

## 🎨 NFT生成
- **标题**: ${result.data.crossmint_analysis.nftMetadata.title}
- **描述**: ${result.data.crossmint_analysis.nftMetadata.description}

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
  a.download = `InsightPilot_${result.data.user}_${new Date().toISOString().split('T')[0]}.md`
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

  // 模拟对话数据 - 5个问题和5个回答
  const mockDialogues = [
    {
      question: "基于您的推文内容，您对tesla最新的cybertruck有什么看法？",
      answer: "从我的推文可以看出，我对Tesla Cybertruck非常感兴趣，特别是它的创新设计和性能表现。",
      analysis: "用户表现出对创新技术的强烈兴趣"
    },
    {
      question: "您认为Cybertruck的哪些功能最吸引您？",
      answer: "自动驾驶功能和续航里程是我最关心的两个方面，这些功能能大大提升我的出行体验。",
      analysis: "用户重视实用性和效率"
    },
    {
      question: "您会考虑购买Cybertruck吗？",
      answer: "是的，如果价格合理且性能符合预期，我很可能会选择购买。",
      analysis: "用户有明确的购买意向"
    },
    {
      question: "您对Cybertruck的价格预期是多少？",
      answer: "我希望价格能在我的预算范围内，大概在5-8万美元之间会比较合理。",
      analysis: "用户有明确的价格敏感度"
    },
    {
      question: "您最担心Cybertruck的哪个方面？",
      answer: "主要是充电基础设施和维修保养的便利性，这些会影响日常使用体验。",
      analysis: "用户关注实用性和便利性"
    }
  ]

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

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('🚀 开始分析')
    console.log('📝 输入:', { inputType, username, userPosts, productDescription })
    
    // 验证输入
    if (inputType === 'link' && !username.trim()) {
      alert('请填写X用户名或链接')
      return
    }
    if (inputType === 'posts' && !userPosts.trim()) {
      alert('请粘贴用户帖子内容')
      return
    }
    if (!productDescription.trim()) {
      alert('请填写产品描述')
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
      
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_type: inputType,
          x_username: inputType === 'link' ? username : null,
          user_posts: inputType === 'posts' ? userPosts : null,
          product_description: productDescription
        })
      })
      
      console.log('📡 API响应状态:', response.status)
      
      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 API响应数据:', data)
      
      // 重新组织的工作流播报顺序
      setTimeout(() => {
        setCurrentStep('1️⃣ 用户Profile画像分析')
        setProgress(20)
        setAgentOutputs(prev => ({ ...prev, twitter: data.data.twitter_analysis }))
      }, 1000)
      
      setTimeout(() => {
        setCurrentStep('2️⃣ 生成5个问题')
        setProgress(40)
        setAgentOutputs(prev => ({ ...prev, mistral: data.data.mistral_analysis }))
      }, 3000)
      
      setTimeout(() => {
        setCurrentStep('3️⃣ 模拟5个用户回答')
        setProgress(60)
        setAgentOutputs(prev => ({ ...prev, simulation: data.data.simulation }))
      }, 5000)
      
      setTimeout(() => {
        setCurrentStep('4️⃣ ElevenLabs语音合成')
        setProgress(80)
        setAgentOutputs(prev => ({ ...prev, elevenlabs: data.data.elevenlabs_analysis }))
      }, 7000)
      
      setTimeout(() => {
        setCurrentStep('5️⃣ NFT生成')
        setProgress(90)
        setAgentOutputs(prev => ({ ...prev, crossmint: data.data.crossmint_analysis }))
      }, 9000)
      
      setTimeout(() => {
        setCurrentStep('6️⃣ 用户报告生成')
        setProgress(100)
        setIsAnalyzing(false)
        setCurrentStep('')
        setIsShowingDialogue(false)
        setAgentOutputs(prev => ({ ...prev, crossmint: data.data.crossmint_analysis }))
        setResult(data)
      }, 11000)
      
    } catch (error) {
      console.error('❌ API调用失败:', error)
      alert(`分析失败: ${error.message}`)
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
      overflow: 'hidden'
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
            ✨ AI驱动的未来用户分析平台
          </p>
        </div>
      </div>
      
      {/* 主表单 */}
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
              🎯 选择输入方式
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
                  🔗 X链接
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
                  📝 用户帖子
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
                🔗 X 用户名或链接
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="输入用户名 (如: @tim_cook) 或完整链接 (如: https://x.com/tim_cook)"
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
                📝 用户帖子内容
              </label>
              <textarea
                value={userPosts}
                onChange={(e) => setUserPosts(e.target.value)}
                placeholder="粘贴用户发的推文内容，可以包含多条推文..."
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
              🎯 产品描述
            </label>
            <input
              type="text"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="输入产品描述"
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
              {isAnalyzing ? '🔄 分析中...' : '🚀 开始分析'}
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
              🔄 重置
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
            🤖 AI Agent 实时输出
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
            marginBottom: '30px', 
            background: 'linear-gradient(45deg, #ff6b35, #f7931e, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '2rem',
            fontWeight: '800',
            textShadow: '0 0 30px rgba(255, 107, 53, 0.5)',
            letterSpacing: '-0.02em'
          }}>
            🎭 5个问题 & 5个回答 实时播报
          </h2>

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
              💬 当前对话
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
              问题 {currentDialogueIndex + 1} / {simulationDialogues.length}
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
                💼 产品专家问题
              </h4>
              <p style={{ 
                color: '#ff6b35', 
                lineHeight: '1.7',
                fontSize: '1.1rem',
                margin: 0,
                fontWeight: '500',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
                👤 模拟用户回答
              </h4>
              <p style={{ 
                color: '#ff9800', 
                lineHeight: '1.7',
                fontSize: '1.1rem',
                margin: 0,
                fontWeight: '500',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
              🧠 AI分析结果
            </h4>
            <p style={{ 
              color: '#ff5722', 
              lineHeight: '1.7',
              fontSize: '1.1rem',
              margin: 0,
              fontWeight: '500',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
          transition: 'all 0.3s ease'
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
            ✅ 分析完成
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
              📄 下载用户报告
            </button>
            
            {result.data.elevenlabs_analysis && result.data.elevenlabs_analysis.audioFiles && (
              <button
                onClick={() => downloadAllAudio(result.data.elevenlabs_analysis.audioFiles)}
                style={{
                  padding: '15px 30px',
                  borderRadius: '20px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ffc107, #ff9800)',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 15px 35px rgba(255, 193, 7, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  transform: 'perspective(1000px) rotateX(5deg)',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'perspective(1000px) rotateX(8deg) scale(1.05)'
                  e.target.style.boxShadow = '0 20px 40px rgba(255, 193, 7, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'perspective(1000px) rotateX(5deg) scale(1)'
                  e.target.style.boxShadow = '0 15px 35px rgba(255, 193, 7, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                🎵 下载所有音频
              </button>
            )}
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
                  👤 用户:
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
                  🎯 产品:
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
                  📊 推文数量:
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
                  ⏰ 分析时间:
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
                📝 最近推文:
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
                💬 5个问题 & 5个回答:
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
                        问题 {index + 1}
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
                          💼 产品专家问题
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
                          👤 模拟用户回答
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
                        🧠 AI分析结果
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

            {/* 用户Insights洞察区域 */}
            <div style={{ marginTop: '30px' }}>
              <strong style={{ 
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.4rem',
                fontWeight: '700'
              }}>
                🔍 用户Insights洞察:
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 107, 53, 0.3)'
                  }}>
                    <div style={{ color: '#ff6b35', fontWeight: '600', marginBottom: '8px' }}>技术接受度</div>
                    <div style={{ color: '#ff6b35', fontSize: '0.9rem' }}>高 - 对创新技术感兴趣</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1))',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 193, 7, 0.3)'
                  }}>
                    <div style={{ color: '#ff9800', fontWeight: '600', marginBottom: '8px' }}>购买意向</div>
                    <div style={{ color: '#ff9800', fontSize: '0.9rem' }}>强烈 - 有明确购买计划</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(255, 119, 48, 0.1))',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 87, 34, 0.3)'
                  }}>
                    <div style={{ color: '#ff5722', fontWeight: '600', marginBottom: '8px' }}>价格敏感度</div>
                    <div style={{ color: '#ff5722', fontSize: '0.9rem' }}>高 - 关注价格合理性</div>
                  </div>
                </div>
                <div style={{ color: '#ff6b35', fontSize: '1rem', lineHeight: '1.6' }}>
                  <strong>关键洞察:</strong> 用户是技术爱好者，对创新产品有强烈兴趣，但价格敏感度高，需要提供合理的价格策略和分期付款选项。
                </div>
              </div>
            </div>

            {/* 营销策略建议区域 */}
            <div style={{ marginTop: '30px' }}>
              <strong style={{ 
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.4rem',
                fontWeight: '700'
              }}>
                📈 营销策略建议:
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

            {/* 音频播放和下载区域 */}
            {result.data.elevenlabs_analysis && result.data.elevenlabs_analysis.audioFiles && (
              <div style={{ marginTop: '30px' }}>
                <strong style={{ 
                  background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.4rem',
                  fontWeight: '700'
                }}>
                  🎵 ElevenLabs语音输出:
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
                  {result.data.elevenlabs_analysis.audioFiles.map((file, index) => (
                    <div key={index} style={{ 
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
                          {typeof file === 'string' ? file : file.filename || `音频文件 ${index + 1}`}
                        </div>
                        <audio 
                          controls 
                          style={{ 
                            width: '100%',
                            maxWidth: '300px',
                            height: '40px',
                            borderRadius: '8px'
                          }}
                        >
                          <source 
                            src={typeof file === 'string' ? file : file.url || `data:audio/mp3;base64,${file.content}`} 
                            type="audio/mpeg" 
                          />
                          您的浏览器不支持音频播放
                        </audio>
                      </div>
                      <button
                        onClick={() => {
                          const filename = typeof file === 'string' ? file : file.filename || `audio_${index + 1}.mp3`
                          const audioUrl = typeof file === 'string' ? file : file.url || `data:audio/mp3;base64,${file.content}`
                          downloadAudio(audioUrl, filename)
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
                        📥 下载
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
