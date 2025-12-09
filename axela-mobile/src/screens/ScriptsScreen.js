import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAxela } from '../contexts/AxelaContext';

export default function ScriptsScreen() {
  const { scripts, loading, loadScripts, executeScript } = useAxela();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadScripts();
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      General: '#f97316',
      Automation: '#3b82f6',
      Productivity: '#10b981',
      Custom: '#8b5cf6',
    };
    return colors[category] || '#78716c';
  };

  const handleScriptExecute = async (script) => {
    const result = await executeScript(script.id);
    if (result.success) {
      setSnackbarMessage(`Script "${script.name}" sent to desktop`);
      setSnackbarVisible(true);
    } else {
      Alert.alert('Error', result.message || 'Failed to execute script');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Icon name="file-document" size={28} color="#f97316" />
        <Text style={styles.headerTitle}>Scripts</Text>
      </View>
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.placeholder}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.placeholderText}>Loading scripts...</Text>
          </View>
        ) : scripts && scripts.length > 0 ? (
          <View style={styles.scriptsList}>
            {scripts.map((script) => (
              <TouchableOpacity
                key={script.id}
                style={styles.scriptCard}
                activeOpacity={0.7}
              >
                <View style={styles.scriptHeader}>
                  <View style={styles.scriptHeaderLeft}>
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: getCategoryColor(script.category) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          { color: getCategoryColor(script.category) },
                        ]}
                      >
                        {script.category}
                      </Text>
                    </View>
                    <View style={styles.scriptInfo}>
                      <Text style={styles.scriptName}>{script.name}</Text>
                      {script.description && (
                        <Text style={styles.scriptDescription} numberOfLines={2}>
                          {script.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        script.is_recurring ? styles.startButton : styles.runButton,
                      ]}
                      onPress={() => handleScriptExecute(script)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={script.is_recurring ? "play" : "play-circle"}
                        size={16}
                        color="#fff"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>
                        {script.is_recurring ? 'Start' : 'Run'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.scriptFooter}>
                  <View style={styles.scriptMeta}>
                    {script.is_favorite && (
                      <Icon name="star" size={16} color="#f97316" style={styles.metaIcon} />
                    )}
                    {script.is_recurring && (
                      <>
                        <Icon name="repeat" size={16} color="#78716c" style={styles.metaIcon} />
                        {script.recurring_enabled && script.recurring_interval && (
                          <Text style={styles.recurringText}>
                            Every {script.recurring_interval}
                          </Text>
                        )}
                      </>
                    )}
                    <Text style={styles.usageCount}>
                      Used {script.usage_count || 0} times
                    </Text>
                  </View>
                  {script.last_executed && (
                    <Text style={styles.lastExecuted}>
                      Last: {new Date(script.last_executed).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Icon name="file-document-outline" size={64} color="#44403c" />
            <Text style={styles.placeholderText}>No scripts yet</Text>
            <Text style={styles.placeholderSubtext}>
              Create and manage automation scripts
            </Text>
          </View>
        )}
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
        theme={{ colors: { onSurface: '#10b981', surface: '#1c1917' } }}
        contentStyle={styles.snackbarContent}
      >
        <Text style={styles.snackbarText}>{snackbarMessage}</Text>
      </Snackbar>
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
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 100,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#a8a29e',
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#78716c',
    marginTop: 8,
    textAlign: 'center',
  },
  scriptsList: {
    padding: 16,
  },
  scriptCard: {
    backgroundColor: '#1c1917',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#292524',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scriptHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scriptInfo: {
    flex: 1,
  },
  scriptName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fafaf9',
    marginBottom: 4,
  },
  scriptDescription: {
    fontSize: 14,
    color: '#a8a29e',
    lineHeight: 20,
  },
  scriptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#292524',
  },
  scriptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIcon: {
    marginRight: 4,
  },
  usageCount: {
    fontSize: 12,
    color: '#78716c',
  },
  lastExecuted: {
    fontSize: 12,
    color: '#78716c',
  },
  actionButtons: {
    marginLeft: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  runButton: {
    backgroundColor: '#f97316',
  },
  disabledButton: {
    backgroundColor: '#44403c',
    opacity: 0.5,
  },
  buttonIcon: {
    marginRight: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  recurringText: {
    fontSize: 12,
    color: '#78716c',
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#f97316',
  },
  snackbar: {
    backgroundColor: '#1c1917',
  },
  snackbarContent: {
    backgroundColor: '#1c1917',
  },
  snackbarText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
});
