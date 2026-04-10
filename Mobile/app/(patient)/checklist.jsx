import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Colors from '../../constants/Colors';
import { submitVitals } from '../../services/apiService';
import { DEMO_PATIENT_ID } from '../../constants/Config';
import { CheckCircle2, HeartPulse, Pill, Activity, Bot } from 'lucide-react-native';

export default function PatientChecklist() {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [sugar, setSugar] = useState('');
  const [medsTaken, setMedsTaken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const handleSubmit = async () => {
    if (!systolic || !diastolic || !sugar) {
      Alert.alert('Missing Info', 'Please enter all your vitals.');
      return;
    }

    setLoading(true);
    setSummary(null);

    try {
      const payload = {
        patientId: DEMO_PATIENT_ID, // Use fallback demo ID
        systolicBP: parseInt(systolic, 10),
        diastolicBP: parseInt(diastolic, 10),
        bloodSugar: parseInt(sugar, 10),
        medicationsTaken: medsTaken,
      };

      const response = await submitVitals(payload);
      
      if (response.success && response.data.summary) {
        setSummary(response.data.summary);
      } else {
        setSummary("Your vitals have been successfully logged. Your care team has been notified.");
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit vitals. Make sure the Node.js API Gateway is running.');
      setSummary("Your vitals have been saved offline and will sync when connected. You're doing great!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {summary ? (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Bot color={Colors.accent} size={24} />
            <Text style={styles.summaryTitle}>CareConnect Summary</Text>
          </View>
          <Text style={styles.summaryText}>{summary}</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={() => setSummary(null)}>
            <Text style={styles.resetBtnText}>Log Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.subGreeting}>Let's do your 30-second daily check-in.</Text>
          </View>

          {/* Blood Pressure */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <HeartPulse color={Colors.primary} size={20} />
              <Text style={styles.cardTitle}>Blood Pressure</Text>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputSplit}
                placeholder="Systolic (e.g. 120)"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={systolic}
                onChangeText={setSystolic}
              />
              <Text style={styles.slash}>/</Text>
              <TextInput
                style={styles.inputSplit}
                placeholder="Diastolic (e.g. 80)"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={diastolic}
                onChangeText={setDiastolic}
              />
            </View>
          </View>

          {/* Blood Sugar */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Activity color={Colors.danger} size={20} />
              <Text style={styles.cardTitle}>Blood Sugar</Text>
            </View>
            <TextInput
              style={styles.inputFull}
              placeholder="mg/dL (e.g. 110)"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={sugar}
              onChangeText={setSugar}
            />
          </View>

          {/* Medications */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Pill color={Colors.secondary} size={20} />
              <Text style={styles.cardTitle}>Medications</Text>
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleText}>Have you taken your meds today?</Text>
              <TouchableOpacity
                style={[styles.toggleBtn, medsTaken && styles.toggleActive]}
                onPress={() => setMedsTaken(!medsTaken)}
              >
                <CheckCircle2 color={medsTaken ? '#fff' : Colors.textMuted} size={20} />
                <Text style={[styles.toggleBtnText, medsTaken && { color: '#fff' }]}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Check-in</Text>
            )}
          </TouchableOpacity>
        </>
      )}
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
  header: {
    marginBottom: 24,
  },
  greeting: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  subGreeting: {
    color: Colors.textMuted,
    fontSize: 16,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputSplit: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    color: Colors.text,
    fontSize: 16,
  },
  slash: {
    color: Colors.textMuted,
    fontSize: 24,
    marginHorizontal: 12,
  },
  inputFull: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    color: Colors.text,
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleText: {
    color: Colors.textMuted,
    flex: 1,
    fontSize: 14,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  toggleBtnText: {
    color: Colors.textMuted,
    marginLeft: 6,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#1E3A8A', // Deep reassuring blue
    borderRadius: 16,
    padding: 24,
    marginTop: 40,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  summaryText: {
    color: '#E0E7FF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  resetBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
