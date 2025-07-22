# Task mAIstro: Voice-Driven Email Assistant

Task mAIstro is an AI-powered voice assistant that helps you manage your email inbox and tasks through natural conversation. With Task mAIstro, you can process your entire inbox hands-free during your commute, allowing you to arrive at work with a completely cleared inbox.

## 🌟 Key Features

- **Voice-First Interface**: Process emails using only your voice
- **Email Management**: Read, send, reply to, and organize emails
- **Task Management**: Convert emails to tasks and manage your to-do list
- **Context Awareness**: Remembers your preferences and communication style
- **Accessibility Support**: Full digital access without typing

## 🏗️ Architecture

Task mAIstro follows a three-layer architecture:

### Layer 1: Voice Interface
- Speech-to-text conversion (OpenAI Whisper)
- Text-to-speech synthesis (ElevenLabs)
- Real-time conversation (OpenAI Realtime API)

### Layer 2: AI Task Management Brain
- LangGraph orchestration for decision making
- Three-tier memory system (User Profile, ToDo Management, Interaction Preferences)
- Natural language understanding and generation

### Layer 3: Email Operations
- Gmail integration via microservice
- OAuth authentication for secure access
- Email CRUD operations

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Google Cloud Platform account (for Gmail API)
- OpenAI API key
- ElevenLabs API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/task-maistro.git
cd task-maistro
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Install Gmail microservice dependencies:
```bash
cd gmail-service
npm install
```

## 🖥️ Usage

### Text-Based Interface

1. Start the Task mAIstro system:
```bash
python task_maistro/task_maistro.py
```

2. Interact through the command line or use LangGraph Studio.

### Voice Interface (Jupyter Notebook)

1. Launch the Jupyter notebook:
```bash
jupyter notebook task_mAIstro/ntbk/audio_ux.ipynb
```

2. Follow the instructions in the notebook to interact with Task mAIstro using voice.

### Web Interface (When Implemented)

1. Start the Gmail microservice:
```bash
cd gmail-service
npm start
```

2. Start the Task mAIstro API:
```bash
cd voice-interface
python voice_api.py
```

3. Open a web browser and navigate to `http://localhost:8000`.

## 📋 Implementation Plan

The full implementation plan is available in [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md). Key phases include:

1. **Gmail Integration**: Connect Task mAIstro to Gmail (Weeks 1-2)
2. **Production Voice Interface**: Develop web and mobile interfaces (Weeks 3-4)
3. **Production Deployment**: Containerize and deploy services (Weeks 5-6)
4. **Advanced Features**: Add email threading, search, and analytics (Weeks 7-10)

Detailed Gmail integration approach is documented in [GMAIL_INTEGRATION.md](./GMAIL_INTEGRATION.md).

## 🌐 Deployment

Task mAIstro can be deployed using Docker:

```bash
docker-compose up -d
```

This will start all necessary services:
- Gmail microservice
- Task mAIstro with voice interface
- Web frontend (when implemented)

## 📚 Documentation

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OpenAI Whisper Documentation](https://platform.openai.com/docs/guides/speech-to-text)
- [ElevenLabs Documentation](https://docs.elevenlabs.io/)

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
