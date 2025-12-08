import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { List, Switch, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAxela } from '../contexts/AxelaContext';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsScreen() {
  const { config, mode, setMode, updateConfig } = useAxela();
  const { user, signOut } = useAuth();

  const handleModeChange = (newMode) => {
    setMode(newMode);
    updateConfig('app', { mode: newMode });
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Icon name="cog" size={28} color="#f97316" />
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView style={styles.content}>
        {/* Mode Settings */}
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>Chat Mode</List.Subheader>
          <View style={styles.card}>
            <List.Item
              title="Manual Mode"
              description="Type exact commands yourself"
              left={() => (
                <Icon
                  name={mode === 'manual' ? 'radiobox-marked' : 'radiobox-blank'}
                  size={24}
                  color={mode === 'manual' ? '#f97316' : '#78716c'}
                  style={styles.radio}
                />
              )}
              onPress={() => handleModeChange('manual')}
              style={[styles.listItem, mode === 'manual' && styles.activeItem]}
            />
            <Divider />
            <List.Item
              title="AI Mode"
              description="AI interprets and executes commands"
              left={() => (
                <Icon
                  name={mode === 'ai' ? 'radiobox-marked' : 'radiobox-blank'}
                  size={24}
                  color={mode === 'ai' ? '#f97316' : '#78716c'}
                  style={styles.radio}
                />
              )}
              onPress={() => handleModeChange('ai')}
              style={[styles.listItem, mode === 'ai' && styles.activeItem]}
            />
            <Divider />
            <List.Item
              title="Chat Mode"
              description="Chat conversationally - no commands"
              left={() => (
                <Icon
                  name={mode === 'chat' ? 'radiobox-marked' : 'radiobox-blank'}
                  size={24}
                  color={mode === 'chat' ? '#f97316' : '#78716c'}
                  style={styles.radio}
                />
              )}
              onPress={() => handleModeChange('chat')}
              style={[styles.listItem, mode === 'chat' && styles.activeItem]}
            />
          </View>
        </List.Section>

        {/* Voice Settings */}
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>Voice</List.Subheader>
          <View style={styles.card}>
            <List.Item
              title="Voice Input"
              description="Enable voice recognition"
              left={() => <Icon name="microphone" size={24} color="#f97316" style={styles.icon} />}
              right={() => (
                <Switch
                  value={config?.voice?.enabled !== false}
                  onValueChange={(value) => updateConfig('voice', { enabled: value })}
                  color="#f97316"
                />
              )}
              style={styles.listItem}
            />
            <Divider />
            <List.Item
              title="Auto-Speak Responses"
              description="Automatically speak replies"
              left={() => <Icon name="volume-high" size={24} color="#f97316" style={styles.icon} />}
              right={() => (
                <Switch
                  value={config?.custom?.auto_speak_responses === true}
                  onValueChange={(value) => updateConfig('custom', { auto_speak_responses: value })}
                  color="#f97316"
                />
              )}
              style={styles.listItem}
            />
          </View>
        </List.Section>

        {/* Security */}
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>Security</List.Subheader>
          <View style={styles.card}>
            <List.Item
              title="Enable Logging"
              description="Log all commands"
              left={() => <Icon name="shield-check" size={24} color="#f97316" style={styles.icon} />}
              right={() => (
                <Switch
                  value={config?.security?.enable_logging !== false}
                  onValueChange={(value) => updateConfig('security', { enable_logging: value })}
                  color="#f97316"
                />
              )}
              style={styles.listItem}
            />
          </View>
        </List.Section>

        {/* App Info */}
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>About</List.Subheader>
          <View style={styles.card}>
            <List.Item
              title="Version"
              description="1.0.0"
              left={() => <Icon name="information" size={24} color="#f97316" style={styles.icon} />}
              style={styles.listItem}
            />
          </View>
        </List.Section>

        {/* Account */}
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>Account</List.Subheader>
          <View style={styles.card}>
            <List.Item
              title="Email"
              description={user?.email || 'Not signed in'}
              left={() => <Icon name="account" size={24} color="#f97316" style={styles.icon} />}
              style={styles.listItem}
            />
            <Divider />
            <TouchableOpacity onPress={handleSignOut}>
              <List.Item
                title="Sign Out"
                left={() => <Icon name="logout" size={24} color="#ef4444" style={styles.icon} />}
                titleStyle={{ color: '#ef4444' }}
                style={styles.listItem}
              />
            </TouchableOpacity>
          </View>
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0a09',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1c1917',
    borderBottomWidth: 1,
    borderBottomColor: '#292524',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fafaf9',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    color: '#a8a29e',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: '#1c1917',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#292524',
  },
  listItem: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  activeItem: {
    backgroundColor: '#f9731610',
  },
  icon: {
    marginLeft: 12,
  },
  radio: {
    marginLeft: 12,
  },
});
