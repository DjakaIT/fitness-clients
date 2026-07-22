import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { Plus, CalendarBlank } from "phosphor-react-native";
import { useAuth } from "../../../context/AuthContext";
import { useTheme, useThemedStyles } from "../../../context/ThemeContext";
import useAppointments from "../../../hooks/useAppointments";
import useCancelAppointment from "../../../hooks/useCancelAppointment";
import ProfilePageComponent from "../../../components/ProfilePageComponent";
import CancelAppointmentSheet from "../../../components/CancelAppointmentSheet";
import { formatDateLong } from "../../../../backend/utils/appointmentConfig";
import { makeStyles } from "../../../styles/UI/InPerson/STylesInPersonHomeScreen";

export default function InPersonHomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { appointments, loading } = useAppointments(user?.uid);
  const { cancelAppointment, isCancelling } = useCancelAppointment();

  const [cancelTarget, setCancelTarget] = useState(null);

  const firstName = user?.displayName?.split(" ")[0] ?? "";

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    const result = await cancelAppointment(
      cancelTarget.id,
      cancelTarget.appointmentDate,
      cancelTarget.time,
    );
    if (result.success) {
      setCancelTarget(null);
    } else if (!result.tooLate) {
      Alert.alert("Greška", "Otkazivanje nije uspjelo. Pokušaj ponovo.");
    }
  };

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentLeft}>
        <Text style={styles.appointmentDate}>
          {formatDateLong(item.appointmentDate)}
        </Text>
        <Text style={styles.appointmentTime}>{item.time}</Text>
      </View>
      <Pressable style={styles.cancelBtn} onPress={() => setCancelTarget(item)}>
        <Text style={styles.cancelBtnText}>Otkaži</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar style={theme.statusBar} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>MARTA FITNESS</Text>
              <Text style={styles.greeting}>Dobrodošla,</Text>
              <Text style={styles.name}>{firstName}!</Text>
            </View>
            <ProfilePageComponent />
          </View>

          {/* Appointments */}
          <Text style={styles.sectionLabel}>NADOLAZEĆI TERMINI</Text>

          {loading ? (
            <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />
          ) : appointments.length === 0 ? (
            <View style={styles.emptyState}>
              <CalendarBlank
                size={36}
                weight="duotone"
                color={theme.accent}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>Još nemaš zakazanih termina.</Text>
            </View>
          ) : (
            <FlatList
              data={appointments}
              keyExtractor={(item) => item.id}
              renderItem={renderAppointment}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Add button */}
          <Pressable
            style={styles.addButton}
            onPress={() => navigation.navigate("AddAppointment")}
          >
            <Plus size={20} weight="bold" color={theme.onAccent} />
            <Text style={styles.addButtonText}>Dodaj novi termin</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <CancelAppointmentSheet
        visible={cancelTarget !== null}
        appointment={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        isCancelling={isCancelling}
      />
    </View>
  );
}
