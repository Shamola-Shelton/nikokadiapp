import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { GameEngine, Card, Player, GameState, GameMove, Suit } from '../engine/GameEngine';

const { width, height } = Dimensions.get('window');

interface GameScreenProps {
  navigation: any;
  route: any;
}

const GameScreen: React.FC<GameScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const gameEngine = new GameEngine();
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [topCard, setTopCard] = useState<Card | null>(null);
  const [penaltyStack, setPenaltyStack] = useState(0);
  const [nikoDeclared, setNikoDeclared] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const aiTurnInProgressRef = useRef(false);
  const humanPlayerIdRef = useRef<string | null>(null);

  const humanPlayer = gameState && humanPlayerIdRef.current
    ? gameState.players.find(p => p.id === humanPlayerIdRef.current) || null
    : null;

  const isHumanTurn = !!(gameState && humanPlayer && gameState.players[gameState.currentPlayerIndex]?.id === humanPlayer.id);

  // Get playable cards for the human player
  const playableCards = isHumanTurn && humanPlayer ? gameEngine.getValidCards(humanPlayer.hand) : [];
  const playableCardIdSet = new Set(playableCards.map((c: Card) => c.id));
  
  // Get valid multi-card combinations
  const validMultiCardCombinations = isHumanTurn && humanPlayer ? gameEngine.getValidMultiCardCombinations(humanPlayer.id) : [];
  const multiCardCombinationIds = new Set(validMultiCardCombinations.flat().map((c: Card) => c.id));
  
  // Get cards that can be added to current selection
  const cardsThatCanBeAdded = isHumanTurn && humanPlayer ? gameEngine.getCardsThatCanBeAdded(humanPlayer.id, selectedCards) : [];
  const addableCardIds = new Set(cardsThatCanBeAdded.map((c: Card) => c.id));
  
  // Check if current selection forms a valid multi-card combination
  const isValidMultiCardSelection = selectedCards.length > 1 && 
    gameEngine.isValidMultiCardCombination(humanPlayer?.id || '', selectedCards.map(c => c.id));

  useEffect(() => {
    if (currentPlayer?.isAI && !aiTurnInProgressRef.current && !gameOver) {
      handleAITurn();
    }
  }, [currentPlayer?.id, currentPlayer?.isAI, gameState, gameOver]);

  useEffect(() => {
    initializeGame();
    return () => {
      // Cleanup
    };
  }, []);

  const initializeGame = async () => {
    try {
      setIsLoading(true);
      
      // Get route parameters with defaults
      const params = route.params || {};
      const gameMode = params.gameMode || 'computer';
      const playerCount = params.playerCount || 2;
      const isLocal = params.isLocal !== false;
      
      console.log('Initializing game with:', { gameMode, playerCount, isLocal });
      
      // Create players
      const players: Player[] = [];
      
      // Add human player
      const humanPlayerData: Player = {
        id: 'local_player',
        name: 'You',
        hand: [],
        isAI: false,
        rating: 1000,
        coins: 1000,
        cosmetics: {
          avatar: 'default',
          cardBack: 'default',
          tableTheme: 'default'
        }
      };
      
      players.push(humanPlayerData);
      humanPlayerIdRef.current = 'local_player';

      // Add AI players (support up to 5 AI players for 6 total)
      for (let i = 1; i < playerCount; i++) {
        players.push({
          id: `ai_${i}`,
          name: `AI ${i}`,
          hand: [],
          isAI: true,
          rating: 1000 + Math.floor(Math.random() * 200),
          coins: 1000,
          cosmetics: {
            avatar: 'ai',
            cardBack: 'default',
            tableTheme: 'default'
          }
        });
      }

      // Initialize game
      gameEngine.initializeGame(players);
      const newGameState = gameEngine.getGameState();
      
      if (!newGameState) {
        throw new Error('Failed to initialize game state');
      }
      
      setGameState(newGameState);
      setCurrentPlayer(newGameState.players[newGameState.currentPlayerIndex]);
      setTopCard(gameEngine.getTopCard());
      setPenaltyStack(newGameState.activePenaltyStack);
      setSelectedCards([]);
      setGameOver(false);
      setWinner(null);
      setNikoDeclared(false);
      aiTurnInProgressRef.current = false;
      setIsLoading(false);

    } catch (error) {
      console.error('Failed to initialize game:', error);
      Alert.alert('Error', `Failed to start game: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const handleGameEnd = (finalGameState: GameState) => {
    setGameOver(true);
    const winnerPlayer = finalGameState.players.find(p => p.id === finalGameState.winner);
    setWinner(winnerPlayer || null);
    
    setTimeout(() => {
      Alert.alert(
        'Game Over!',
        `${winnerPlayer?.name} wins!`,
        [
          { text: 'Play Again', onPress: () => initializeGame() },
          { text: 'Return to Lobby', onPress: () => navigation.goBack() }
        ]
      );
    }, 1000);
  };

  const handleCardSelect = (card: Card) => {
    if (!isHumanTurn) return;
    
    const isSelected = selectedCards.some(c => c.id === card.id);
    
    if (isSelected) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
    } else {
      if (selectedCards.length === 0) {
        // First card selection - must be playable (Ace is always playable)
        if (card.rank === 'A' || playableCardIdSet.has(card.id)) {
          setSelectedCards([card]);
        }
      } else {
        const firstCard = selectedCards[0];
        const firstCardIsQuestion = firstCard.rank === '8' || firstCard.rank === 'Q';
        const currentCardIsQuestion = card.rank === '8' || card.rank === 'Q';
        const currentCardIsAnswer = card.type === 'answer' && card.rank !== '8' && card.rank !== 'Q';
        
        if (firstCardIsQuestion && currentCardIsAnswer) {
          const testSelection = [...selectedCards, card];
          const isValidCombo = gameEngine.isValidMultiCardCombination(humanPlayer!.id, testSelection.map(c => c.id));
          if (isValidCombo) setSelectedCards(testSelection);
        } else if (firstCardIsQuestion && currentCardIsQuestion) {
          const testSelection = [...selectedCards, card];
          const isValidCombo = gameEngine.isValidMultiCardCombination(humanPlayer!.id, testSelection.map(c => c.id));
          if (isValidCombo) setSelectedCards(testSelection);
        } else if (card.rank === firstCard.rank) {
          const testSelection = [...selectedCards, card];
          const isValidCombo = gameEngine.isValidMultiCardCombination(humanPlayer!.id, testSelection.map(c => c.id));
          if (isValidCombo) setSelectedCards(testSelection);
        } else {
          if (card.rank === 'A' || playableCardIdSet.has(card.id)) {
            setSelectedCards([card]);
          }
        }
      }
    }
  };

  const executePlay = async (cardIds: string[], suit?: Suit) => {
    if (!humanPlayer) {
      console.log('executePlay: No human player');
      return;
    }

    try {
      console.log('executePlay: Starting execution - cardIds=', cardIds, 'suit=', suit, 'humanPlayer.id=', humanPlayer.id);
      
      const move = gameEngine.playCard(humanPlayer.id, cardIds, suit);
      console.log('executePlay: Game engine playCard completed, move=', move);

      const updatedState = gameEngine.getGameState();
      console.log('executePlay: Got updated state, status=', updatedState?.status);
      
      if (updatedState) {
        setGameState(updatedState);
        setPenaltyStack(updatedState.activePenaltyStack);
        setTopCard(gameEngine.getTopCard());
        setCurrentPlayer(updatedState.players[updatedState.currentPlayerIndex]);

        if (updatedState.nikoDeclaredBy === humanPlayer.id) {
          setNikoDeclared(true);
        }

        if (updatedState.status === 'finished') {
          console.log('executePlay: Game finished');
          handleGameEnd(updatedState);
          return;
        }
      }

      setSelectedCards([]);
      console.log('executePlay: Successfully completed');
    } catch (error) {
      console.error('executePlay: Failed to play cards:', error);
      const message = error instanceof Error ? error.message : 'Illegal move';
      Alert.alert('Illegal Move', message);
    }
  };

  const handlePlayCards = async () => {
    if (!humanPlayer || !isHumanTurn || selectedCards.length === 0) return;

    try {
      const cardIds = selectedCards.map(c => c.id);
      const hasAce = selectedCards.some(c => c.rank === 'A');

      console.log('handlePlayCards: cardIds=', cardIds, 'hasAce=', hasAce);

      if (hasAce) {
        console.log('Showing Ace suit selection dialog');
        Alert.alert(
          'Choose Suit',
          'You played an Ace! Choose the suit the next player must follow:',
          [
            { 
              text: '♥ Hearts', 
              onPress: () => {
                console.log('Hearts onPress triggered');
                executePlay(cardIds, 'hearts');
              } 
            },
            { 
              text: '♦ Diamonds', 
              onPress: () => {
                console.log('Diamonds onPress triggered');
                executePlay(cardIds, 'diamonds');
              } 
            },
            { 
              text: '♣ Clubs', 
              onPress: () => {
                console.log('Clubs onPress triggered');
                executePlay(cardIds, 'clubs');
              } 
            },
            { 
              text: '♠ Spades', 
              onPress: () => {
                console.log('Spades onPress triggered');
                executePlay(cardIds, 'spades');
              } 
            },
            { 
              text: 'Cancel', 
              style: 'cancel', 
              onPress: () => {
                console.log('Cancel pressed');
                setSelectedCards([]);
              }
            }
          ]
        );
        console.log('Alert shown');
        return;
      }

      console.log('Non-Ace play: executing with cardIds=', cardIds);
      executePlay(cardIds);
    } catch (error) {
      console.error('Failed to play cards:', error);
      const message = error instanceof Error ? error.message : 'Illegal move';
      Alert.alert('Illegal Move', message);
    }
  };

  const handleDrawCard = async () => {
    if (!humanPlayer || !isHumanTurn) return;

    try {
      gameEngine.drawCard(humanPlayer.id);
      
      const updatedState = gameEngine.getGameState();
      if (updatedState) {
        setGameState(updatedState);
        setPenaltyStack(updatedState.activePenaltyStack);
        setTopCard(gameEngine.getTopCard());
        setCurrentPlayer(updatedState.players[updatedState.currentPlayerIndex]);

        if (updatedState.status === 'finished') {
          handleGameEnd(updatedState);
          return;
        }
      }

    } catch (error) {
      console.error('Failed to draw card:', error);
      const message = error instanceof Error ? error.message : 'Illegal move';
      Alert.alert('Illegal Move', message);
    }
  };

  const handleDeclareNikoKadi = async () => {
    if (!humanPlayer || !isHumanTurn || nikoDeclared) return;

    try {
      const move = gameEngine.declareNikoKadi(humanPlayer.id);
      setNikoDeclared(true);
      
      Alert.alert(
        'Niko Kadi Declared!',
        'You must finish all your cards next turn to win!',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Failed to declare Niko Kadi:', error);
      const message = error instanceof Error ? error.message : 'Illegal move';
      Alert.alert('Illegal Move', message);
    }
  };

  const handleAITurn = () => {
    if (!gameState) return;
    const aiPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!aiPlayer.isAI) return;

    // Prevent re-entrant AI turns
    if (aiTurnInProgressRef.current) return;
    aiTurnInProgressRef.current = true;

    const runAITurn = () => {
      setTimeout(() => {
        console.log(`UI: Running AI turn for ${aiPlayer.id}`);
        const aiMove = gameEngine.getAIMove(aiPlayer.id);

        const updatedState = gameEngine.getGameState();
        if (updatedState) {
          setGameState(updatedState);
          setCurrentPlayer(updatedState.players[updatedState.currentPlayerIndex]);
          setTopCard(gameEngine.getTopCard());
          setPenaltyStack(updatedState.activePenaltyStack);

          if (updatedState.status === 'finished') {
            aiTurnInProgressRef.current = false;
            handleGameEnd(updatedState);
            return;
          }

          // If next player is still AI, run another AI turn (handles jump on 2-player games)
          const nextPlayer = updatedState.players[updatedState.currentPlayerIndex];
          if (nextPlayer.isAI) {
            console.log('UI: Next player is AI, chaining AI turn');
            // Update aiPlayer variable to new current player for next invocation
            runAITurn();
            return;
          }
        }

        aiTurnInProgressRef.current = false;
      }, 800);
    };

    runAITurn();
  };

  const renderCard = (card: Card, isHand: boolean = true, isOpponent: boolean = false) => {
    const isSelected = selectedCards.some(c => c.id === card.id);
    
    // Debug: Check card selection
    if (card.rank === 'A') {
      console.log(`RENDER DEBUG: Ace ${card.rank}${card.suit}, ID: ${card.id}, Selected: ${isSelected}, Selected cards: [${selectedCards.map(c => `${c.rank}${c.suit}(${c.id})`).join(', ')}]`);
    }
    
    // Enhanced card playability logic for multi-card support
    let isPlayable = false;
    if (isHand && isHumanTurn) {
      if (selectedCards.length === 0) {
        // No cards selected - can select any playable card
        isPlayable = card.rank === 'A' || playableCardIdSet.has(card.id);
      } else {
        // Cards already selected - can add cards of same rank that form valid combinations
        const firstCard = selectedCards[0];
        if (card.rank === firstCard.rank) {
          // Same rank - check if this card can be added to form valid multi-card combo
          isPlayable = addableCardIds.has(card.id);
        } else {
          // Different rank - can replace selection if this card is playable
          isPlayable = card.rank === 'A' || playableCardIdSet.has(card.id);
        }
      }
    }
    
    if (isOpponent) {
      return (
        <View key={card.id} style={[styles.opponentCard, { backgroundColor: theme.colors.card.back }]}>
          <Text style={styles.cardBackText}>?</Text>
        </View>
      );
    }

    const cardColor = card.suit === 'hearts' || card.suit === 'diamonds' 
      ? theme.colors.suits.hearts 
      : theme.colors.suits.spades;

    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.card,
          isHand && styles.handCard,
          isSelected && styles.selectedCard,
          isHand && !isPlayable && !isSelected && styles.unplayableCard,
          isHand && isPlayable && !isSelected && styles.playableCard,
          { backgroundColor: theme.colors.surface, borderColor: cardColor }
        ]}
        onPress={() => isHand && handleCardSelect(card)}
        disabled={!isHand || gameOver || !isHumanTurn}
      >
        <Text style={[styles.cardRank, { color: cardColor }]}>
          {card.rank}
        </Text>
        <Text style={[styles.cardSuit, { color: cardColor }]}>
          {card.suit === 'hearts' ? '♥' :
           card.suit === 'diamonds' ? '♦' :
           card.suit === 'clubs' ? '♣' : '♠'}
        </Text>
        {isSelected && (
          <View style={[styles.selectionBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.selectionText}>{selectedCards.findIndex(c => c.id === card.id) + 1}</Text>
          </View>
        )}
        
        {/* Show multi-card combination indicator */}
        {!isSelected && isHand && selectedCards.length > 0 && card.rank === selectedCards[0].rank && addableCardIds.has(card.id) && (
          <View style={[styles.multiCardIndicator, { backgroundColor: theme.colors.success }]}>
            <Text style={styles.multiCardText}>+</Text>
          </View>
        )}
        
        {/* Show valid multi-card combo indicator */}
        {isHand && multiCardCombinationIds.has(card.id) && selectedCards.length === 0 && (
          <View style={[styles.multiCardAvailableIndicator, { backgroundColor: theme.colors.secondary }]}>
            <Text style={styles.multiCardAvailableText}>2+</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderPlayerArea = (player: Player, position: 'top' | 'left' | 'right' | 'bottom') => {
    const gs = gameState!;
    const isCurrentTurn = gs.currentPlayerIndex === gs.players.indexOf(player);
    const isCurrentPlayer = !player.isAI;

    return (
      <View style={[styles.playerArea, styles[position]]}>
        <View style={styles.playerInfo}>
          <View style={[
            styles.playerAvatar,
            { backgroundColor: isCurrentTurn ? theme.colors.primary : theme.colors.surface }
          ]}>
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
            <Text style={[styles.cardCount, { color: theme.colors.textSecondary }]}>
              {player.hand.length} cards
            </Text>
            {isCurrentTurn && (
              <Text style={[styles.currentTurn, { color: theme.colors.primary }]}>
                Current Turn
              </Text>
            )}
          </View>
        </View>
        
        {position !== 'bottom' && (
          <View style={styles.opponentHand}>
            {player.hand.slice(0, 5).map((card) => renderCard(card, true, true))}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading game...</Text>
          <Text style={[styles.loadingSubtext, { color: theme.colors.textSecondary }]}>
            Setting up the game board...
          </Text>
        </View>
      </View>
    );
  }

  if (!gameState) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Game not initialized</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Niko Kadi</Text>
        <View style={styles.headerRight}>
          {penaltyStack > 0 && (
            <View style={[styles.penaltyBadge, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.penaltyText}>+{penaltyStack}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Players */}
      {gameState.players.map((player, index) => {
        let position: 'top' | 'left' | 'right' | 'bottom' = 'bottom';
        if (index === 0) position = 'bottom';
        else if (index === 1) position = 'top';
        else if (index === 2) position = 'left';
        else if (index === 3) position = 'right';
        else if (index === 4) position = 'top';
        else if (index === 5) position = 'left';
        
        return renderPlayerArea(player, position);
      })}
      
      {/* Center Play Area */}
      <View style={styles.playArea}>
        <View style={[styles.discardPile, { backgroundColor: theme.colors.surface }]}>
          {topCard && renderCard(topCard, false)}
        </View>
        
        <TouchableOpacity
          style={[styles.drawPile, { backgroundColor: theme.colors.card.back }]}
          onPress={handleDrawCard}
          disabled={!isHumanTurn}
        >
          <Text style={[styles.drawPileText, { color: 'white' }]}>
            {gameState.drawPile.length}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Current Player Area */}
      {humanPlayer && (
        <View style={styles.currentPlayerArea}>
          <View style={styles.playerHandContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.handScrollContainer}
            >
              {humanPlayer.hand.map(card => renderCard(card, true))}
            </ScrollView>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.playButton,
                (!isHumanTurn || selectedCards.length === 0) && styles.disabledButton,
                isValidMultiCardSelection && styles.validMultiCardButton
              ]}
              onPress={handlePlayCards}
              disabled={!isHumanTurn || selectedCards.length === 0 || gameOver}
            >
              <Ionicons name="play" size={20} color="white" />
              <Text style={styles.actionButtonText}>
                {selectedCards.length > 1 ? `Play ${selectedCards.length}` : 'Play'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.drawButton,
                { backgroundColor: theme.colors.secondary }
              ]}
              onPress={handleDrawCard}
              disabled={gameOver || !isHumanTurn}
            >
              <Ionicons name="download" size={20} color="white" />
              <Text style={styles.actionButtonText}>Draw</Text>
            </TouchableOpacity>

            {!nikoDeclared && humanPlayer.hand.length <= 3 && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.nikoButton,
                  { backgroundColor: theme.colors.warning }
                ]}
                onPress={handleDeclareNikoKadi}
                disabled={gameOver || !isHumanTurn}
              >
                <Ionicons name="megaphone" size={20} color="white" />
                <Text style={styles.actionButtonText}>Niko!</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Game Over Modal */}
      {gameOver && winner && (
        <View style={styles.gameOverModal}>
          <View style={[styles.gameOverContent, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="trophy" size={60} color={theme.colors.warning} />
            <Text style={[styles.winnerText, { color: theme.colors.text }]}>
              {winner.name} Wins!
            </Text>
            <View style={styles.gameOverButtons}>
              <TouchableOpacity
                style={[styles.gameOverButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => initializeGame()}
              >
                <Text style={styles.gameOverButtonText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.gameOverButton, { backgroundColor: theme.colors.secondary }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.gameOverButtonText}>Leave Game</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
  },
  loadingSubtext: {
    textAlign: 'center',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  penaltyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  penaltyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerArea: {
    position: 'absolute',
  },
  top: {
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  left: {
    left: 20,
    top: height / 2 - 50,
  },
  right: {
    right: 20,
    top: height / 2 - 50,
  },
  bottom: {
    bottom: 20,
    left: 0,
    right: 0,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardCount: {
    fontSize: 12,
  },
  currentTurn: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  opponentHand: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  opponentCard: {
    width: 40,
    height: 60,
    borderRadius: 4,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playArea: {
    position: 'absolute',
    top: height / 2 - 100,
    left: width / 2 - 100,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawPile: {
    width: 60,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawPileText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  discardPile: {
    width: 60,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  currentPlayerArea: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  playerHandContainer: {
    marginBottom: 20,
  },
  handScrollContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  card: {
    width: 50,
    height: 70,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  handCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedCard: {
    transform: [{ translateY: -10 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#6366F1',
  },
  playableCard: {
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  unplayableCard: {
    opacity: 0.4,
  },
  selectionBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardRank: {
    fontSize: 16,
    fontWeight: 'bold',
    position: 'absolute',
    top: 4,
    left: 4,
  },
  cardSuit: {
    fontSize: 20,
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
  },
  disabledButton: {
    opacity: 0.5,
  },
  playButton: {
    backgroundColor: '#6366F1',
  },
  validMultiCardButton: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  drawButton: {
    backgroundColor: '#8B5CF6',
  },
  nikoButton: {
    backgroundColor: '#F59E0B',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  gameOverModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
  },
  gameOverButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  gameOverButton: {
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
  },
  gameOverButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  multiCardIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  multiCardText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  multiCardAvailableIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiCardAvailableText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default GameScreen;
