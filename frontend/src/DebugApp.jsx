// DebugApp.jsx - 调试版本
import React, { useState } from 'react'

function DebugApp() {
  const [username, setUsername] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [debugInfo, setDebugInfo] = useState([])

  const addDebugInfo = (message) => {
    console.log(message)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    addDebugInfo('🚀 开始提交表单')
    
    setIsAnalyzing(true)
    addDebugInfo('✅ 设置isAnalyzing为true')
    
    try {
      addDebugInfo('📝 用户输入: ' + JSON.stringify({ username, productDescription }))
      
      addDebugInfo('🌐 开始API调用')
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x_username: username,
          product_description: productDescription
        })
      })
      
      addDebugInfo(`📡 API响应状态: ${response.status}`)
      
      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`)
      }
      
      const data = await response.json()
      addDebugInfo('📊 API响应成功: ' + JSON.stringify(data).substring(0, 100) + '...')
      
      setIsAnalyzing(false)
      addDebugInfo('✅ 分析完成')
      
    } catch (error) {
      addDebugInfo('❌ 错误: ' + error.message)
      setIsAnalyzing(false)
    }
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#1f2937' }}>
        🐛 InsightPilot 调试页面
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => addDebugInfo('🧪 测试按钮点击')}
          style={{
            background: '#8b5cf6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '12px'
          }}
        >
          🧪 测试按钮
        </button>
        
        <button
          onClick={() => {
            setIsAnalyzing(!isAnalyzing)
            addDebugInfo(`🔧 切换isAnalyzing状态: ${!isAnalyzing}`)
          }}
          style={{
            background: '#f59e0b',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🔧 切换状态
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Twitter用户名:
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="例如: elonmusk"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            产品描述:
          </label>
          <input
            type="text"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="例如: Tesla Cybertruck"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '16px'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={isAnalyzing}
          style={{
            width: '100%',
            background: isAnalyzing ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          {isAnalyzing ? '分析中...' : '开始分析'}
        </button>
      </form>

      {/* 分析状态 */}
      {isAnalyzing && (
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#1f2937', marginBottom: '16px' }}>
            🔄 正在分析中...
          </h2>
          <p style={{ color: '#6b7280' }}>
            状态: isAnalyzing = {isAnalyzing.toString()}
          </p>
        </div>
      )}

      {/* 调试信息 */}
      <div style={{ 
        background: '#f9fafb', 
        padding: '16px', 
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>
          🐛 调试信息
        </h3>
        <div style={{ 
          maxHeight: '300px', 
          overflow: 'auto',
          fontSize: '14px',
          fontFamily: 'monospace'
        }}>
          {debugInfo.length === 0 ? (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
              暂无调试信息
            </p>
          ) : (
            debugInfo.map((info, index) => (
              <div key={index} style={{ marginBottom: '4px', color: '#374151' }}>
                {info}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DebugApp
