# QuizRush Multiplayer Lobby System

## Overview

The QuizRush multiplayer lobby system enables real-time online multiplayer trivia games with features like room creation, player management, chat, and synchronized gameplay.

## Features

### 🏠 Room Management

- **Create Rooms**: Hosts can create public or private rooms with custom settings
- **Join Rooms**: Players can browse and join available rooms (public and private)
- **Private Rooms**: Password-protected rooms with "Private" indicator
- **Room Settings**: Configurable difficulty, category, and question count
- **Real-time Updates**: All room changes are synchronized in real-time

### 👥 Player Management

- **Real-time Player List**: See all players in the room with their status
- **Ready System**: Players must mark themselves as ready before the game can start
- **Host Controls**: Only the host can start the game and modify settings
- **Auto Host Transfer**: If the host leaves, the next player becomes host
- **Max Players**: Hosts can set and change the maximum number of players (2-8)
- **Player Count**: Real-time display of current players vs max players

### 💬 Real-time Chat

- **In-game Chat**: Players can communicate during the lobby
- **Message History**: Chat messages are displayed in real-time
- **Player Identification**: Messages show the sender's name

### 🎮 Game Synchronization

- **Countdown Timer**: Synchronized 5-second countdown before game start
- **Real-time Updates**: All players see the same game state
- **Score Tracking**: Live score updates during gameplay
- **Connection Status**: Visual indicator of WebSocket connection
- **Timer System**: 20-second timer for each question
- **Answer Reveal**: Shows correct answers after each question

## Technical Implementation

### Backend (Server)

#### WebSocket Server

- **Real-time Communication**: Uses WebSocket for instant messaging
- **Room Management**: In-memory storage of active rooms and players
- **Message Handling**: Processes various message types (join, leave, ready, etc.)

#### API Endpoints

- `GET /api/rooms` - List all public rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:roomId` - Get room details

#### Message Types

```typescript
// Client to Server
{
  type: 'join_room' | 'leave_room' | 'player_ready' | 'start_game' | 'chat_message' | 'update_settings' | 'answer',
  // ... additional data
}

// Server to Client
{
  type: 'room_joined' | 'player_joined' | 'player_left' | 'player_ready_changed' | 'all_players_ready' | 'game_starting' | 'countdown' | 'game_started' | 'chat_message' | 'settings_updated' | 'error',
  // ... additional data
}
```

### Frontend (Client)

#### Components

- **MultiplayerLobby**: Main lobby interface with room management
- **MultiplayerGame**: Real-time multiplayer game component
- **WebSocket Integration**: Handles real-time communication

#### State Management

- **Room State**: Current room, players, settings
- **Connection State**: WebSocket connection status
- **Game State**: Ready status, countdown, game progress

## Usage

### Creating a Room

1. Navigate to "Online Multiplayer" from the mode selection
2. Fill in room name and your player name
3. Choose max players (2-8)
4. Optionally enable private room with password
5. Configure game settings (difficulty, category, questions)
6. Click "Create Room"

### Joining a Room

1. Browse available rooms in the lobby
2. Click "Join" on a room
3. Enter your player name
4. If it's a private room, enter the password
5. Click "Join Room"

### Starting a Game

1. All players must mark themselves as "Ready"
2. The host clicks "Start Game"
3. A 5-second countdown begins
4. All players are automatically redirected to the multiplayer game

### In-Game Features

- **Real-time Scoring**: See all players' scores update live
- **Answer Tracking**: See who has answered each question
- **Synchronized Questions**: All players see the same question simultaneously
- **Connection Monitoring**: Visual indicator of connection status

## File Structure

```
server/
├── routes.ts          # WebSocket server and API endpoints
└── index.ts           # Express server setup

client/src/components/game/
├── MultiplayerLobby.tsx    # Main lobby component
├── MultiplayerGame.tsx     # Multiplayer game component
└── TriviaGame.tsx          # Original single-player game

client/src/App.tsx          # Updated with multiplayer routes
```

## Dependencies

### Backend

- `ws`: WebSocket server implementation
- `uuid`: Generate unique room and player IDs
- `express`: HTTP server framework

### Frontend

- `sonner`: Toast notifications
- `lucide-react`: Icons
- `@radix-ui/react-*`: UI components

## Configuration

### Environment Variables

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

### WebSocket Configuration

- **Protocol**: Automatically detects HTTP/HTTPS and uses WS/WSS accordingly
- **Reconnection**: Automatic reconnection on connection loss
- **Error Handling**: Graceful error handling with user notifications

## Security Considerations

### Room Security

- **Private Rooms**: Password protection for private games
- **Room Validation**: Server-side validation of room access
- **Player Limits**: Maximum 4 players per room

### Data Validation

- **Input Sanitization**: All user inputs are validated
- **Message Validation**: WebSocket messages are validated before processing
- **Error Handling**: Comprehensive error handling and user feedback

## Future Enhancements

### Planned Features

- **Spectator Mode**: Allow players to watch games without participating
- **Tournament System**: Multi-round tournament support
- **Custom Questions**: Allow hosts to add custom questions
- **Voice Chat**: Real-time voice communication
- **Achievement System**: Player achievements and statistics

### Technical Improvements

- **Database Integration**: Persistent room and player data
- **Redis Caching**: Improved performance for room management
- **Load Balancing**: Support for multiple server instances
- **Analytics**: Game statistics and player analytics

## Troubleshooting

### Common Issues

#### Connection Problems

- Check if the server is running
- Verify WebSocket URL configuration
- Check browser console for connection errors

#### Room Issues

- Ensure room name and player name are provided
- Check if room is full (max 4 players)
- Verify password for private rooms

#### Game Start Issues

- All players must be ready
- Need at least 2 players to start
- Only the host can start the game

### Debug Information

- Connection status is displayed in the UI
- Toast notifications provide error feedback
- Browser console shows detailed error information

## Contributing

When contributing to the multiplayer system:

1. **Test WebSocket Connections**: Ensure real-time features work correctly
2. **Handle Edge Cases**: Consider disconnections, room cleanup, etc.
3. **Update Documentation**: Keep this README updated with new features
4. **Follow Patterns**: Maintain consistency with existing code structure

## License

This multiplayer system is part of the QuizRush project and follows the same licensing terms.
