// WorkingApp.jsx - 工作版本
import React, { useState, useEffect } from 'react'
import { postJSON } from './api/client'

function WorkingApp() {
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

  // 模拟对话数据
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
      
      const data = await postJSON('/analyze', {
        input_type: inputType,
        x_username: inputType === 'link' ? username : null,
        user_posts: inputType === 'posts' ? userPosts : null,
        product_description: productDescription
      })
      console.log('📊 API响应数据:', data)
      
      // 模拟进度更新
      setTimeout(() => {
        setCurrentStep('mistral')
        setProgress(40)
        setAgentOutputs(prev => ({ ...prev, twitter: data.data.twitter_analysis }))
      }, 2000)
      
      setTimeout(() => {
        setCurrentStep('simulation')
        setProgress(60)
        setAgentOutputs(prev => ({ ...prev, mistral: data.data.mistral_analysis }))
      }, 4000)
      
      setTimeout(() => {
        setCurrentStep('elevenlabs')
        setProgress(80)
        setAgentOutputs(prev => ({ ...prev, simulation: data.data.simulation }))
      }, 6000)
      
      setTimeout(() => {
        setCurrentStep('crossmint')
        setProgress(90)
        setAgentOutputs(prev => ({ ...prev, elevenlabs: data.data.elevenlabs_analysis }))
      }, 8000)
      
      setTimeout(() => {
        setProgress(100)
        setIsAnalyzing(false)
        setCurrentStep('')
        setIsShowingDialogue(false)
        setAgentOutputs(prev => ({ ...prev, crossmint: data.data.crossmint_analysis }))
        setResult(data)
      }, 10000)
      
    } catch (error) {
      console.error('❌ API调用失败:', error)
      alert(`分析失败: ${error.message}`)
      setIsAnalyzing(false)
      setIsShowingDialogue(false)
      setCurrentStep('')
      setProgress(0)
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#1f2937' }}>
        🚀 InsightPilot - AI用户分析平台
      </h1>
      
      <form onSubmit={handleSubmit} style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        {/* 输入方式选择 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
            选择输入方式
          </label>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 16px', 
              border: `2px solid ${inputType === 'link' ? '#3b82f6' : '#e5e7eb'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              background: inputType === 'link' ? '#eff6ff' : 'white'
            }}>
              <input
                type="radio"
                value="link"
                checked={inputType === 'link'}
                onChange={(e) => setInputType(e.target.value)}
                style={{ margin: 0 }}
                disabled={isAnalyzing}
              />
              🔗 X链接
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 16px', 
              border: `2px solid ${inputType === 'posts' ? '#3b82f6' : '#e5e7eb'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              background: inputType === 'posts' ? '#eff6ff' : 'white'
            }}>
              <input
                type="radio"
                value="posts"
                checked={inputType === 'posts'}
                onChange={(e) => setInputType(e.target.value)}
                style={{ margin: 0 }}
                disabled={isAnalyzing}
              />
              📝 用户帖子
            </label>
          </div>
        </div>

        {/* 根据选择显示不同的输入框 */}
        {inputType === 'link' ? (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              X 用户名或链接
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入用户名 (如: @tim_cook) 或完整链接 (如: https://x.com/tim_cook)"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              disabled={isAnalyzing}
            />
          </div>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              用户帖子内容
            </label>
            <textarea
              value={userPosts}
              onChange={(e) => setUserPosts(e.target.value)}
              placeholder="粘贴用户发的推文内容，可以包含多条推文..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical'
              }}
              disabled={isAnalyzing}
            />
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            产品描述
          </label>
          <input
            type="text"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="输入产品描述"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px'
            }}
            disabled={isAnalyzing}
          />
        </div>
        
        <button
          type="submit"
          disabled={isAnalyzing || (!username && !userPosts) || !productDescription}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: isAnalyzing ? '#9ca3af' : '#3b82f6',
            color: 'white',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isAnalyzing ? 'not-allowed' : 'pointer'
          }}
        >
          {isAnalyzing ? '分析中...' : '开始分析'}
        </button>
      </form>

      {/* AI Agent 实时输出展示 */}
      {isAnalyzing && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1f2937' }}>
            🤖 AI Agent 实时输出
          </h2>
          
          {/* 进度条 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: '#3b82f6',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ textAlign: 'center', marginTop: '8px', color: '#6b7280' }}>
              {progress}% - {currentStep}
            </div>
          </div>
        </div>
      )}

      {/* 实时对话播报 */}
      {simulationDialogues.length > 0 && isAnalyzing && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1f2937' }}>
            🎭 实时模拟访谈播报
          </h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ color: '#1f2937' }}>当前对话</h3>
            <span style={{ color: '#6b7280' }}>
              问题 {currentDialogueIndex + 1} / {simulationDialogues.length}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            {/* 产品专家问题 */}
            <div style={{
              background: '#f0f9ff',
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid #3b82f6'
            }}>
              <h4 style={{ color: '#1e40af', marginBottom: '12px' }}>产品专家问题</h4>
              <p style={{ color: '#1e40af', lineHeight: '1.6' }}>
                {simulationDialogues[currentDialogueIndex]?.question}
              </p>
            </div>

            {/* 模拟用户回答 */}
            <div style={{
              background: '#f0fdf4',
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid #10b981'
            }}>
              <h4 style={{ color: '#059669', marginBottom: '12px' }}>模拟用户回答</h4>
              <p style={{ color: '#059669', lineHeight: '1.6' }}>
                {simulationDialogues[currentDialogueIndex]?.answer}
              </p>
            </div>
          </div>

          {/* 分析结果 */}
          <div style={{
            background: '#fef3c7',
            padding: '16px',
            borderRadius: '8px',
            border: '2px solid #f59e0b'
          }}>
            <h4 style={{ color: '#d97706', marginBottom: '12px' }}>AI分析结果</h4>
            <p style={{ color: '#d97706', lineHeight: '1.6' }}>
              {simulationDialogues[currentDialogueIndex]?.analysis}
            </p>
          </div>
        </div>
      )}

      {/* 结果显示 */}
      {result && (
        <div style={{
          background: '#f0f9ff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <h3 style={{ color: '#0ea5e9', marginBottom: '12px' }}>
            ✅ 分析完成
          </h3>
          <div style={{ fontSize: '14px' }}>
            <p><strong>用户:</strong> {result.data.user}</p>
            <p><strong>产品:</strong> {result.data.product}</p>
            <p><strong>推文数量:</strong> {result.data.twitter_analysis.recentTweets.length}</p>
            <p><strong>分析时间:</strong> {result.data.analysisDate}</p>
            
            <div style={{ marginTop: '12px' }}>
              <strong>最近推文:</strong>
              <ul style={{ marginTop: '8px' }}>
                {result.data.twitter_analysis.recentTweets.map((tweet, index) => (
                  <li key={index} style={{ marginBottom: '4px', fontSize: '12px' }}>
                    {tweet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkingApp
