import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();

  const menuItems = [
    {
      id: 'quick',
      title: 'Quick Play',
      subtitle: 'Jump into a casual game',
      icon: 'flash' as const,
      color: '#6366F1',
      gradient: ['#6366F1', '#8B5CF6'] as [string, string],
      onPress: () => navigation.navigate('Lobby', { gameMode: 'quick', isLocal: false }),
    },
    {
      id: 'ranked',
      title: 'Ranked Match',
      subtitle: 'Compete for the top spot',
      icon: 'trophy' as const,
      color: '#F59E0B',
      gradient: ['#F59E0B', '#EF4444'] as [string, string],
      onPress: () => navigation.navigate('Lobby', { gameMode: 'ranked', isLocal: false }),
    },
    {
      id: 'private',
      title: 'Private Room',
      subtitle: 'Play with friends',
      icon: 'people' as const,
      color: '#10B981',
      gradient: ['#10B981', '#06B6D4'] as [string, string],
      onPress: () => navigation.navigate('Lobby', { gameMode: 'private', isLocal: false }),
    },
    {
      id: 'computer',
      title: 'vs Computer',
      subtitle: 'Practice against AI',
      icon: 'hardware-chip' as const,
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#EC4899'] as [string, string],
      onPress: () => navigation.navigate('Lobby', { gameMode: 'computer', isLocal: true }),
    },
  ];

  const secondaryItems = [
    {
      id: 'tutorial',
      title: 'Tutorial',
      icon: 'school' as const,
      onPress: () => navigation.navigate('Tutorial'),
    },
    {
      id: 'rankings',
      title: 'Rankings',
      icon: 'podium' as const,
      onPress: () => navigation.navigate('Rankings'),
    },
    {
      id: 'shop',
      title: 'Shop',
      icon: 'storefront' as const,
      onPress: () => navigation.navigate('Shop'),
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person' as const,
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings' as const,
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Niko Kadi
          </Text>
          <TouchableOpacity style={styles.themeToggle} onPress={theme.toggleTheme}>
            <Ionicons
              name={theme.isDark ? 'sunny' : 'moon'}
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Master the art of strategic card play
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Game Modes */}
        <View style={styles.mainMenu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.9}
            >
              <View style={[styles.menuItem, { backgroundColor: item.color }]}>
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    <View style={styles.iconContainer}>
                      <Ionicons name={item.icon} size={28} color="white" />
                    </View>
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                      <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <View style={styles.menuItemRight}>
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Secondary Menu */}
        <View style={styles.secondaryMenu}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            More Options
          </Text>
          <View style={styles.secondaryMenuGrid}>
            {secondaryItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.secondaryMenuItem, { backgroundColor: theme.colors.surface }]}
                onPress={item.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.secondaryIconContainer, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name={item.icon} size={20} color="white" />
                </View>
                <Text style={[styles.secondaryMenuText, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
            Your Stats
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>42</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>70%</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Win Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.warning }]}>1.2k</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Made with ❤️ for card game enthusiasts
          </Text>
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mainMenu: {
    marginBottom: 32,
  },
  menuItem: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuItemGradient: {
    padding: 20,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  secondaryMenu: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  secondaryMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  secondaryMenuItem: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryMenuText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  menuItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default HomeScreen;
