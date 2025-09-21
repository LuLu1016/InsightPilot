# InsightPilot

InsightPilot is a backend-orchestrated multi-agent system that transforms public social signals into actionable user intelligence. By coordinating specialized agents in a deterministic, serial workflow, the platform delivers an end-to-end pipeline: X (Twitter) data ingestion → persona and interview question generation → simulated product interview → voice synthesis → NFT report creation.

## 🚀 Key Features

- **Serial Multi-Agent Orchestration**: Predictable sequencing and backpressure-friendly rate control
- **Live X API Data**: User profile and recent tweets fetched via the X API (Bearer Token)
- **Mistral AI Analysis**: High-precision persona synthesis and interview question generation
- **Product Interview Simulation**: Actionable, strategy-focused Q&A with accumulated learnings
- **ElevenLabs Voice**: High-quality audio generation with persona-aware voice selection
- **Crossmint NFT**: Insight reports minted as NFTs for credibility and shareability
- **Batch with Learning**: Serial batch interviews that carry forward insights for better questions

## 🧠 Agents & Responsibilities

- **TwitterAgent (X Data Ingestion)**
  - Purpose: Fetch user profile and recent tweets via the X API; derive engagement metrics, topics, sentiment, and activity patterns
  - Env: `TWITTER_BEARER_TOKEN`
  - Key methods: `getUserProfile(username)`, `getUserTweets(userId)`, `analyzeUser(input)`

- **MistralAgent (Persona & Questions)**
  - Purpose: Call Mistral Chat Completions API to produce structured JSON: persona + interviewQuestions
  - Env: `MISTRAL_API_KEY`
  - Key methods: `analyzeUserProfile(userDataText, productDescription)`, `analyzeWithMistral(prompt)`

- **ProductExpertAgent (Interview & Strategy)**
  - Purpose: Generate critical questions, simulate persona-grounded answers, analyze Q&A pairs, and emit strategic advice; generate comparative reports for batches
  - Key methods: `conductSimulatedInterview(persona, productDescription)`, `generatePersonalizedQuestions(userProfile, previousInsights)`, `generateComparativeReport(userResults, productDescription)`

- **ElevenLabsAgent (Voice Synthesis)**
  - Purpose: Convert interview questions into high-quality audio; auto-select best-fitting voice from persona
  - Env: `ELEVENLABS_API_KEY`
  - Key methods: `generateInterviewAudio(questions, voiceConfig)`, `selectIntelligentVoice(personaSummary)`

- **CrossmintAgent (NFT Minting)**
  - Purpose: Build report metadata and mint via Crossmint API
  - Env: `CROSSMINT_API_KEY`, `CROSSMINT_CLIENT_SECRET`
  - Key methods: `buildNFTMetadata(reportData)`, `mintInsightNFT(recipientEmail, reportData)`

## 🧱 Tech Stack

- Backend: Node.js + Express
- Frontend: Lovable.dev (Vercel)
- AI: Mistral AI (chat completions)
- Voice: ElevenLabs
- Web3: Crossmint API (Polygon)
- Deployment: Railway (backend), Vercel (frontend)

## 🔐 Environment Variables

As used by `backend/check-environment.js` and agent code:

- Required:
  - `MISTRAL_API_KEY`
  - `ELEVENLABS_API_KEY`
  - `CROSSMINT_API_KEY`
  - `CROSSMINT_CLIENT_SECRET`
  - `PORT` (default 3001)
- Recommended (required for live X API access):
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
- API keys listed above (recommended to enable the full pipeline)

### Install
```bash
git clone https://github.com/LuLu1016/InsightPilot.git
cd InsightPilot/backend
npm install
```

### Run (Multiple Modes)
Scripts in `backend/package.json`:

- Real mode (uses live X/Mistral/ElevenLabs/Crossmint APIs)
```bash
npm run start-real
# or a Twitter-focused real script (if used)
npm run start-twitter-real
```

- Simplified modes (for local dev convenience)
```bash
npm start              # default: server-twitter-simple.js
# or
npm run start-simple   # server-simple.js
npm run start-original # server.js (minimal serial orchestration)
```

Default base URL: `http://localhost:3001`

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
Response includes: X data, Mistral persona and interview questions, simulated interview, voice metadata, and NFT minting result.

### Batch Analysis (Serial + Learning)
```bash
POST /api/batch-analyze
Content-Type: application/json
{
  "usernames": ["user1", "user2", "user3"],
  "product_description": "Your product description"
}
```
Response includes per-user results, accumulated insights, and an optional comparative report.

### Health Check
```bash
GET /api/health
```

## 🔄 End-to-End Flow (Real Mode)
1) TwitterAgent: Fetch via X API → compute engagement, topics, sentiment, activity
2) MistralAgent: Produce JSON persona and interviewQuestions from structured user data + product context
3) ProductExpertAgent: Generate critical questions, simulate Q&A, and produce strategic advice; in batch mode, personalize questions with accumulated learnings
4) ElevenLabsAgent: Select voice by persona and generate interview audio
5) CrossmintAgent: Build metadata and mint the insight NFT

## 🧪 Test Scripts
From `backend`:
```bash
node test-complete.js
node test-batch.js
```

## 📁 Project Structure
```
insightpilot/
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   ├── utils/
│   │   └── server.js
│   ├── test-*.js
│   └── package.json
├── frontend/
├── docs/
│   ├── API.md
│   └── ARCHITECTURE.md
└── README.md
```

## 🛡️ Reliability & Security
- Serial orchestration provides rate control and context accumulation; batch mode includes built-in delays to avoid rate limits
- Centralized error handling and graceful fallbacks (`backend/src/utils/errorHandler.js`)
- Secrets must not be hard-coded; inject via `.env` (excluded from VCS)

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