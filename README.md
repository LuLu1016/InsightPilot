# InsightPilot

InsightPilot is a precision, backend‑orchestrated multi‑agent system that converts public social signals into executive‑grade user intelligence. By coordinating specialized agents in a deterministic serial pipeline, the platform delivers an end‑to‑end flow: X (Twitter) data ingestion → persona and interview question generation → simulated product interviews → voice synthesis → NFT insight report.

## ✨ Executive Overview

- Built for product, growth, and research leaders to eliminate slow, manual user discovery
- Live X API data grounds every insight; outputs are traceable and shareable by design
- Serial orchestration ensures context preservation, rate control, and learning accumulation across users
- End products include persona, interview questions, strategic advice, audio prompts, and an NFT report

### Business Outcomes
- Time‑to‑Insight: typically under 60s for the core journey
- Higher Interview Quality: tailored, strategy‑relevant questions that surface non‑obvious needs
- Shareability: voice prompts and NFTs accelerate stakeholder alignment and credibility

## 🚀 Core Capabilities

- **Serial Multi‑Agent Orchestration**: Predictable sequencing and backpressure‑friendly rate control
- **Live X API Ingestion**: Profile and recent tweets via the X API (Bearer Token) with derived topics, sentiment, and activity patterns
- **Mistral AI Insighting**: High‑precision persona synthesis and interview question generation from structured inputs
- **Product Interview Simulation**: Strategy‑oriented Q&A with concise, actionable advice
- **Persona‑Aware Voice**: ElevenLabs voice synthesis with intelligent voice selection
- **NFT Report Minting**: Crossmint integration for credible, portable insight artifacts
- **Batch with Learning**: Serial batch interviews that carry forward learnings to personalize subsequent questions

## 🧭 Why Teams Choose InsightPilot

- **Grounded**: All conclusions originate from live X data and are traceable
- **Explainable**: Intermediate artifacts (persona, Q&A, advice) are first‑class outputs
- **Shareable**: Audio prompts and NFTs streamline stakeholder communication
- **Extensible**: Modular agent catalog; capabilities can be added without disrupting the flow

## 🧠 Agent Catalog & Responsibilities

- **TwitterAgent (X Data Ingestion)**
  - Purpose: Fetch user profile and recent tweets via the X API; derive engagement metrics, topics, sentiment, and activity patterns
  - Env: `TWITTER_BEARER_TOKEN`
  - Key methods: `getUserProfile(username)`, `getUserTweets(userId)`, `analyzeUser(input)`

- **MistralAgent (Persona & Questions)**
  - Purpose: Call Mistral Chat Completions to produce structured JSON: `persona` + `interviewQuestions`
  - Env: `MISTRAL_API_KEY`
  - Key methods: `analyzeUserProfile(userDataText, productDescription)`, `analyzeWithMistral(prompt)`

- **ProductExpertAgent (Interview & Strategy)**
  - Purpose: Generate critical questions, simulate persona‑grounded answers, analyze Q&A pairs, and emit strategic advice; produce comparative reports in batch scenarios
  - Key methods: `conductSimulatedInterview(persona, productDescription)`, `generatePersonalizedQuestions(userProfile, previousInsights)`, `generateComparativeReport(userResults, productDescription)`

- **ElevenLabsAgent (Voice Synthesis)**
  - Purpose: Convert interview questions into high‑quality audio; auto‑select best‑fit voice from persona
  - Env: `ELEVENLABS_API_KEY`
  - Key methods: `generateInterviewAudio(questions, voiceConfig)`, `selectIntelligentVoice(personaSummary)`

- **CrossmintAgent (NFT Minting)**
  - Purpose: Build report metadata and mint via Crossmint API (Polygon)
  - Env: `CROSSMINT_API_KEY`, `CROSSMINT_CLIENT_SECRET`
  - Key methods: `buildNFTMetadata(reportData)`, `mintInsightNFT(recipientEmail, reportData)`

## 🧱 Architecture at a Glance

- Backend: Node.js + Express (serial orchestration, JSON APIs)
- Frontend: Lovable.dev (Vercel)
- AI: Mistral AI (chat completions)
- Voice: ElevenLabs
- Web3: Crossmint API (Polygon)
- Deployment: Railway (backend), Vercel (frontend)

## 🔐 Environment Variables

As used by `backend/check-environment.js` and agent implementations:

- Required:
  - `MISTRAL_API_KEY`
  - `ELEVENLABS_API_KEY`
  - `CROSSMINT_API_KEY`
  - `CROSSMINT_CLIENT_SECRET`
  - `PORT` (default 3001)
- Recommended (for live X API access):
  - `TWITTER_BEARER_TOKEN`

Quick check:
```bash
cd backend
node check-environment.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- API keys listed above (recommended to unlock the full pipeline)

### Install
```bash
git clone https://github.com/LuLu1016/InsightPilot.git
cd InsightPilot/backend
npm install
```

### Run Modes
Scripts in `backend/package.json`:

- Real mode (uses live X/Mistral/ElevenLabs/Crossmint APIs)
```bash
npm run start-real
# Optional, Twitter‑focused real script (if used)
npm run start-twitter-real
```

- Simplified modes (for local dev convenience)
```bash
npm start              # default: server-twitter-simple.js
# or
npm run start-simple   # server-simple.js
npm run start-original # server.js (minimal serial orchestration)
```

Base URL: `http://localhost:3001`

## 📡 API Endpoints

### Single User Analysis
```bash
POST /api/analyze
Content-Type: application/json
{
  "x_username": "@cagan",
  "product_description": "A tool that helps PMs automate user research."
}
```
Response includes: X data, Mistral persona and interview questions, simulated interview, voice metadata, and NFT mint result.

### Batch Analysis (Serial + Learning)
```bash
POST /api/batch-analyze
Content-Type: application/json
{
  "usernames": ["user1", "user2", "user3"],
  "product_description": "Your product description"
}
```
Response includes per‑user results, accumulated insights, and an optional comparative report.

### Health Check
```bash
GET /api/health
```

## 🔄 End‑to‑End Flow (Real Mode)
1) TwitterAgent → Fetch via X API → compute engagement, topics, sentiment, activity
2) MistralAgent → Produce JSON `persona` and `interviewQuestions` from structured user data + product context
3) ProductExpertAgent → Generate critical questions, simulate Q&A, emit strategic advice; in batch, personalize using accumulated learnings
4) ElevenLabsAgent → Persona‑aware voice selection and interview audio generation
5) CrossmintAgent → Build metadata and mint the insight NFT

## 🛡️ Reliability & Security
- Serial orchestration for rate control and context carryover; batch mode includes backoff to avoid rate limits
- Centralized error handling and graceful fallbacks (`backend/src/utils/errorHandler.js`)
- Never hard‑code secrets; use `.env` (excluded from VCS)

## 🧪 Test Scripts
From `backend`:
```bash
node test-complete.js
node test-batch.js
```

## 📚 Documentation
- `docs/API.md`: API details
- `docs/ARCHITECTURE.md`: Architecture overview
- `backend/DEPLOYMENT.md`: Deployment guide

## 📄 License
MIT License — see `LICENSE`.

## 🎯 Roadmap
- [ ] Expanded X API coverage and fields
- [ ] Frontend visualization and conversation trace
- [ ] Production deployment and observability (logs/metrics/alerts)
- [ ] Performance optimization and caching
- [ ] Additional AI/tooling agents