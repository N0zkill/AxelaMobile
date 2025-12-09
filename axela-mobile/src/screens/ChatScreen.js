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
  Alert,
  Modal,
  Animated,
  Dimensions,
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
          {new Date(message.created_at || message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const {
    conversations,
    currentConversation,
    messages,
    setCurrentConversation,
    executeCommand,
    isConnected,
    mode,
    loading,
    createNewConversation,
    saveMessage,
    loadConversations,
    deleteCurrentConversation,
  } = useAxela();

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const flatListRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const hasCreatedInitialConversation = useRef(false);

  useEffect(() => {
    // Only create a new conversation on initial load when there are no conversations
    // Never auto-create after user actions (deletions, etc.)
    if (!loading && conversations.length === 0 && !hasCreatedInitialConversation.current) {
      hasCreatedInitialConversation.current = true;
      createNewConversation();
    }
  }, [loading]); // Only depend on loading, not conversations.length to prevent re-triggering

  const handleCreateNewConversation = async () => {
    hasCreatedInitialConversation.current = true; // Prevent auto-creation after manual creation
    await createNewConversation();
    setMenuVisible(false);
    setHistoryVisible(false);
  };

  const handleSelectConversation = async (conversation) => {
    setCurrentConversation(conversation);
    setHistoryVisible(false);
  };

  const handleOpenHistory = () => {
    setHistoryVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const handleCloseHistory = () => {
    Animated.spring(slideAnim, {
      toValue: Dimensions.get('window').width,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start(() => {
      setHistoryVisible(false);
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDeleteConversation = () => {
    if (!currentConversation) {
      Alert.alert('No Conversation', 'No conversation selected to delete');
      return;
    }

    const conversationId = currentConversation.id;
    const conversationTitle = currentConversation.title || 'this conversation';

    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete "${conversationTitle}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const result = await deleteCurrentConversation(conversationId);

              if (result?.error) {
                console.error('Delete error:', result.error);
                Alert.alert('Error', `Failed to delete conversation: ${result.error.message || result.error.toString() || 'Unknown error'}`);
              }
            } catch (error) {
              console.error('Unexpected error in delete handler:', error);
              Alert.alert('Error', `An unexpected error occurred: ${error.message || error.toString()}`);
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    let conv = currentConversation;
    if (!conv) {
      conv = await createNewConversation();
      if (!conv) {
        Alert.alert('Error', 'Failed to create conversation');
        return;
      }
    }

    const messageContent = input.trim();
    setInput('');
    setIsProcessing(true);

    try {
      // Save user message
      await saveMessage(conv.id, 'user', messageContent, true, null);

      // Execute command and get response
      const result = await executeCommand(messageContent);

      // Save assistant message
      await saveMessage(
        conv.id,
        'assistant',
        result.success ? result.message : `Error: ${result.message}`,
        result.success,
        result.data
      );

      // Reload conversations to get updated title
      await loadConversations();
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message');
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
          <TouchableOpacity onPress={handleOpenHistory} style={styles.historyButton}>
            <Icon name="history" size={24} color="#f97316" />
          </TouchableOpacity>
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
            <Menu.Item onPress={handleCreateNewConversation} title="New Chat" leadingIcon="plus" />
            <Divider />
            <Menu.Item onPress={() => { loadConversations(); setMenuVisible(false); }} title="Refresh" leadingIcon="refresh" />
            {currentConversation && (
              <>
                <Divider />
                <Menu.Item
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    const convId = currentConversation?.id;
                    const convTitle = currentConversation?.title;

                    if (!convId) {
                      setMenuVisible(false);
                      return;
                    }

                    setMenuVisible(false);

                    // Delete directly without confirmation
                    setTimeout(async () => {
                      setIsProcessing(true);

                      try {
                        const result = await deleteCurrentConversation(convId);

                        if (result?.error) {
                          console.error('Delete error:', result.error);
                          Alert.alert('Error', `Failed to delete conversation: ${result.error.message || result.error.toString() || 'Unknown error'}`);
                        }
                      } catch (error) {
                        console.error('Unexpected error in delete handler:', error);
                        Alert.alert('Error', `An unexpected error occurred: ${error.message || error.toString()}`);
                      } finally {
                        setIsProcessing(false);
                      }
                    }, 200);
                  }}
                  title="Delete Chat"
                  leadingIcon="delete"
                  titleStyle={{ color: '#ef4444' }}
                />
              </>
            )}
          </Menu>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={60}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.emptyDescription}>Loading conversations...</Text>
          </View>
        ) : messages && messages.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={messages}
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

      {/* Chat History Drawer */}
      <Modal
        visible={historyVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseHistory}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseHistory}
          />
          <Animated.View
            style={[
              styles.historyDrawer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <SafeAreaView style={styles.drawerContent} edges={['top']}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>Chat History</Text>
                <TouchableOpacity onPress={handleCloseHistory}>
                  <Icon name="close" size={24} color="#a8a29e" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.newChatButton}
                onPress={handleCreateNewConversation}
              >
                <Icon name="plus" size={20} color="#fff" />
                <Text style={styles.newChatButtonText}>New Chat</Text>
              </TouchableOpacity>

              {loading ? (
                <View style={styles.drawerLoading}>
                  <ActivityIndicator size="small" color="#f97316" />
                </View>
              ) : conversations && conversations.length > 0 ? (
                <FlatList
                  data={conversations}
                  extraData={conversations.length + (currentConversation?.id || '')}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const isSelected = currentConversation?.id === item.id;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.conversationItem,
                          isSelected && styles.conversationItemSelected,
                        ]}
                        onPress={() => handleSelectConversation(item)}
                      >
                        <View style={styles.conversationItemContent}>
                          <Text
                            style={[
                              styles.conversationTitle,
                              isSelected && styles.conversationTitleSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          <Text style={styles.conversationDate}>
                            {formatDate(item.updated_at || item.created_at)}
                          </Text>
                        </View>
                        {isSelected && (
                          <Icon name="check-circle" size={20} color="#f97316" />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                  contentContainerStyle={styles.conversationsList}
                />
              ) : (
                <View style={styles.drawerEmpty}>
                  <Icon name="message-text-outline" size={48} color="#44403c" />
                  <Text style={styles.drawerEmptyText}>No conversations yet</Text>
                  <Text style={styles.drawerEmptySubtext}>
                    Start a new chat to begin
                  </Text>
                </View>
              )}
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
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
  historyButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  historyDrawer: {
    width: Dimensions.get('window').width * 0.85,
    backgroundColor: '#1c1917',
    borderLeftWidth: 1,
    borderLeftColor: '#292524',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#292524',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fafaf9',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  newChatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  conversationsList: {
    padding: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#252836',
  },
  conversationItemSelected: {
    backgroundColor: '#f9731620',
    borderWidth: 1,
    borderColor: '#f97316',
  },
  conversationItemContent: {
    flex: 1,
    marginRight: 8,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fafaf9',
    marginBottom: 4,
  },
  conversationTitleSelected: {
    color: '#f97316',
  },
  conversationDate: {
    fontSize: 12,
    color: '#78716c',
  },
  drawerLoading: {
    padding: 32,
    alignItems: 'center',
  },
  drawerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  drawerEmptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#a8a29e',
    marginTop: 16,
  },
  drawerEmptySubtext: {
    fontSize: 14,
    color: '#78716c',
    marginTop: 8,
    textAlign: 'center',
  },
});
