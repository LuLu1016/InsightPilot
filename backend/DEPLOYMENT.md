# InsightPilot 后端部署指南

## 🚀 Railway 部署步骤

### 1. 准备部署

确保所有测试通过：
```bash
node check-environment.js
node test-complete.js
```

### 2. Railway 部署

1. **登录 Railway**
   - 访问 [railway.app](https://railway.app)
   - 使用 GitHub 登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择 `insightpilot` 仓库
   - 选择 `backend` 文件夹

3. **配置环境变量**
   在 Railway 项目设置中添加以下环境变量：

   ```bash
   # 必需变量
   PORT=3001
   NODE_ENV=production
   MISTRAL_API_KEY=your_production_mistral_api_key
   ELEVENLABS_API_KEY=your_production_elevenlabs_api_key
   CROSSMINT_API_KEY=your_production_crossmint_api_key
   CROSSMINT_CLIENT_SECRET=your_production_crossmint_client_secret
   
   # 可选变量
   TWITTER_BEARER_TOKEN=your_production_twitter_bearer_token
   CORAL_SERVER_URL=https://your-coral-server.railway.app
   AIML_API_KEY=your_production_aiml_api_key
   ```

4. **部署配置**
   - Railway 会自动检测 `railway.json` 配置
   - 健康检查路径：`/api/health`
   - 启动命令：`node src/server.js`

### 3. 验证部署

部署完成后，Railway 会提供一个 URL，例如：
`https://insightpilot-backend-production.up.railway.app`

测试部署：
```bash
curl https://your-railway-url.up.railway.app/api/health
```

### 4. 生产环境测试

```bash
curl -X POST https://your-railway-url.up.railway.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"x_username": "testuser", "product_description": "AI-powered platform"}'
```

## 🔧 故障排除

### 常见问题

1. **环境变量未设置**
   - 检查 Railway 项目设置中的环境变量
   - 确保变量名和值正确

2. **API 密钥无效**
   - 验证生产环境的 API 密钥
   - 检查 API 服务状态

3. **部署失败**
   - 检查 `package.json` 中的依赖
   - 查看 Railway 构建日志

4. **健康检查失败**
   - 确保服务器在指定端口启动
   - 检查 `/api/health` 端点

### 监控和日志

- Railway 提供实时日志查看
- 监控 API 响应时间和错误率
- 设置告警通知

## 📋 部署检查清单

- [ ] 所有测试通过
- [ ] 环境变量配置完成
- [ ] Railway 项目创建
- [ ] 代码推送到 GitHub
- [ ] 部署成功
- [ ] 健康检查通过
- [ ] API 端点测试通过
- [ ] 生产环境功能验证

## 🎯 下一步

部署完成后，可以：
1. 开始前端开发（Lovable.dev）
2. 连接生产环境 API
3. 进行端到端测试
4. 准备最终演示
