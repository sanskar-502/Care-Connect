import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { ShieldAlert, User, Stethoscope } from 'lucide-react-native';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ShieldAlert color={Colors.primary} size={48} strokeWidth={2} />
        <Text style={styles.title}>CareConnect</Text>
        <Text style={styles.subtitle}>Select Your Persona</Text>
      </View>

      <View style={styles.cardContainer}>
        {/* Patient Portal Card */}
        <TouchableOpacity 
          style={[styles.card, { borderTopColor: Colors.accent }]}
          activeOpacity={0.8}
          onPress={() => router.push('/(patient)/checklist')}
        >
          <View style={[styles.iconBox, { backgroundColor: Colors.accent + '20' }]}>
            <User color={Colors.accent} size={32} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Patient Portal</Text>
            <Text style={styles.cardDesc}>Log daily vitals & view simplified care plans.</Text>
          </View>
        </TouchableOpacity>

        {/* Doctor Portal Card */}
        <TouchableOpacity 
          style={[styles.card, { borderTopColor: Colors.primary }]}
          activeOpacity={0.8}
          onPress={() => router.push('/(doctor)/dictate')}
        >
          <View style={[styles.iconBox, { backgroundColor: Colors.primary + '20' }]}>
            <Stethoscope color={Colors.primary} size={32} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Clinician Portal</Text>
            <Text style={styles.cardDesc}>Ambient dictation & RAG Copilot assistance.</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 16,
    marginTop: 8,
  },
  cardContainer: {
    gap: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDesc: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
