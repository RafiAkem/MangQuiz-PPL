import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { GameLobby } from "./components/game/GameLobby";
import { LocalTriviaGame } from "./components/game/LocalTriviaGame";
import { MultiplayerLobby } from "./components/game/MultiplayerLobby";
import { OneVsOneLobby } from "./components/game/OneVsOneLobby";
import { CustomQuestionsSetup } from "./components/game/CustomQuestionsSetup";
import { IntroScreen } from "./components/game/IntroScreen";
import { Toaster } from "./components/ui/sonner";
import { MultiplayerTriviaGame } from "./components/game/MultiplayerTriviaGame";
import { WebSocketProvider } from "./lib/contexts/WebSocketContext";
import { ModeSelect } from "./components/game/ModeSelect";




function AppContent() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <IntroScreen onStart={() => window.location.href = "/mode"} />
          }
        />
        <Route path="/mode" element={<ModeSelect />} />
        <Route path="/mode/local" element={<GameLobby />} />
        <Route path="/mode/multiplayer" element={<MultiplayerLobby />} />
        <Route path="/mode/1v1" element={<OneVsOneLobby />} />
        <Route path="/game" element={<LocalTriviaGame />} />
        <Route
          path="/multiplayer-game"
          element={
            <MultiplayerTriviaGame
              playerId={location.state?.playerId}
              players={location.state?.players}
            />
          }
        />
        <Route path="/custom-questions" element={<CustomQuestionsSetup />} />
        {/* You can add more routes for results, etc. */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <WebSocketProvider>
      <Router>
        <AppContent />
      </Router>
    </WebSocketProvider>
  );
}

export default App;
