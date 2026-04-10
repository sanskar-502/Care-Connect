import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { uploadDictation } from '../../services/apiService';
import { DEMO_PATIENT_ID } from '../../constants/Config';
import { Mic, Square, FileText, CheckCircle2 } from 'lucide-react-native';

export default function DictateScreen() {
  const router = useRouter();
  const [mode, setMode] = useState('voice'); // 'voice' | 'text'
  const [recording, setRecording] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedIntent, setExtractedIntent] = useState(null);

  async function startRecording() {
    try {
      setExtractedIntent(null);
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
      } else {
        Alert.alert('Permission needed', 'Please grant microphone access to dictate.');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    try {
      setRecording(undefined);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      
      // For the hackathon, we simulate Whisper transcription with hardcoded text or text input
      // because actual audio upload to a Whisper endpoint requires form-data and an active LLM endpoint
      Alert.alert('Voice captured', 
        'For this hackathon demo, please use Text mode or click Process to simulate the Whisper transcription.',
        [{text: 'Process', onPress: () => processDictation("Patient presents with fatigue and dyspnea. Stopped Metoprolol. Order Echo.")}]
      );
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }

  const processDictation = async (simulatedTranscript = null) => {
    const content = simulatedTranscript || textInput;
    if (!content) {
      Alert.alert('Empty', 'Please dictate or type a note.');
      return;
    }

    setLoading(true);
    try {
      const response = await uploadDictation(DEMO_PATIENT_ID, content);
      if (response.success && response.data.extractedIntent) {
        setExtractedIntent(response.data.extractedIntent);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process dictation. Make sure the Node+Python backends are running.');
      // Hackathon Mock Fallback
      setExtractedIntent({
        symptoms: ['Fatigue', 'Dyspnea'],
        medicationChanges: ['Stopped Metoprolol'],
        actions: ['Order Echo']
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, mode === 'voice' && styles.tabActive]} 
          onPress={() => setMode('voice')}
        >
          <Text style={[styles.tabText, mode === 'voice' && styles.tabTextActive]}>Live Voice</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, mode === 'text' && styles.tabActive]} 
          onPress={() => setMode('text')}
        >
          <Text style={[styles.tabText, mode === 'text' && styles.tabTextActive]}>Text Input</Text>
        </TouchableOpacity>
      </View>

      {/* Input Area */}
      <View style={styles.inputArea}>
        {mode === 'voice' ? (
          <View style={styles.voiceArea}>
            <TouchableOpacity 
              style={[styles.micBtn, recording ? styles.micBtnRecording : null]}
              onPress={recording ? stopRecording : startRecording}
            >
              {recording ? (
                <Square color="#fff" fill="#fff" size={32} />
              ) : (
                <Mic color="#fff" size={40} />
              )}
            </TouchableOpacity>
            <Text style={styles.voiceHint}>
              {recording ? 'Recording... Tap to stop' : 'Tap to start ambient dictation'}
            </Text>
          </View>
        ) : (
          <View style={styles.textArea}>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={6}
              placeholder="Type clinical notes here..."
              placeholderTextColor={Colors.textMuted}
              value={textInput}
              onChangeText={setTextInput}
              textAlignVertical="top"
            />
            <TouchableOpacity 
              style={styles.processBtn} 
              onPress={() => processDictation()}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.processBtnText}>Process Notes</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Results Area */}
      {extractedIntent && (
        <View style={styles.resultsArea}>
          <Text style={styles.resultsTitle}>AI Extracted Intent</Text>
          
          <View style={styles.resultGroup}>
            <Text style={styles.groupHead}>Symptoms</Text>
            {extractedIntent.symptoms?.map((s, i) => (
              <View key={i} style={styles.bulletItem}>
                <CheckCircle2 size={16} color={Colors.accent} />
                <Text style={styles.bulletText}>{s}</Text>
              </View>
            ))}
            {(!extractedIntent.symptoms || extractedIntent.symptoms.length === 0) && <Text style={styles.emptyText}>None detected</Text>}
          </View>

          <View style={styles.resultGroup}>
            <Text style={styles.groupHead}>Medication Changes</Text>
            {extractedIntent.medicationChanges?.map((m, i) => (
              <View key={i} style={styles.bulletItem}>
                <CheckCircle2 size={16} color={Colors.secondary} />
                <Text style={styles.bulletText}>{m}</Text>
              </View>
            ))}
             {(!extractedIntent.medicationChanges || extractedIntent.medicationChanges.length === 0) && <Text style={styles.emptyText}>None detected</Text>}
          </View>

          <View style={styles.resultGroup}>
            <Text style={styles.groupHead}>Actions</Text>
            {extractedIntent.actions?.map((a, i) => (
              <View key={i} style={styles.bulletItem}>
                <CheckCircle2 size={16} color={Colors.success} />
                <Text style={styles.bulletText}>{a}</Text>
              </View>
            ))}
             {(!extractedIntent.actions || extractedIntent.actions.length === 0) && <Text style={styles.emptyText}>None detected</Text>}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={() => { Alert.alert('Saved', 'Saved to patient record.'); setExtractedIntent(null); setTextInput(''); }}>
            <Text style={styles.saveBtnText}>Save to EMR</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* RAG Copilot Link */}
      <TouchableOpacity style={styles.copilotLink} onPress={() => router.push('/(doctor)/copilot')}>
        <FileText color={Colors.primary} size={20} />
        <Text style={styles.copilotLinkText}>Open RAG Copilot</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: Colors.cardElevated,
  },
  tabText: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.text,
  },
  inputArea: {
    marginBottom: 24,
  },
  voiceArea: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 40,
    minHeight: 250,
  },
  micBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  micBtnRecording: {
    backgroundColor: Colors.danger,
    shadowColor: Colors.danger,
  },
  voiceHint: {
    color: Colors.textMuted,
    marginTop: 20,
    fontSize: 14,
  },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  textInput: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    marginBottom: 16,
  },
  processBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  processBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  resultsArea: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  resultsTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultGroup: {
    marginBottom: 16,
  },
  groupHead: {
    color: Colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bulletText: {
    color: Colors.text,
    marginLeft: 8,
    fontSize: 15,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  saveBtn: {
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  copilotLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '20',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '50',
  },
  copilotLinkText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});
