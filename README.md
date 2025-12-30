# MangQuiz Challenge

## Description

MangQuiz Challenge is an interactive trivia game that combines traditional quiz mechanics with modern AI technology. Built as an IBM x Hacktiv8 Capstone Project, it features both local multiplayer and online multiplayer modes, with the unique ability to generate custom questions using Google's Gemini AI. Players can test their knowledge across multiple categories, compete in real-time, and enjoy a seamless gaming experience with beautiful animations and responsive design.

## Technologies Used

### Frontend

- **React 18** with TypeScript for type-safe development
- **Vite** for fast build tooling and development server
- **Tailwind CSS** for utility-first styling
- **Zustand** for lightweight state management
- **Radix UI** for accessible component primitives
- **Lucide React** for consistent iconography

### Backend

- **Express.js** for RESTful API endpoints
- **WebSocket** for real-time multiplayer communication
- **UUID** for unique identifier generation

### AI Integration

- **Google Generative AI SDK** for Gemini API integration
- **Google Gemini 2.0 Flash** model for question generation

### Development Tools

- **TypeScript** for type safety
- **ESLint** and **Prettier** for code quality
- **PostCSS** for CSS processing

## Features

### 🎮 Game Modes

- **Local (Party) Mode**: 2-4 players on one device with pass-and-play mechanics
- **Online Multiplayer**: Real-time multiplayer battles with WebSocket technology
- **AI-Generated Questions**: Unlimited custom trivia questions powered by Google Gemini

### 🧠 AI-Powered Custom Questions

- Generate questions across multiple categories (History, Science, Geography, Literature, Sports, Entertainment)
- Adjustable difficulty levels (Easy, Medium, Hard)
- Custom topic focus for personalized quizzes
- Real-time question generation with instant game start

### 🏆 Core Game Features

- 5-minute lightning rounds for quick gameplay
- Real-time scoring and dynamic leaderboards
- Multiple choice questions with detailed explanations
- Beautiful, responsive UI with smooth animations
- Sound effects and visual feedback for enhanced UX
- Cross-platform compatibility

### 🎨 User Experience

- Modern gradient design with purple/indigo theme
- Smooth transitions and micro-interactions
- Mobile-responsive layout
- Intuitive navigation and game flow

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd QuizRush
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the `client/` directory:

   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

### AI Setup (Optional)

1. **Get Gemini API Key**

   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file as `VITE_GEMINI_API_KEY`

2. **Test AI Integration**
   - Navigate to Local Mode
   - Select "AI-Generated Questions"
   - Configure your preferences and generate questions

### Production Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## AI Support Explanation

### How AI Integration Works

MangQuiz Challenge leverages Google's Gemini 2.0 Flash model to generate dynamic, engaging trivia questions. The AI integration works through several key components:

#### Question Generation Process

1. **User Configuration**: Players select category, difficulty, and question count
2. **API Request**: The frontend sends a structured prompt to Gemini API
3. **Response Processing**: AI-generated questions are formatted and validated
4. **Game Integration**: Questions are seamlessly integrated into the game flow

#### AI Features

- **Category-Specific Questions**: AI generates questions tailored to selected categories
- **Difficulty Scaling**: Questions are adjusted based on difficulty level
- **Custom Topics**: Players can specify custom topics for personalized quizzes
- **Real-time Generation**: Questions are generated on-demand for fresh content

#### Technical Implementation

- **Google Generative AI SDK**: Official SDK for reliable API communication
- **Error Handling**: Graceful fallback to standard questions if AI fails
- **Rate Limiting**: Respects Google's API rate limits
- **Caching**: Optimized for performance and cost efficiency

#### Benefits

- **Unlimited Content**: No predefined question limits
- **Fresh Questions**: Each game can have unique questions
- **Personalized Experience**: Custom topics and difficulty levels
- **Scalable**: Can generate questions for any category or topic

### AI Usage Guidelines

- Requires valid Gemini API key
- Subject to Google's terms of service
- Rate limits apply based on Google's pricing
- Recommended for enhanced gameplay experience

---

**Developed by**: Rafi Ikhsanul Hakim  
**Project**: IBM x Hacktiv8 Capstone Project  
**License**: MIT License

For detailed documentation on specific features:

- [Custom Questions Setup](./CUSTOM_QUESTIONS_README.md)
- [Multiplayer Implementation](./MULTIPLAYER_README.md)
- [Deployment Guide](./DEPLOYMENT.md)
