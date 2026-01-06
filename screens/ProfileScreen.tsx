import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { UserStats } from '../types';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  
  // Mock user data
  const userStats: UserStats = {
    userId: 'local_player',
    username: 'Player',
    email: 'player@example.com',
    coins: 1500,
    rating: 1250,
    wins: 42,
    losses: 18,
    gamesPlayed: 60,
    winRate: 70,
    achievements: [],
    friends: [],
    cosmetics: ['default', 'gold', 'diamond'],
    equippedCosmetics: {
      avatar: 'default',
      cardBack: 'default',
      tableTheme: 'default'
    },
    hasRemovedAds: false,
    vipPass: false,
    lastActive: new Date(),
    accountCreated: new Date()
  };

  const stats = [
    { label: 'Rating', value: userStats.rating.toString(), icon: 'trophy' as const },
    { label: 'Win Rate', value: `${userStats.winRate}%`, icon: 'checkmark-circle' as const },
    { label: 'Games Played', value: userStats.gamesPlayed.toString(), icon: 'game-controller' as const },
    { label: 'Coins', value: userStats.coins.toString(), icon: 'cash' as const },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={[styles.username, { color: theme.colors.text }]}>
            {userStats.username}
          </Text>
          <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
            {userStats.email}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name={stat.icon} size={24} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recent Performance
          </Text>
          <View style={[styles.performanceCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.performanceItem}>
              <Text style={[styles.performanceLabel, { color: theme.colors.textSecondary }]}>
                Last 10 Games
              </Text>
              <Text style={[styles.performanceValue, { color: theme.colors.success }]}>
                7W - 3L
              </Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={[styles.performanceLabel, { color: theme.colors.textSecondary }]}>
                Current Streak
              </Text>
              <Text style={[styles.performanceValue, { color: theme.colors.warning }]}>
                3 Wins
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Achievements
          </Text>
          <View style={[styles.achievementsCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.achievementsText, { color: theme.colors.textSecondary }]}>
              No achievements unlocked yet. Keep playing to earn rewards!
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
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  performanceCard: {
    padding: 20,
    borderRadius: 12,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceLabel: {
    fontSize: 14,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  achievementsCard: {
    padding: 20,
    borderRadius: 12,
  },
  achievementsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProfileScreen;
