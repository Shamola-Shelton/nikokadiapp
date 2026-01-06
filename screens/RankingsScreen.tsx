import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface RankingsScreenProps {
  navigation: any;
}

const RankingsScreen: React.FC<RankingsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  
  // Mock rankings data
  const globalRankings = [
    { rank: 1, name: 'ProPlayer', rating: 2450, wins: 156, winRate: 78 },
    { rank: 2, name: 'CardMaster', rating: 2380, wins: 142, winRate: 75 },
    { rank: 3, name: 'NikoKadiKing', rating: 2290, wins: 128, winRate: 72 },
    { rank: 4, name: 'AceHunter', rating: 2150, wins: 115, winRate: 70 },
    { rank: 5, name: 'QuickDraw', rating: 2080, wins: 102, winRate: 68 },
    { rank: 6, name: 'Strategist', rating: 1950, wins: 98, winRate: 65 },
    { rank: 7, name: 'LuckySeven', rating: 1820, wins: 89, winRate: 62 },
    { rank: 8, name: 'Bluffer', rating: 1750, wins: 85, winRate: 60 },
    { rank: 9, name: 'RiskTaker', rating: 1680, wins: 78, winRate: 58 },
    { rank: 10, name: 'NewChallenger', rating: 1520, wins: 65, winRate: 55 },
  ];

  const friendsRankings = [
    { rank: 1, name: 'You', rating: 1250, wins: 42, winRate: 70 },
    { rank: 2, name: 'Friend1', rating: 1180, wins: 38, winRate: 68 },
    { rank: 3, name: 'Friend2', rating: 1050, wins: 32, winRate: 64 },
    { rank: 4, name: 'Friend3', rating: 980, wins: 28, winRate: 60 },
  ];

  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');

  const renderRankingItem = (item: any, index: number) => (
    <View key={item.rank} style={[styles.rankingItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.rankContainer}>
        <Text style={[
          styles.rankNumber,
          { color: item.rank <= 3 ? theme.colors.primary : theme.colors.text }
        ]}>
          {item.rank}
        </Text>
        {item.rank <= 3 && (
          <Ionicons 
            name={item.rank === 1 ? 'trophy' : item.rank === 2 ? 'medal' : 'ribbon'} 
            size={16} 
            color={theme.colors.warning} 
          />
        )}
      </View>
      
      <View style={styles.playerInfo}>
        <Text style={[styles.playerName, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.playerStats, { color: theme.colors.textSecondary }]}>
          {item.wins} wins • {item.winRate}% win rate
        </Text>
      </View>
      
      <View style={styles.ratingContainer}>
        <Text style={[styles.rating, { color: theme.colors.primary }]}>
          {item.rating}
        </Text>
        <Text style={[styles.ratingLabel, { color: theme.colors.textSecondary }]}>
          Rating
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
        <Text style={[styles.title, { color: theme.colors.text }]}>Rankings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: activeTab === 'global' ? theme.colors.primary : theme.colors.surface }
          ]}
          onPress={() => setActiveTab('global')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'global' ? 'white' : theme.colors.text }
          ]}>
            Global
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: activeTab === 'friends' ? theme.colors.primary : theme.colors.surface }
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'friends' ? 'white' : theme.colors.text }
          ]}>
            Friends
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {(activeTab === 'global' ? globalRankings : friendsRankings).map((item, index) => 
          renderRankingItem(item, index)
        )}
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  rankContainer: {
    alignItems: 'center',
    width: 40,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  playerStats: {
    fontSize: 12,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  ratingLabel: {
    fontSize: 10,
  },
});

export default RankingsScreen;
