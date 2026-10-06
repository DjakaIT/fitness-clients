import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import useAppointments from "../../hooks/useAppointments";
import useCancelAppointment from "../../hooks/useCancelAppointment";
import { formatDateLong } from "../../../backend/utils/appointmentConfig";
import { styles } from "../../styles/Admin/StylesAdminClientsScheduleScreen";

export default function AdminClientScheduleScreen() {
  const { params } = useRoute();
  const { userId, displayName } = params;
  const { appointments, loading, error } = useAppointments(userId);
  const { cancelAppointment, isCancelling } = useCancelAppointment();

  // The trainer is not bound by the 24h cutoff (the rules agree): if she is
  // ill, the slot has to be freed whatever the hour. The client sees it
  // disappear from her upcoming list, so this asks first.
  const confirmCancel = (item) =>
    Alert.alert(
      "Otkazati termin?",
      `${formatDateLong(item.appointmentDate)} u ${item.time} — termin se oslobađa i klijentica ga više neće vidjeti među svojima.`,
      [
        { text: "Odustani", style: "cancel" },
        {
          text: "Otkaži termin",
          style: "destructive",
          onPress: async () => {
            const result = await cancelAppointment(item.id, { isAdmin: true });
            if (!result.success) {
              Alert.alert(
                "Greška",
                "Otkazivanje nije uspjelo. Pokušaj ponovo.",
              );
            }
          },
        },
      ],
    );

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.dateBlock}>
        <Text style={styles.dateText}>
          {formatDateLong(item.appointmentDate)}
        </Text>
      </View>
      <Text style={styles.time}>{item.time}</Text>
      <Pressable
        style={styles.cancelBtn}
        onPress={() => confirmCancel(item)}
        disabled={isCancelling}
        accessibilityRole="button"
        accessibilityLabel={`Otkaži termin ${formatDateLong(item.appointmentDate)} u ${item.time}`}
      >
        <Text style={styles.cancelBtnText}>Otkaži</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{displayName}</Text>
        <Text style={styles.subtitle}>Nadolazeći termini</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#7C3AED"
            style={{ marginTop: 40 }}
          />
        ) : error ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Termini se nisu učitali.</Text>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nema zakazanih termina.</Text>
          </View>
        ) : (
          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
