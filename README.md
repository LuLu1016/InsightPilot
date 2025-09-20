# InsightPilot

一个基于 AI 智能体的创新项目，集成了多个先进的服务来提供智能分析和决策能力。

## 快速开始

### 环境要求
- Node.js 16+ 
- npm 或 yarn

### 安装依赖
```bash
cd backend
npm install
```

### 配置环境变量
复制 `.env.example` 到 `.env` 并填入您的 API 密钥：
```bash
cp .env.example .env
```

### 启动开发服务器
```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动。

## 项目特性

- 🤖 **AI 智能体**: 基于 Coral Protocol 的智能体协作
- 🧠 **Mistral AI**: 核心 AI 大脑，提供智能分析
- 🎤 **语音合成**: ElevenLabs 集成，提供语音交互
- 🪙 **Web3 集成**: Crossmint 支持 NFT 和区块链功能
- 🌐 **RESTful API**: 标准化的 HTTP API 接口

## 技术栈

- **后端**: Node.js + Express.js
- **前端**: Lovable.dev 平台
- **AI 服务**: Mistral AI, ElevenLabs, Coral Protocol
- **Web3**: Crossmint API

## 项目结构

```
insightpilot/
├── backend/          # 后端服务
├── frontend/         # 前端工作区
├── docs/            # 项目文档
└── README.md        # 项目说明
```

## API 文档

详细的 API 文档请参考 [docs/API.md](docs/API.md)

## 架构设计

项目架构详情请参考 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 开发指南

1. 确保所有 API 密钥已正确配置
2. 启动 Coral Protocol 服务器 (端口 8000)
3. 启动后端开发服务器 (端口 3001)
4. 在 Lovable.dev 中开发前端应用

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
