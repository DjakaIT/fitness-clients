import React from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import useAppointments from "../../hooks/useAppointments";
import { formatDateLong } from "../../../backend/utils/appointmentConfig";
import { styles } from "../../styles/Admin/StylesAdminClientsScheduleScreen";

export default function AdminClientScheduleScreen() {
  const { params } = useRoute();
  const { userId, displayName } = params;
  const { appointments, loading } = useAppointments(userId);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.dateBlock}>
        <Text style={styles.dateText}>
          {formatDateLong(item.appointmentDate)}
        </Text>
      </View>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfilePageComponent />
      <View style={styles.container}>
        <Text style={styles.title}>{displayName}</Text>
        <Text style={styles.subtitle}>Nadolazeći termini</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#7C3AED"
            style={{ marginTop: 40 }}
          />
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
