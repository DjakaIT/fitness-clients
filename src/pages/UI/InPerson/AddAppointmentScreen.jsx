import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import useAddAppointment from "../../../hooks/useAddAppointment";
import {
  TIMES,
  getBookableDates,
  formatDateShort,
} from "../../../../backend/utils/appointmentConfig";
import { styles } from "../../../styles/UI/InPerson/StylesAddAppointmentScreen";

export default function AddAppointmentScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { addAppointment, isAdding } = useAddAppointment();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const bookableDates = getBookableDates();
  const canSubmit = selectedDate && selectedTime;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const result = await addAppointment(
      user.uid,
      user.displayName,
      user.photoURL,
      selectedDate,
      selectedTime,
    );
    if (result.success) {
      navigation.goBack();
    } else {
      Alert.alert("Greška", "Termin nije dodan. Pokušaj ponovo.");
    }
  };

  return (
    <LinearGradient colors={["#4b0622", "#654b55"]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Natrag</Text>
          </Pressable>

          <Text style={styles.title}>Novi termin</Text>
          <Text style={styles.subtitle}>Odaberi datum i sat treninga</Text>

          {/* Date selector */}
          <Text style={styles.label}>DATUM</Text>
          <View style={styles.dateList}>
            {bookableDates.map((date) => (
              <Pressable
                key={date}
                style={[
                  styles.dateChip,
                  selectedDate === date && styles.chipActive,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text
                  style={[
                    styles.dateChipText,
                    selectedDate === date && styles.chipTextActive,
                  ]}
                >
                  {formatDateShort(date)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Time selector */}
          <Text style={styles.label}>VRIJEME</Text>
          <View style={styles.timeGrid}>
            {TIMES.map((t) => (
              <Pressable
                key={t}
                style={[
                  styles.timeChip,
                  selectedTime === t && styles.chipActive,
                ]}
                onPress={() => setSelectedTime(t)}
              >
                <Text
                  style={[
                    styles.timeChipText,
                    selectedTime === t && styles.chipTextActive,
                  ]}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Submit */}
          <Pressable
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isAdding || !canSubmit}
          >
            {isAdding ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Spremi termin</Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
