# InsightPilot 团队开发指南

## 🚀 快速开始

### 1. 环境设置

```bash
# 克隆仓库
git clone https://github.com/LuLu1016/InsightPilot.git
cd InsightPilot

# 安装后端依赖
cd backend
npm install
```

### 2. API 密钥配置

**重要：** 所有 API 密钥都存储在 `backend/.env` 文件中。

#### 创建环境变量文件
```bash
# 在 backend 目录下创建 .env 文件
touch backend/.env
```

#### 必需的 API 密钥
```bash
# 服务器配置
PORT=3001

# AI 服务提供商
MISTRAL_API_KEY=your_mistral_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Web3 & NFT 服务
CROSSMINT_API_KEY=your_crossmint_api_key_here
CROSSMINT_CLIENT_SECRET=your_crossmint_client_secret_here

# 智能体协调（可选）
CORAL_SERVER_URL=http://localhost:8000

# 备用 AI 提供商（可选）
AIML_API_KEY=your_aiml_api_key_here
```

### 3. 启动开发服务器

```bash
cd backend
node src/server.js
```

服务器将在 `http://localhost:3001` 启动。

## 🔑 API 密钥获取指南

### Mistral AI
- 访问：https://console.mistral.ai/
- 注册账户并创建 API 密钥
- 用于用户画像分析和问题生成

### ElevenLabs
- 访问：https://elevenlabs.io/
- 注册账户并获取 XI-API-KEY
- 用于语音合成功能

### Crossmint
- 访问：https://staging.crossmint.com/
- 注册开发者账户
- 创建 API Key 和 Client Secret
- 用于 NFT 铸造功能

## 🧪 测试

### 运行完整测试套件
```bash
cd backend
node test-complete.js
```

### 测试批量分析功能
```bash
node test-batch.js
```

### 环境检查
```bash
node check-environment.js
```

## 📡 API 端点

### 单用户分析
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "x_username": "username",
    "product_description": "Your product description"
  }'
```

### 批量用户分析
```bash
curl -X POST http://localhost:3001/api/batch-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "usernames": ["user1", "user2", "user3"],
    "product_description": "Your product description"
  }'
```

### 健康检查
```bash
curl http://localhost:3001/api/health
```

## 🏗️ 项目结构

```
insightpilot/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── agents/         # AI 智能体模块
│   │   │   ├── twitterAgent.js
│   │   │   ├── mistralAgent.js
│   │   │   ├── productExpertAgent.js
│   │   │   ├── elevenLabsAgent.js
│   │   │   ├── crossmintAgent.js
│   │   │   └── coralAgent.js
│   │   ├── utils/          # 工具函数
│   │   └── server.js       # 主服务器文件
│   ├── test-*.js           # 测试脚本
│   ├── .env                # 环境变量（包含 API 密钥）
│   └── package.json
├── frontend/               # 前端工作区
├── docs/                   # 文档
└── README.md
```

## 🔧 开发工作流

### 1. 功能开发
- 在 `src/agents/` 目录下开发新的智能体
- 在 `src/server.js` 中添加新的 API 端点
- 创建对应的测试文件

### 2. 测试
- 运行 `test-complete.js` 确保所有功能正常
- 为新功能创建专门的测试文件

### 3. 提交代码
```bash
git add .
git commit -m "feat: 描述你的功能"
git push origin main
```

## 🚨 重要注意事项

### 安全
- **永远不要** 将 `.env` 文件提交到 Git
- API 密钥是敏感信息，请妥善保管
- 使用 staging/test 环境的密钥进行开发

### 开发模式
- 如果 API 密钥缺失，系统会自动使用模拟数据
- 所有功能都有降级机制，确保开发顺利进行

### 性能
- 批量分析功能有 1.5 秒延迟，避免 API 速率限制
- 建议在开发时使用较小的测试数据集

## 📞 技术支持

如果遇到问题：
1. 检查 `backend/.env` 文件中的 API 密钥是否正确
2. 运行 `node check-environment.js` 验证环境配置
3. 查看服务器日志了解具体错误信息
4. 提交 Issue 到 GitHub 仓库

## 🎯 下一步开发

- [ ] 前端界面开发（Lovable.dev）
- [ ] Railway 部署配置
- [ ] 真实 Twitter API 集成
- [ ] Coral Protocol 深度集成
- [ ] 性能优化和监控

