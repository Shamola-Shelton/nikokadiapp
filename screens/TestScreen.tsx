import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { GameEngine } from '../engine/GameEngine';
import { FirebaseService } from '../services/FirebaseService';
import { Card, Player, GameState, Suit } from '../types';

interface TestScreenProps {
  navigation: any;
}

const TestScreen: React.FC<TestScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const gameEngine = GameEngine.getInstance();
  const firebaseService = FirebaseService.getInstance();

  const runAllTests = async () => {
    const results = {
      gameEngine: await testGameEngine(),
      firebaseService: await testFirebaseService(),
      cardMechanics: await testCardMechanics(),
      aiLogic: await testAILogic(),
      uiComponents: await testUIComponents(),
    };

    const summary = Object.entries(results)
      .map(([test, result]) => `${test}: ${result ? '✅ PASS' : '❌ FAIL'}`)
      .join('\n');

    Alert.alert('Test Results', summary);
  };

  const testGameEngine = async () => {
    try {
      // Test game initialization
      const players: Player[] = [
        { id: 'test1', name: 'Player 1', hand: [], isAI: false, rating: 1000, coins: 0, cosmetics: { avatar: 'default', cardBack: 'default', tableTheme: 'default' } },
        { id: 'test2', name: 'Player 2', hand: [], isAI: true, rating: 1000, coins: 0, cosmetics: { avatar: 'default', cardBack: 'default', tableTheme: 'default' } }
      ];
      
      gameEngine.initializeGame(players);
      const gameState = gameEngine.getGameState();
      
      if (!gameState || gameState.players.length !== 2) {
        return false;
      }

      // Test card playing
      const player = gameState.players[0];
      if (player.hand.length === 0) {
        return false;
      }

      const cardToPlay = player.hand[0];
      gameEngine.playCards(player.id, [cardToPlay.id]);
      
      const updatedState = gameEngine.getGameState();
      if (!updatedState || updatedState.discardPile.length === 0) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('GameEngine test failed:', error);
      return false;
    }
  };

  const testFirebaseService = async () => {
    try {
      // Test basic Firebase service methods
      const currentUser = firebaseService.getCurrentUser();
      const userProfile = await firebaseService.getUserProfile('test');
      
      // These should not throw errors
      firebaseService.createGame({} as GameState);
      firebaseService.subscribeToGame('test', () => {});
      firebaseService.cancelMatchmaking();
      
      return true;
    } catch (error) {
      console.error('FirebaseService test failed:', error);
      return false;
    }
  };

  const testCardMechanics = async () => {
    try {
      const players: Player[] = [
        { id: 'test1', name: 'Player 1', hand: [], isAI: false, rating: 1000, coins: 0, cosmetics: { avatar: 'default', cardBack: 'default', tableTheme: 'default' } },
        { id: 'test2', name: 'Player 2', hand: [], isAI: true, rating: 1000, coins: 0, cosmetics: { avatar: 'default', cardBack: 'default', tableTheme: 'default' } }
      ];
      
      gameEngine.initializeGame(players);
      const gameState = gameEngine.getGameState();
      
      if (!gameState) return false;

      // Test different card types
      const player = gameState.players[0];
      const topCard = gameEngine.getTopCard();
      
      if (!topCard) return false;

      // Test getting playable cards
      const playableCards = gameEngine.getPlayableCards(player);
      if (!Array.isArray(playableCards)) return false;

      return true;
    } catch (error) {
      console.error('Card mechanics test failed:', error);
      return false;
    }
  };

  const testAILogic = async () => {
    try {
      const players: Player[] = [
        { id: 'test1', name: 'Player 1', hand: [], isAI: false, rating: 1000, coins: 0, cosmetics: { avatar: 'default', cardBack: 'default', tableTheme: 'default' } },
        { id: 'ai_test', name: 'AI Test', hand: [], isAI: true, rating: 1000, coins: 0, cosmetics: { avatar: 'default', cardBack: 'default', tableTheme: 'default' } }
      ];
      
      gameEngine.initializeGame(players);
      const gameState = gameEngine.getGameState();
      
      if (!gameState) return false;

      // Test AI turn execution
      const aiPlayer = gameState.players.find(p => p.isAI);
      if (!aiPlayer) return false;

      // Simulate AI turn
      gameEngine.runAITurn(aiPlayer.id);
      
      return true;
    } catch (error) {
      console.error('AI logic test failed:', error);
      return false;
    }
  };

  const testUIComponents = async () => {
    try {
      // Test theme context
      const themeColors = theme.colors;
      if (!themeColors.primary || !themeColors.background) {
        return false;
      }

      // Test navigation
      if (!navigation || typeof navigation.navigate !== 'function') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('UI components test failed:', error);
      return false;
    }
  };

  const individualTests = [
    { name: 'Game Engine', test: testGameEngine },
    { name: 'Firebase Service', test: testFirebaseService },
    { name: 'Card Mechanics', test: testCardMechanics },
    { name: 'AI Logic', test: testAILogic },
    { name: 'UI Components', test: testUIComponents },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Test Suite</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="flask" size={32} color={theme.colors.primary} />
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
            Test Suite
          </Text>
          <Text style={[styles.infoDescription, { color: theme.colors.textSecondary }]}>
            Run comprehensive tests to verify all game components are working correctly.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.runAllButton, { backgroundColor: theme.colors.primary }]}
          onPress={runAllTests}
        >
          <Ionicons name="play" size={20} color="white" />
          <Text style={styles.runAllButtonText}>Run All Tests</Text>
        </TouchableOpacity>

        <View style={styles.individualTests}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Individual Tests
          </Text>
          
          {individualTests.map((test, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.testButton, { backgroundColor: theme.colors.surface }]}
              onPress={async () => {
                const result = await test.test();
                Alert.alert(
                  `${test.name} Test`,
                  result ? '✅ Test Passed' : '❌ Test Failed'
                );
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.testButtonText, { color: theme.colors.text }]}>
                {test.name}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Test Coverage
          </Text>
          <View style={[styles.coverageCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.coverageItem, { color: theme.colors.textSecondary }]}>
              • Game initialization and state management
            </Text>
            <Text style={[styles.coverageItem, { color: theme.colors.textSecondary }]}>
              • Card playing and validation logic
            </Text>
            <Text style={[styles.coverageItem, { color: theme.colors.textSecondary }]}>
              • AI decision making and turn execution
            </Text>
            <Text style={[styles.coverageItem, { color: theme.colors.textSecondary }]}>
              • Firebase service integration
            </Text>
            <Text style={[styles.coverageItem, { color: theme.colors.textSecondary }]}>
              • UI component functionality
            </Text>
          </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  runAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  runAllButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  individualTests: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  testButtonText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  section: {
    marginBottom: 40,
  },
  coverageCard: {
    padding: 20,
    borderRadius: 12,
  },
  coverageItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default TestScreen;
