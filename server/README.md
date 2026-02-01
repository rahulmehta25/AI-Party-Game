# AI Party Game - Backend Server

Real AI judging powered by Claude!

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file in the server directory:
```bash
cp ../.env.example .env
# Edit .env and add your Anthropic API key
```

3. Start the server:
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

The server runs on `http://localhost:3001` by default.

## API Endpoints

- `POST /api/judge-prompt-battle` - Judge Prompt Battle answers
- `POST /api/judge-story` - Judge Story Builder contributions  
- `POST /api/generate-trivia` - Generate trivia questions
- `POST /api/generate-prompts` - Generate creative prompts
- `GET /api/health` - Health check

## Configuration

The frontend (`game.js`) has an `AI_CONFIG` object at the top:
- `serverUrl` - Backend server URL (default: `http://localhost:3001`)
- `useRealAI` - Enable/disable AI (falls back to mock if false or server unavailable)
- `timeout` - Request timeout in ms
