import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, FAB, Menu, Divider, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAxela } from '../contexts/AxelaContext';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}>
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const {
    conversations,
    currentConversation,
    setConversations,
    setCurrentConversation,
    executeCommand,
    isConnected,
    mode,
  } = useAxela();

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    }
  }, []);

  const createNewConversation = () => {
    const newConv = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setConversations([newConv, ...conversations]);
    setCurrentConversation(newConv);
  };

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    let conv = currentConversation;
    if (!conv) {
      conv = {
        id: Date.now().toString(),
        title: input.substring(0, 30),
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setCurrentConversation(conv);
    }

    const updatedMessages = [...(conv.messages || []), userMessage];
    const updatedConv = { ...conv, messages: updatedMessages };
    setCurrentConversation(updatedConv);
    setInput('');
    setIsProcessing(true);

    try {
      const result = await executeCommand(userMessage.content);
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: result.success ? result.message : `Error: ${result.message}`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        success: result.success,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      const finalConv = { ...updatedConv, messages: finalMessages };
      setCurrentConversation(finalConv);
      setConversations([finalConv, ...conversations.filter(c => c.id !== conv.id)]);
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getModeDisplay = () => {
    switch (mode) {
      case 'manual': return 'Manual';
      case 'ai': return 'AI';
      case 'chat': return 'Chat';
      default: return 'AI';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="robot" size={28} color="#f97316" />
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>AXELA</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
              <Text style={styles.statusText}>{isConnected ? 'Connected' : 'Offline'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.modeBadge}>
            <Text style={styles.modeText}>{getModeDisplay()}</Text>
          </View>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <Icon name="dots-vertical" size={24} color="#a8a29e" />
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={createNewConversation} title="New Chat" leadingIcon="plus" />
            <Divider />
            <Menu.Item onPress={() => setMenuVisible(false)} title="Clear History" leadingIcon="delete" />
          </Menu>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={60}
      >
        {currentConversation && currentConversation.messages.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={currentConversation.messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatMessage message={item} />}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        ) : (
          <View style={styles.emptyState}>
            <Icon name="robot-happy" size={80} color="#44403c" />
            <Text style={styles.emptyTitle}>Hello! I'm AXELA</Text>
            <Text style={styles.emptyDescription}>
              Your AI assistant. Send me a message to get started.
            </Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#78716c"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            editable={!isProcessing}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isProcessing) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="send" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1c1917',
    borderBottomWidth: 1,
    borderBottomColor: '#292524',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitleContainer: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fafaf9',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connected: {
    backgroundColor: '#f97316',
  },
  disconnected: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 11,
    color: '#a8a29e',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeBadge: {
    backgroundColor: '#292524',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f97316',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#f97316',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#292524',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#fafaf9',
  },
  timestamp: {
    fontSize: 10,
    color: '#a8a29e',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f97316',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#78716c',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1c1917',
    borderTopWidth: 1,
    borderTopColor: '#292524',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#292524',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#fafaf9',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#44403c',
  },
});
