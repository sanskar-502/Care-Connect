import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import Colors from '../../constants/Colors';
import { askCopilot } from '../../services/apiService';
import { DEMO_PATIENT_ID } from '../../constants/Config';
import { Send, Bot, User } from 'lucide-react-native';

export default function CopilotScreen() {
  const [messages, setMessages] = useState([
    { id: '1', role: 'bot', text: 'Hello Doctor. I am the RAG Medical Copilot. How can I assist you with this patient\'s history?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const query = input;
    setInput('');
    setLoading(true);

    try {
      const response = await askCopilot(DEMO_PATIENT_ID, query);
      const botMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'bot', 
        text: response.success ? response.data.answer : 'Sorry, the AI Engine encountered an error.'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Mock fallback
      const botMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'bot', 
        text: "The patient logged a systolic BP of 150 yesterday, which is elevated compared to their baseline. Based on clinical notes, they missed their morning dosage of Metoprolol."
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isBot = item.role === 'bot';
    return (
      <View style={[styles.msgRow, isBot ? styles.msgRowBot : styles.msgRowUser]}>
        {isBot && (
          <View style={styles.avatarBot}>
            <Bot size={16} color="#fff" />
          </View>
        )}
        <View style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}>
          <Text style={[styles.msgText, isBot ? styles.msgTextBot : styles.msgTextUser]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      {loading && (
        <View style={styles.loadingRow}>
          <View style={styles.avatarBot}>
            <Bot size={16} color="#fff" />
          </View>
          <Text style={styles.thinkingText}>Copilot is searching records...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about patient history..."
          placeholderTextColor={Colors.textMuted}
          value={input}
          onChangeText={setInput}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chatList: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  msgRowBot: {
    justifyContent: 'flex-start',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  avatarBot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleBot: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 22,
  },
  msgTextBot: {
    color: Colors.text,
  },
  msgTextUser: {
    color: '#fff',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  thinkingText: {
    color: Colors.textMuted,
    fontStyle: 'italic',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    color: Colors.text,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 15,
    marginRight: 10,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
});
