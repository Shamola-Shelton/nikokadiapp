import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FirebaseService } from '../services/FirebaseService';
import { Player, GameState } from '../types';

const { width, height } = Dimensions.get('window');

interface LobbyScreenProps {
  navigation: any;
  route: any;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const firebaseService = FirebaseService.getInstance();
  
  const [gameMode, setGameMode] = useState<'quick' | 'ranked' | 'private' | 'computer'>('computer');
  const [playerCount, setPlayerCount] = useState(2);
  const [roomCode, setRoomCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState(true);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);

  useEffect(() => {
    const params = route.params || {};
    if (params.gameMode) {
      setGameMode(params.gameMode);
    }
    if (params.isLocal) {
      setGameMode('computer');
    }
  }, [route.params]);

  const startMatchmaking = async () => {
    if (gameMode === 'private' && !roomCode.trim()) {
      Alert.alert('Error', 'Please enter a room code');
      return;
    }

    setIsSearching(true);
    
    try {
      const currentUser = firebaseService.getCurrentUser();
      const userProfile = await firebaseService.getUserProfile(currentUser?.uid || 'local_player');
      
      const currentPlayer: Player = {
        id: currentUser?.uid || 'local_player',
        name: userProfile?.username || 'Player',
        hand: [],
        isAI: false,
        rating: userProfile?.rating || 1000,
        coins: userProfile?.coins || 1000,
        cosmetics: userProfile?.equippedCosmetics || {
          avatar: 'default',
          cardBack: 'default',
          tableTheme: 'default'
        }
      };

      if (gameMode === 'computer') {
        // Start local game immediately
        navigation.navigate('Game', {
          gameMode: 'computer',
          playerCount,
          isLocal: true
        });
        return;
      }

      if (gameMode === 'private') {
        await firebaseService.joinPrivateRoom(roomCode.trim(), currentPlayer);
      } else {
        await firebaseService.findMatch(gameMode, playerCount, currentPlayer);
      }

      setIsHost(true);
      setPlayers([currentPlayer]);

    } catch (error) {
      console.error('Matchmaking failed:', error);
      Alert.alert('Error', 'Failed to start matchmaking');
      setIsSearching(false);
    }
  };

  const createPrivateRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert('Error', 'Please enter a room code');
      return;
    }

    try {
      const currentUser = firebaseService.getCurrentUser();
      const userProfile = await firebaseService.getUserProfile(currentUser?.uid || 'local_player');
      
      const hostPlayer: Player = {
        id: currentUser?.uid || 'local_player',
        name: userProfile?.username || 'Host',
        hand: [],
        isAI: false,
        rating: userProfile?.rating || 1000,
        coins: userProfile?.coins || 1000,
        cosmetics: userProfile?.equippedCosmetics || {
          avatar: 'default',
          cardBack: 'default',
          tableTheme: 'default'
        }
      };

      await firebaseService.createPrivateRoom(roomCode.trim(), hostPlayer);
      setIsHost(true);
      setPlayers([hostPlayer]);
      setIsSearching(true);

    } catch (error) {
      console.error('Failed to create room:', error);
      Alert.alert('Error', 'Failed to create private room');
    }
  };

  const leaveLobby = () => {
    if (currentGameId) {
      firebaseService.cancelMatchmaking();
    }
    navigation.goBack();
  };

  const startGame = () => {
    if (players.length < 2) {
      Alert.alert('Error', 'Need at least 2 players to start');
      return;
    }

    navigation.navigate('Game', {
      gameMode,
      playerCount: players.length,
      isLocal: false,
      gameId: currentGameId
    });
  };

  const gameModeOptions = [
    {
      id: 'quick',
      title: 'Quick Play',
      subtitle: 'Casual matches with anyone',
      icon: 'flash' as const,
      color: '#6366F1',
    },
    {
      id: 'ranked',
      title: 'Ranked',
      subtitle: 'Competitive matches with ratings',
      icon: 'trophy' as const,
      color: '#F59E0B',
    },
    {
      id: 'private',
      title: 'Private Room',
      subtitle: 'Play with friends using a code',
      icon: 'people' as const,
      color: '#10B981',
    },
    {
      id: 'computer',
      title: 'vs Computer',
      subtitle: 'Practice against AI opponents',
      icon: 'hardware-chip' as const,
      color: '#8B5CF6',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={leaveLobby}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Game Lobby
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Game Mode Selection */}
        {!isSearching && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Select Game Mode
            </Text>
            <View style={styles.gameModeGrid}>
              {gameModeOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.gameModeCard,
                    { backgroundColor: theme.colors.surface },
                    gameMode === option.id && { borderColor: option.color, borderWidth: 2 }
                  ]}
                  onPress={() => setGameMode(option.id as any)}
                >
                  <View style={[styles.gameModeIcon, { backgroundColor: option.color }]}>
                    <Ionicons name={option.icon} size={24} color="white" />
                  </View>
                  <Text style={[styles.gameModeTitle, { color: theme.colors.text }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.gameModeSubtitle, { color: theme.colors.textSecondary }]}>
                    {option.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Game Settings */}
        {!isSearching && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Game Settings
            </Text>
            
            {/* Player Count - Different for each mode */}
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Players
              </Text>
              <View style={styles.playerCountButtons}>
                {(gameMode === 'computer' ? [2, 3, 4, 5, 6] : [2, 3, 4]).map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.playerCountButton,
                      { backgroundColor: theme.colors.surface },
                      playerCount === count && { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={() => setPlayerCount(count)}
                  >
                    <Text style={[
                      styles.playerCountText,
                      { color: playerCount === count ? 'white' : theme.colors.text }
                    ]}>
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Private Room Code */}
            {gameMode === 'private' && (
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Room Code
                </Text>
                <TextInput
                  style={[
                    styles.roomCodeInput,
                    { backgroundColor: theme.colors.surface, color: theme.colors.text }
                  ]}
                  value={roomCode}
                  onChangeText={setRoomCode}
                  placeholder="Enter room code"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </View>
            )}
          </View>
        )}

        {/* Players List */}
        {(isSearching || gameMode === 'computer') && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Players ({players.length}/{gameMode === 'computer' ? playerCount : '∞'})
            </Text>
            <View style={styles.playersList}>
              {players.map((player, index) => (
                <View key={player.id} style={[styles.playerCard, { backgroundColor: theme.colors.surface }]}>
                  <View style={styles.playerInfo}>
                    <View style={[styles.playerAvatar, { backgroundColor: theme.colors.primary }]}>
                      <Ionicons 
                        name={player.isAI ? 'hardware-chip' : 'person'} 
                        size={20} 
                        color="white" 
                      />
                    </View>
                    <View style={styles.playerDetails}>
                      <Text style={[styles.playerName, { color: theme.colors.text }]}>
                        {player.name}
                      </Text>
                      <Text style={[styles.playerRating, { color: theme.colors.textSecondary }]}>
                        Rating: {player.rating}
                      </Text>
                    </View>
                  </View>
                  {index === 0 && (
                    <View style={[styles.hostBadge, { backgroundColor: theme.colors.warning }]}>
                      <Text style={styles.hostText}>HOST</Text>
                    </View>
                  )}
                </View>
              ))}
              
              {/* Empty slots for computer mode */}
              {gameMode === 'computer' && players.length < playerCount && (
                Array.from({ length: playerCount - players.length }).map((_, index) => (
                  <View key={`empty-${index}`} style={[styles.playerCard, styles.emptySlot, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.playerInfo}>
                      <View style={[styles.playerAvatar, { backgroundColor: theme.colors.border }]}>
                        <Ionicons name="add" size={20} color={theme.colors.textSecondary} />
                      </View>
                      <View style={styles.playerDetails}>
                        <Text style={[styles.playerName, { color: theme.colors.textSecondary }]}>
                          AI Player {players.length + index + 1}
                        </Text>
                        <Text style={[styles.playerRating, { color: theme.colors.textSecondary }]}>
                          Rating: {1000 + Math.floor(Math.random() * 200)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Search Status */}
        {isSearching && gameMode !== 'computer' && (
          <View style={styles.section}>
            <View style={[styles.searchStatus, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="search" size={24} color={theme.colors.primary} />
              <Text style={[styles.searchText, { color: theme.colors.text }]}>
                {gameMode === 'private' ? 'Waiting for players to join...' : 'Finding opponents...'}
              </Text>
              <View style={styles.searchDots}>
                <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {!isSearching ? (
            gameMode === 'private' ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton, { backgroundColor: theme.colors.secondary }]}
                  onPress={createPrivateRoom}
                >
                  <Text style={styles.actionButtonText}>Create Room</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                  onPress={startMatchmaking}
                >
                  <Text style={styles.actionButtonText}>Join Room</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                onPress={startMatchmaking}
              >
                <Text style={styles.actionButtonText}>
                  {gameMode === 'computer' ? 'Start Game' : 'Start Matchmaking'}
                </Text>
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton, { backgroundColor: theme.colors.secondary }]}
                onPress={leaveLobby}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              {(gameMode === 'computer' || (isHost && players.length >= 2)) && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                  onPress={startGame}
                >
                  <Text style={styles.actionButtonText}>Start Game</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  gameModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gameModeCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  gameModeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameModeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  gameModeSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  playerCountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  playerCountButton: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  playerCountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  roomCodeInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  playersList: {
    gap: 8,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  emptySlot: {
    opacity: 0.6,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  playerRating: {
    fontSize: 12,
  },
  hostBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hostText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchStatus: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 16,
  },
  searchDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionSection: {
    paddingBottom: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
  },
  secondaryButton: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LobbyScreen;
