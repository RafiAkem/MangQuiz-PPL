# Custom AI-Generated Questions Feature

This feature allows you to generate custom trivia questions using Google's Gemini AI in local mode.

## Setup

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure the API Key

Create a `.env` file in the root directory of the project and add:

```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you copied from Google AI Studio.

### 3. Restart the Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## Usage

### Accessing the Feature

1. Start the application
2. Select "Local (Party) Mode"
3. Add 2-4 players to the game
4. Click the "AI-Generated Questions" button
5. Configure your question preferences
6. Generate and start the game

### Configuration Options

- **Category**: Choose from various topics including History, Science, Geography, Literature, Sports, and Entertainment
- **Difficulty**: Easy, Medium, or Hard
- **Number of Questions**: 5, 10, 15, 20, or 25 questions
- **Custom Topic**: Optional specific focus area (e.g., "Ancient Rome", "World War II")

### Features

- **Real-time Connection Testing**: The app tests the Gemini AI connection on load
- **Question Preview**: See a preview of generated questions before starting
- **Error Handling**: Clear error messages for API issues
- **Fallback Support**: If AI is unavailable, you can still use the regular game mode

## Technical Details

### Files Added/Modified

- `client/src/lib/services/geminiService.ts` - Gemini AI service
- `client/src/components/game/CustomQuestionsSetup.tsx` - Custom questions UI
- `client/src/lib/stores/useTriviaGame.ts` - Updated game store
- `client/src/components/game/GameLobby.tsx` - Added AI questions button
- `client/src/App.tsx` - Added routing
- `package.json` - Added Google AI SDK dependency

### Dependencies

- `@google/generative-ai` - Official Google AI SDK for Gemini

### Environment Variables

- `VITE_GEMINI_API_KEY` - Required for AI functionality

## Troubleshooting

### API Key Issues

- **"API Key Required"**: Make sure you've created a `.env` file with your API key
- **"Connection Failed"**: Check your internet connection and API key validity
- **"API quota exceeded"**: You may need to wait or upgrade your Google AI plan

### Common Issues

1. **Questions not generating**: Check the browser console for error messages
2. **Connection test fails**: Verify your API key is correct and has proper permissions
3. **Slow generation**: Large question sets may take longer to generate

## Security Notes

- The API key is only used on the client side for local games
- No questions or API keys are stored on the server
- API usage is subject to Google's terms of service and rate limits

## Future Enhancements

- Question caching to reduce API calls
- Custom question templates
- Question difficulty adjustment based on player performance
- Integration with multiplayer mode
