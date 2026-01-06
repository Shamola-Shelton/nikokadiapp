import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface TutorialScreenProps {
  navigation: any;
}

const TutorialScreen: React.FC<TutorialScreenProps> = ({ navigation }) => {
  const theme = useTheme();

  const tutorialSteps = [
    {
      title: 'Welcome to Niko Kadi!',
      description: 'Learn the basics of this exciting card game.',
      icon: 'game-controller'
    },
    {
      title: 'Card Types',
      description: '• Number cards (2-10): Match by rank or suit\n• Jump cards (J): Skip next player\n• Question cards (Q): Require an answer\n• Kickback cards (K): Reverse direction\n• Answer cards (A): Answer questions or change suit\n• Penalty cards (2,3): Force next player to draw',
      icon: 'card'
    },
    {
      title: 'How to Play',
      description: '1. Match the top card by rank or suit\n2. Play special cards for strategic advantages\n3. Answer questions when asked\n4. Avoid penalty cards or counter them\n5. Be the first to play all your cards',
      icon: 'play-circle'
    },
    {
      title: 'Niko Kadi Declaration',
      description: 'Declare "Niko Kadi" when you have 3 or fewer cards. You must win on your next turn to claim victory!',
      icon: 'megaphone'
    },
    {
      title: 'Winning the Game',
      description: 'Play all your cards in a single turn after declaring Niko Kadi. The last cards must be Answer cards or a Question followed by its Answer.',
      icon: 'trophy'
    }
  ];

  const renderTutorialStep = (step: any, index: number) => (
    <View key={index} style={styles.stepContainer}>
      <View style={[styles.stepHeader, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.stepIcon, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name={step.icon} size={24} color="white" />
        </View>
        <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
          {step.title}
        </Text>
      </View>
      
      <View style={[styles.stepContent, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
          {step.description}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Tutorial</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
          Swipe to learn the basics
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {tutorialSteps.map((step, index) => renderTutorialStep(step, index))}
        
        <View style={styles.tipSection}>
          <View style={[styles.tipCard, { backgroundColor: theme.colors.warning }]}>
            <Ionicons name="bulb" size={24} color="white" />
            <Text style={styles.tipTitle}>Pro Tip</Text>
            <Text style={styles.tipText}>
              Save your special cards for strategic moments. A well-timed Jump or Kickback can change the entire game!
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Lobby', { gameMode: 'computer', isLocal: true })}
        >
          <Text style={styles.startButtonText}>Start Practice Game</Text>
        </TouchableOpacity>
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
  progressContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  stepContent: {
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipSection: {
    marginVertical: 30,
  },
  tipCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  tipTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  tipText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  startButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TutorialScreen;
