# InsightPilot 项目架构

## 技术栈
- **后端:** Node.js + Express.js
- **前端:** Lovable.dev (将通过 HTTP API 调用后端)
- **核心服务:** Coral Protocol, Mistral AI API, ElevenLabs API, Crossmint API
- **数据库:** 暂无需数据库，MVP 使用内存或文件存储即可

## 集成方式
前端 (Lovable) 与后端 (本项目) 通过 **RESTful HTTP API** 集成。所有请求体为 JSON，响应体也为 JSON。

## 项目结构
```
insightpilot/
├── backend/                 # 后端Node.js项目
│   ├── src/
│   │   ├── agents/          # AI智能体模块
│   │   ├── routes/          # API路由
│   │   ├── middleware/      # 中间件
│   │   └── utils/           # 工具函数
│   ├── src/server.js        # 服务器入口文件
│   ├── .env                 # 环境变量
│   ├── .gitignore          # Git忽略规则
│   └── package.json         # 依赖配置
├── frontend/                # 前端工作区
│   ├── src/                 # 源代码
│   └── public/              # 静态资源
├── docs/                    # 项目文档
│   ├── API.md               # API接口文档
│   └── ARCHITECTURE.md      # 架构设计文档
└── README.md               # 项目说明
```

## API 服务配置
- **Mistral AI:** 核心 AI 大脑，用于智能分析和决策
- **ElevenLabs:** 语音合成服务，提供 "WOW" 因素
- **Crossmint:** Web3 凭证和 NFT 功能
- **Coral Protocol:** 智能体协作中枢
- **AI/ML API:** Mistral AI 的备用方案

## 开发环境
- 后端服务器运行在端口 3001
- Coral Protocol 服务器运行在端口 8000
- 前端通过 Lovable.dev 平台开发

## 数据流
1. 前端 (Lovable) 发送 HTTP 请求到后端
2. 后端处理请求，调用相应的 AI 服务
3. 后端返回 JSON 响应给前端
4. 前端渲染结果给用户
