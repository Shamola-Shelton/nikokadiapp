import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ShopItem } from '../types';

interface ShopScreenProps {
  navigation: any;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [activeCategory, setActiveCategory] = useState<'card_backs' | 'avatars' | 'table_themes'>('card_backs');
  
  // Mock shop data
  const shopItems: Record<string, ShopItem[]> = {
    card_backs: [
      { id: 'default', name: 'Classic', description: 'Standard card back', type: 'cosmetic', price: 0, currency: 'coins', category: 'card_back', rarity: 'common', limited: false },
      { id: 'gold', name: 'Golden', description: 'Shiny gold card back', type: 'cosmetic', price: 500, currency: 'coins', category: 'card_back', rarity: 'rare', limited: false },
      { id: 'diamond', name: 'Diamond', description: 'Premium diamond card back', type: 'cosmetic', price: 1500, currency: 'coins', category: 'card_back', rarity: 'epic', limited: false },
      { id: 'dragon', name: 'Dragon', description: 'Legendary dragon design', type: 'cosmetic', price: 3000, currency: 'coins', category: 'card_back', rarity: 'legendary', limited: true },
    ],
    avatars: [
      { id: 'default', name: 'Player', description: 'Default avatar', type: 'cosmetic', price: 0, currency: 'coins', category: 'avatar', rarity: 'common', limited: false },
      { id: 'ninja', name: 'Ninja', description: 'Stealthy ninja avatar', type: 'cosmetic', price: 300, currency: 'coins', category: 'avatar', rarity: 'rare', limited: false },
      { id: 'wizard', name: 'Wizard', description: 'Mystical wizard avatar', type: 'cosmetic', price: 800, currency: 'coins', category: 'avatar', rarity: 'epic', limited: false },
      { id: 'phoenix', name: 'Phoenix', description: 'Legendary phoenix avatar', type: 'cosmetic', price: 2500, currency: 'coins', category: 'avatar', rarity: 'legendary', limited: true },
    ],
    table_themes: [
      { id: 'default', name: 'Classic Green', description: 'Traditional green felt', type: 'cosmetic', price: 0, currency: 'coins', category: 'table_theme', rarity: 'common', limited: false },
      { id: 'ocean', name: 'Ocean Blue', description: 'Calming ocean theme', type: 'cosmetic', price: 400, currency: 'coins', category: 'table_theme', rarity: 'rare', limited: false },
      { id: 'volcano', name: 'Volcano', description: 'Fiery volcano theme', type: 'cosmetic', price: 1200, currency: 'coins', category: 'table_theme', rarity: 'epic', limited: false },
      { id: 'galaxy', name: 'Galaxy', description: 'Cosmic galaxy theme', type: 'cosmetic', price: 2800, currency: 'coins', category: 'table_theme', rarity: 'legendary', limited: true },
    ]
  };

  const userCoins = 1500; // Mock user coins

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return theme.colors.textSecondary;
      case 'rare': return '#4A90E2';
      case 'epic': return '#9B59B6';
      case 'legendary': return '#F39C12';
      default: return theme.colors.textSecondary;
    }
  };

  const renderShopItem = (item: ShopItem) => {
    const isOwned = item.price === 0;
    const canAfford = userCoins >= item.price;
    
    return (
      <View key={item.id} style={[styles.shopItem, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.itemPreview, { backgroundColor: theme.colors.background }]}>
          <Ionicons 
            name={
              item.category === 'card_back' ? 'card' :
              item.category === 'avatar' ? 'person' :
              'grid'
            } 
            size={40} 
            color={getRarityColor(item.rarity)} 
          />
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.itemDescription, { color: theme.colors.textSecondary }]}>
            {item.description}
          </Text>
          <View style={styles.itemMeta}>
            <Text style={[styles.rarity, { color: getRarityColor(item.rarity) }]}>
              {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
            </Text>
            {item.limited && (
              <Text style={[styles.limited, { color: theme.colors.error }]}>
                Limited
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.itemAction}>
          {isOwned ? (
            <View style={[styles.ownedBadge, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.ownedText}>Owned</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.buyButton,
                { 
                  backgroundColor: canAfford ? theme.colors.primary : theme.colors.textSecondary,
                  opacity: canAfford ? 1 : 0.5
                }
              ]}
              disabled={!canAfford}
            >
              <Text style={styles.buyButtonText}>
                {item.price} {item.currency === 'coins' ? '🪙' : '$'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Shop</Text>
        <View style={styles.coinsContainer}>
          <Ionicons name="cash" size={20} color={theme.colors.warning} />
          <Text style={[styles.coinsText, { color: theme.colors.text }]}>
            {userCoins}
          </Text>
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[
            styles.categoryTab,
            { backgroundColor: activeCategory === 'card_backs' ? theme.colors.primary : theme.colors.surface }
          ]}
          onPress={() => setActiveCategory('card_backs')}
        >
          <Text style={[
            styles.categoryText,
            { color: activeCategory === 'card_backs' ? 'white' : theme.colors.text }
          ]}>
            Card Backs
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.categoryTab,
            { backgroundColor: activeCategory === 'avatars' ? theme.colors.primary : theme.colors.surface }
          ]}
          onPress={() => setActiveCategory('avatars')}
        >
          <Text style={[
            styles.categoryText,
            { color: activeCategory === 'avatars' ? 'white' : theme.colors.text }
          ]}>
            Avatars
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.categoryTab,
            { backgroundColor: activeCategory === 'table_themes' ? theme.colors.primary : theme.colors.surface }
          ]}
          onPress={() => setActiveCategory('table_themes')}
        >
          <Text style={[
            styles.categoryText,
            { color: activeCategory === 'table_themes' ? 'white' : theme.colors.text }
          ]}>
            Tables
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {shopItems[activeCategory].map(item => renderShopItem(item))}
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
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  coinsText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  itemPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rarity: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  limited: {
    fontSize: 10,
    fontWeight: '600',
  },
  itemAction: {
    alignItems: 'center',
  },
  ownedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ownedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  buyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ShopScreen;
