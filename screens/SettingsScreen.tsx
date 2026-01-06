import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [music, setMusic] = useState(false);
  const [vibrations, setVibrations] = useState(true);
  const [autoEndTurn, setAutoEndTurn] = useState(false);
  const [showHints, setShowHints] = useState(true);

  const settingsSections = [
    {
      title: 'Game Preferences',
      items: [
        {
          icon: 'game-controller',
          label: 'Auto End Turn',
          value: autoEndTurn,
          onToggle: setAutoEndTurn,
          description: 'Automatically end turn after playing a card'
        },
        {
          icon: 'bulb',
          label: 'Show Hints',
          value: showHints,
          onToggle: setShowHints,
          description: 'Highlight playable cards'
        }
      ]
    },
    {
      title: 'Audio',
      items: [
        {
          icon: 'volume-high',
          label: 'Sound Effects',
          value: soundEffects,
          onToggle: setSoundEffects,
          description: 'Play sounds for card moves and actions'
        },
        {
          icon: 'musical-notes',
          label: 'Background Music',
          value: music,
          onToggle: setMusic,
          description: 'Play background music during games'
        },
        {
          icon: 'phone-portrait',
          label: 'Vibrations',
          value: vibrations,
          onToggle: setVibrations,
          description: 'Vibrate on important game events'
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications',
          label: 'Push Notifications',
          value: notifications,
          onToggle: setNotifications,
          description: 'Receive notifications about your turns'
        }
      ]
    }
  ];

  const renderSettingItem = (item: any) => (
    <View key={item.label} style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name={item.icon} size={20} color="white" />
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            {item.label}
          </Text>
          <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
            {item.description}
          </Text>
        </View>
      </View>
      
      <Switch
        value={item.value}
        onValueChange={item.onToggle}
        trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primary }}
        thumbColor="white"
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {section.title}
            </Text>
            <View style={styles.sectionContent}>
              {section.items.map(item => renderSettingItem(item))}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            About
          </Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={[styles.aboutItem, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.aboutLeft}>
                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                <Text style={[styles.aboutText, { color: theme.colors.text }]}>
                  Version 1.0.0
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.aboutItem, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.aboutLeft}>
                <Ionicons name="help-circle" size={20} color={theme.colors.primary} />
                <Text style={[styles.aboutText, { color: theme.colors.text }]}>
                  Help & Support
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.aboutItem, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.aboutLeft}>
                <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                <Text style={[styles.aboutText, { color: theme.colors.text }]}>
                  Terms of Service
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.aboutItem, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.aboutLeft}>
                <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary} />
                <Text style={[styles.aboutText, { color: theme.colors.text }]}>
                  Privacy Policy
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  aboutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutText: {
    marginLeft: 12,
    fontSize: 16,
  },
});

export default SettingsScreen;
