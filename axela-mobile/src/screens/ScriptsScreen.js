import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ScriptsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Icon name="file-document" size={28} color="#f97316" />
        <Text style={styles.headerTitle}>Scripts</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.placeholder}>
          <Icon name="file-document-outline" size={64} color="#44403c" />
          <Text style={styles.placeholderText}>Script management coming soon</Text>
          <Text style={styles.placeholderSubtext}>
            Create and manage automation scripts
          </Text>
        </View>
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
});
