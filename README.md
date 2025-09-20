# InsightPilot

InsightPilot is an autonomous agentic system that transforms social data into actionable user intelligence. By orchestrating multiple specialized AI agents through Coral Protocol, we automate the entire user research workflow - from analyzing Twitter profiles to generating personalized interview questions and creating shareable insight assets.

## 🚀 Features

- 🤖 **Multi-Agent Orchestration**: Coral Protocol coordinates specialized AI agents
- 🧠 **Intelligent Analysis**: Mistral AI powers user persona generation and interview questions
- 🎤 **Voice Synthesis**: ElevenLabs integration for audio interview questions
- 🪙 **Web3 Integration**: Crossmint NFT minting for shareable insight assets
- 📊 **Batch Analysis**: Serial user interviews with learning accumulation
- 🎯 **Personalized Questions**: Dynamic question generation based on user profiles and historical insights

## 🏗️ Architecture

### Core Components
- **Twitter Agent**: Social media data analysis
- **Mistral Agent**: AI-powered persona and question generation
- **ProductExpert Agent**: Simulated user interviews and strategic advice
- **ElevenLabs Agent**: Intelligent voice synthesis
- **Crossmint Agent**: NFT asset creation
- **Coral Agent**: Multi-agent coordination

### Technology Stack
- **Backend**: Node.js + Express.js
- **Frontend**: Lovable.dev platform
- **AI Services**: Mistral AI, ElevenLabs, Coral Protocol
- **Web3**: Crossmint API
- **Deployment**: Railway (backend), Vercel (frontend)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- API keys for Mistral AI, ElevenLabs, Crossmint

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LuLu1016/InsightPilot.git
   cd InsightPilot
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The server will start at `http://localhost:3001`

## 📡 API Endpoints

### Single User Analysis
```bash
POST /api/analyze
{
  "x_username": "username",
  "product_description": "Your product description"
}
```

### Batch User Analysis
```bash
POST /api/batch-analyze
{
  "usernames": ["user1", "user2", "user3"],
  "product_description": "Your product description"
}
```

### Health Check
```bash
GET /api/health
```

## 🧪 Testing

Run the complete test suite:
```bash
cd backend
node test-complete.js
```

Test batch analysis functionality:
```bash
node test-batch.js
```

## 📁 Project Structure

```
insightpilot/
├── backend/                 # Backend services
│   ├── src/
│   │   ├── agents/         # AI agent modules
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── test-*.js           # Test scripts
│   └── package.json
├── frontend/               # Frontend workspace
├── docs/                   # Documentation
│   ├── API.md
│   └── ARCHITECTURE.md
└── README.md
```

## 🔧 Development

1. Ensure all API keys are configured in `.env`
2. Start Coral Protocol server (port 8000) - optional
3. Start backend development server (port 3001)
4. Develop frontend application in Lovable.dev

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Deployment Guide](backend/DEPLOYMENT.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Real-time Twitter API integration
- [ ] Advanced Coral Protocol features
- [ ] Frontend application development
- [ ] Production deployment
- [ ] Performance optimization
- [ ] Additional AI agent integrations