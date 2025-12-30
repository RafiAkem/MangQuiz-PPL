import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTriviaGame } from '../../lib/stores/useTriviaGame';
import { UserPlus, X, Users } from 'lucide-react';

export function PlayerSetup() {
  const { players, addPlayer, removePlayer } = useTriviaGame();
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (newPlayerName.trim() && players.length < 4) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddPlayer();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Player Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Player */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={players.length >= 4}
              className="flex-1"
            />
            <Button
              onClick={handleAddPlayer}
              disabled={!newPlayerName.trim() || players.length >= 4}
              size="sm"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          {players.length >= 4 && (
            <p className="text-sm text-gray-500">Maximum 4 players allowed</p>
          )}
        </div>

        {/* Player List */}
        <div className="space-y-2">
          {players.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <span className="font-medium">{player.name}</span>
                <Badge variant="outline" className="text-xs">
                  Player {index + 1}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePlayer(player.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {players.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No players added yet</p>
            <p className="text-sm">Add 2-4 players to start the game</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
