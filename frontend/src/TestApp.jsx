// TestApp.jsx - 简化的测试应用
import React, { useState } from 'react'
import { postJSON } from './api/client'

function TestApp() {
  const [username, setUsername] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🚀 测试提交开始')
    
    setIsAnalyzing(true)
    setError(null)
    setResults(null)
    
    try {
      console.log('📝 用户输入:', { username, productDescription })
      
      const data = await postJSON('/analyze', {
        x_username: username,
        product_description: productDescription
      })
      console.log('📊 API响应数据:', data)
      
      setResults(data)
      setIsAnalyzing(false)
      
    } catch (error) {
      console.error('❌ 错误:', error)
      setError(error.message)
      setIsAnalyzing(false)
    }
  }

  const testButton = () => {
    console.log('🧪 测试按钮点击')
    alert('JavaScript正常工作！')
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#1f2937' }}>
        🧪 InsightPilot 测试页面
      </h1>
      
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button
          onClick={testButton}
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
          🧪 测试JavaScript
        </button>
        
        <button
          onClick={() => {
            console.log('🔧 强制设置状态')
            setIsAnalyzing(true)
            setTimeout(() => setIsAnalyzing(false), 3000)
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
          🔧 测试状态
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
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
              animation: 'loading 2s ease-in-out infinite'
            }} />
          </div>
          <p style={{ marginTop: '12px', color: '#6b7280' }}>
            请稍候，正在调用后端API...
          </p>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca',
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>
            ❌ 错误
          </h3>
          <p style={{ color: '#dc2626' }}>{error}</p>
        </div>
      )}

      {/* 结果展示 */}
      {results && (
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#1f2937', marginBottom: '16px' }}>
            ✅ 分析结果
          </h2>
          <pre style={{ 
            background: '#f9fafb', 
            padding: '16px', 
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '14px',
            color: '#374151'
          }}>
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

export default TestApp
