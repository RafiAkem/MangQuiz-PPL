import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { GameLobby } from "./components/game/GameLobby";
import { LocalTriviaGame } from "./components/game/LocalTriviaGame";
import { MultiplayerLobby } from "./components/game/MultiplayerLobby";
import { OneVsOneLobby } from "./components/game/OneVsOneLobby";
import { CustomQuestionsSetup } from "./components/game/CustomQuestionsSetup";
import { LandingPage } from "./components/landing/LandingPage";
import { Toaster } from "./components/ui/sonner";
import { MultiplayerTriviaGame } from "./components/game/MultiplayerTriviaGame";
import { WebSocketProvider } from "./lib/contexts/WebSocketContext";
import { ModeSelect } from "./components/game/ModeSelect";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import AuthPage from "./pages/AuthPage";
import RankedDashboard from "./pages/RankedDashboard";
import LeaderboardPage from "./pages/LeaderboardPage";
import { Loader2 } from "lucide-react";
import { useAudio } from "./lib/stores/useAudio";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F2F0E9]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0022FF]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const {
    setBackgroundMusic,
    setHitSound,
    setSuccessSound,
  } = useAudio();
  const location = useLocation();

  // Audio setup
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const bgMusic = new Audio("/sounds/background.mp3");
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
        setBackgroundMusic(bgMusic);

        const hitSound = new Audio("/sounds/hit.mp3");
        hitSound.volume = 0.5;
        setHitSound(hitSound);

        const successSound = new Audio("/sounds/success.mp3");
        successSound.volume = 0.6;
        setSuccessSound(successSound);
      } catch (error) {
        console.log("Audio initialization failed:", error);
      }
    };
    initializeAudio();
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <div className="relative min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/mode"
          element={
            <ProtectedRoute>
              <ModeSelect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mode/ranked"
          element={
            <ProtectedRoute>
              <RankedDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mode/local"
          element={
            <ProtectedRoute>
              <GameLobby />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mode/multiplayer"
          element={
            <ProtectedRoute>
              <MultiplayerLobby />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mode/1v1"
          element={
            <ProtectedRoute>
              <OneVsOneLobby />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <LocalTriviaGame />
            </ProtectedRoute>
          }
        />
        <Route
          path="/multiplayer-game"
          element={
            <ProtectedRoute>
              <MultiplayerTriviaGame
                playerId={location.state?.playerId}
                players={location.state?.players}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/custom-questions"
          element={
            <ProtectedRoute>
              <CustomQuestionsSetup />
            </ProtectedRoute>
          }
        />
        {/* You can add more routes for results, etc. */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <Router>
            <AppContent />
          </Router>
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

