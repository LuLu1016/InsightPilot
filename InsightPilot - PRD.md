# **Product Requirements Document (PRD)**

Product: InsightPilot\
Version: 1.0\
Date: September 19, 2025\
Author: Quaker AgentleMan/WM\
Status: Draft For Internet of Agents Hackathon @ Solana Skyline

**1. Overview**

### **1.1. Problem Space**

Product Managers, founders, and marketers operate in a vacuum of user
understanding. Traditional user research is a slow, expensive, and
unscalable process:

-   Time-Consuming: Recruiting and interviewing users takes weeks.

-   Costly: Hiring professional researchers or agencies is prohibitive
    > for most startups.

-   Unstructured: Insights from social media (X/Twitter) are fragmented
    > and anecdotal, failing to provide a holistic, actionable view of a
    > target audience.

### **1.2. Solution & Vision**

InsightPilot is an AI-Agentic User Intelligence Platform. It
autonomously conducts deep, data-driven user research by orchestrating a
team of specialized AI agents to analyze public digital footprints. Our
vision is to democratize access to high-quality user insights, making
strategic user understanding instantaneous, affordable, and accessible
to every builder.

### **1.3. What We Are Building (MVP)**

A web application where a user inputs a target X (Twitter) username and
a description of their product. InsightPilot returns a structured report
containing:

1.  A synthesized User Profile (persona, interests, pain points).

2.  A list of Product-Specific Interview Questions tailored to the
    > profile.

3.  Actionable Product Insights (opportunities & risks).

4.  (Optional) An audio version of the questions via ElevenLabs.

## **2. Objectives & Key Results (OKRs)**

### **2.1. Primary Objective for Hackathon**

Demonstrate a technically profound and commercially viable application
of multi-agent orchestration (via Coral) to solve a critical business
problem.

Key Results:

-   KR1: Achieve a working E2E demo that completes the core user journey
    > in \<60 seconds.

-   KR2: Integrate at least 3 sponsor technologies to a \"wow\" level of
    > execution (Coral, Mistral AI, +1).

-   KR3: Receive a top 3 score in the \"Application of Technology\"
    > judging criterion.

### **2.2. Secondary Objective**

Lay the foundation for a potential post-hackathon startup.

Key Results:

-   KR1: Validate demand by collecting at least 20 sign-ups from judges
    > and participants.

-   KR2: Generate a social buzz with a demo video that achieves 5k+
    > views across X/LinkedIn.

## **3. User Stories & Journey**

As a Product Manager at an early-stage startup,\
I want to understand the core needs and pain points of a potential
influential user,\
So that I can validate our product direction and prepare for a highly
effective interview with them.

Acceptance Criteria:

-   Given I enter a valid X username and product description,

-   When I click \"Generate Insights\",

-   Then I must receive a report within 60 seconds that provides
    > non-obvious, specific insights about the user that are directly
    > relevant to my product.

## **4. Technical Architecture & System Design**

### **4.1. High-Level Architecture**

![](media/image1.png){width="6.5in" height="4.513888888888889in"}

### **4.2. Technology Stack & Sponsor Integration**

  --------------------------------------------------------------------------------------------------
  Layer           Technology                            Sponsor      Integration Purpose
  --------------- ------------------------------------- ------------ -------------------------------
  Frontend        [Lovable.dev](https://lovable.dev/)   Lovable      Rapid UI prototyping and
                                                                     deployment.

  Backend         Node.js, Express                      \-           API server and business logic.

  Orchestration   Coral Protocol                        Coral        Core. Manages the entire
                                                                     multi-agent workflow, context,
                                                                     and state.

  AI Agents       Mistral AI                            Mistral      Core. Powers the analytical
                                                                     reasoning for all text-based
                                                                     agents.

  Voice Agent     ElevenLabs                            ElevenLabs   \"Wow\" Factor. Generates
                                                                     lifelike audio for interview
                                                                     questions.

  Web3/Value      Crossmint                             Crossmint    Strategic. Mints the final
                                                                     report as an NFT for
                                                                     credibility and monetization.

  Deployment      Vercel (FE), Railway (BE)             \-           Scalable and free-tier hosting
                                                                     for the demo.
  --------------------------------------------------------------------------------------------------

## **5. Feature Specifications**

### **5.1. Core Analysis Endpoint (POST /api/analyze)**

Request:

json

{

\"x_username\": \"@cagan\",

\"product_description\": \"A tool that helps product managers automate
user research and analysis.\"

}

Response (Success - 200 OK):

json

{

\"success\": true,

\"data\": {

\"user_profile\": {

\"hypothesized_persona\": \"Senior Product Leader\",

\"core_interests\": \[\"Product Strategy\", \"AI\", \"Startups\"\],

\"verified_pain_points\": \[\"Time-consuming research\", \"Unvalidated
ideas\"\]

},

\"interview_questions\": \[

\"You\'ve often mentioned the gap between idea and validation. How could
an AI-powered tool have accelerated the early-stage research for your
most successful product?\",

\"Given your stance on \'product-led growth\', how would you prioritize
features in a tool designed to understand users without manual
interviews?\"

\],

\"product_insights\": {

\"opportunities\": \[\"This user highly values efficiency, a core value
prop of our product.\"\],

\"risks\": \[\"They are skeptical of AI; our tool must be transparent in
its methodology.\"\]

},

\"audio_url\": \"https://cdn.elevenlabs.io/audio_1234.mp3\"

}

}

## **6. Scoping & Prioritization**

-   P0 (Must-Have): E2E workflow with Coral, Mistral, and a functional
    > UI. JSON output.

-   P1 (High Impact): Integration of ElevenLabs for audio output. (Key
    > for \"wow\" factor).

-   P2 (Differentiator): Crossmint NFT minting of reports. (Key for Web3
    > narrative and sponsor prize).

-   P3 (Future): User authentication, report history, sharing features.

## **7. Success Metrics**

-   Technical Success: API response time \< 10s. Agent orchestration
    > error rate \< 1%.

-   Product Success: In a test with 10 users, \>80% agree the generated
    > questions are \"highly relevant\" or \"better than what I\'d draft
    > myself.\"

-   Hackathon Success: Win a main prize track and/or a sponsor prize
    > (ElevenLabs/Crossmint).

## **8. Open Questions & Risks**

-   Q1: What are the rate limits of the Twitter API v2 and how will we
    > handle them?

-   R1: Twitter API access delay. Mitigation: Use a pre-approved handle
    > for the demo (e.g., \@cagan).

-   R2: Complexities in Coral agent debugging. Mitigation: Build robust
    > logging from day one.

# 

# 

# **🚀 InsightPilot 开发交接文档**

## **📋 项目概览**

InsightPilot 是一个基于 Coral Protocol
的多智能体协作系统，自动完成用户调研：从 Twitter 数据分析 → 用户画像生成
→ 智能体对话访谈 → 语音合成 → NFT 报告生成。

核心价值：展示真正的\"智能体间协作\"而不仅仅是单向分析。

## **🏗️ 系统架构**

### **技术栈**

text

Frontend: Lovable.dev (Vercel 部署)

Backend: Node.js + Express (Railway 部署)

AI Agents: Mistral AI, ElevenLabs, Crossmint

Orchestration: Coral Protocol

### **代码结构**

text

insightpilot/

├── backend/

│ ├── src/

│ │ ├── agents/ \# 所有智能体模块

│ │ │ ├── mistralAgent.js

│ │ │ ├── elevenLabsAgent.js

│ │ │ ├── crossmintAgent.js

│ │ │ └── productExpertAgent.js \# ← 最新添加的智能体

│ │ ├── routes/

│ │ └── server.js \# 主服务器文件

│ ├── .env \# 环境变量

│ └── package.json

├── coral/ \# Coral 协议配置

└── frontend/ \# Lovable 生成的前端

## **🔄 核心工作流程**

### **单用户分析流程**

javascript

*// server.js 中的 /api/analyze 端点*

1\. 获取 Twitter 数据 → twitterAgent.fetchUserData(username)

2\. 生成用户画像 → mistralAgent.analyzeProfile(userData,
productDescription)

3\. 执行智能体访谈 →
productExpertAgent.conductSimulatedInterview(persona,
productDescription)

4\. 语音合成 → elevenLabsAgent.generateSpeech(interviewText)

5\. NFT 铸造 → crossmintAgent.mintInsightNFT(reportData)

### **批量分析流程 (新功能)**

javascript

*// server.js 中的 /api/batch-analyze 端点*

for (每个用户 in 用户列表) {

1\. 获取用户数据

2\. 生成用户画像

3\. 基于历史洞察生成个性化问题 →
productExpertAgent.generatePersonalizedQuestions()

4\. 执行访谈并积累洞察

5\. 延迟 1.5秒 (避免速率限制)

}

生成对比报告

## **🎯 当前开发状态**

### **✅ 已完成**

-   基础 Express 服务器搭建

-   Mistral AI 集成 (用户画像生成)

-   ElevenLabs 集成 (语音合成)

-   Crossmint 集成 (NFT 铸造)

-   Coral Protocol 基础集成

-   ProductExpert Agent 框架

### **🚧 进行中/待完成**

-   批量处理功能：/api/batch-analyze 端点的完整实现

-   智能体学习机制：让 ProductExpert Agent 基于历史洞察优化提问

-   前端界面优化：展示智能体对话流程和对比报告

-   错误处理增强：完善的降级方案和重试机制

-   部署配置：Railway 和 Vercel 的生产环境配置

## **🔑 环境变量配置**

bash

*\# .env 文件需要配置：*

MISTRAL_API_KEY=你的_Mistral_API密钥

ELEVENLABS_API_KEY=你的_ElevenLabs_API密钥

CROSSMINT_PROJECT_ID=你的_Crossmint项目ID

CROSSMINT_CLIENT_SECRET=你的_Crossmint客户端密钥

CORAL_SERVER_URL=http://localhost:8000 *\# Coral 服务器地址*

PORT=3001

## **💡 重要设计决策**

### **1. 串行处理而非并行**

javascript

*// 为什么选择串行？*

for (const user of users) { *// ← 串行处理每个用户*

*// 1. 可以积累历史洞察*

*// 2. 避免 API 速率限制*

*// 3. 展示智能体的学习过程*

}

### **2. 智能体间对话设计**

javascript

*// ProductExpertAgent 采访 ProfileAnalystAgent*

const dialogue = await productExpertAgent.interview(

profileAnalystAgent, *// 采访对象*

personalizedQuestions, *// 基于历史洞察生成的问题*

productDescription *// 产品背景*

);

### **3. 错误处理策略**

javascript

*// 降级方案设计*

try {

return await generatePersonalizedQuestions(profile, insights);

} catch (error) {

console.error(\'降级到通用问题\');

return getFallbackQuestions(); *// 返回预设的通用问题*

}

## **🐛 常见问题与解决方案**

### **1. API 速率限制**

javascript

*// 在循环中添加延迟*

await new Promise(resolve =\> setTimeout(resolve, 1500));

### **2. Coral 连接问题**

bash

*\# 确保 Coral 服务器运行*

npx coral server start

*\# 检查连接*

curl http://localhost:8000/health

### **3. 环境变量问题**

javascript

*// 添加验证脚本*

require(\'./scripts/check-environment.js\');

## **🎨 前端展示重点**

### **需要突出展示的要素：**

1.  实时进度：显示每个智能体的工作状态

2.  对话记录：展示 Agent-to-Agent 的访谈过程

3.  学习演进：显示智能体如何基于历史洞察优化问题

4.  对比报告：多用户分析的共性发现

### **界面组件建议：**

javascript

\<AgentInterviewView\>

\<AgentMessage agent=\"ProductExpert\" text=\"问题\...\" /\>

\<AgentMessage agent=\"ProfileAnalyst\" text=\"回答\...\" /\>

\<InsightHighlight text=\"发现的洞察\...\" /\>

\</AgentInterviewView\>

## **📝 给工程师的 Cursor 提示词**

当使用 Cursor 继续开发时，可以使用这些提示词：

### **1. 实现批量处理功能**

text

\"请帮我实现 /api/batch-analyze
端点，支持串行处理多个用户，并积累历史洞察优化后续提问。参考现有的
productExpertAgent.js 中的 generatePersonalizedQuestions 函数。\"

### **2. 优化错误处理**

text

\"请为批量处理添加完善的错误处理，确保一个用户的失败不影响整个批次，并提供降级方案。\"

### **3. 增强 Coral 集成**

text

\"请优化 Coral Protocol 的集成，确保智能体间通信的稳定性和性能。\"

## **🚀 下一步开发重点**

1.  完成批量处理功能：实现 /api/batch-analyze 端点

2.  增强学习机制：让智能体真正从历史洞察中学习

3.  优化前端展示：更好地展示智能体协作过程

4.  完善测试套件：添加完整的集成测试

5.  准备部署：配置生产环境变量和部署脚本
