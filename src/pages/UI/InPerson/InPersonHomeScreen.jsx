import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import useAppointments from "../../../hooks/useAppointments";
import useCancelAppointment from "../../../hooks/useCancelAppointment";
import {
  formatDateLong,
  canCancel,
} from "../../../../backend/utils/appointmentConfig";
import { styles } from "../../../styles/UI/InPerson/STylesInPersonHomeScreen";

export default function InPersonHomeScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const { appointments, loading } = useAppointments(user?.uid);
  const { cancelAppointment, isCancelling } = useCancelAppointment();

  const firstName = user?.displayName?.split(" ")[0] ?? "";

  const handleCancel = (item) => {
    Alert.alert(
      "Otkaži termin",
      `${formatDateLong(item.appointmentDate)} u ${item.time}`,
      [
        { text: "Odustani", style: "cancel" },
        {
          text: "Otkaži termin",
          style: "destructive",
          onPress: async () => {
            const result = await cancelAppointment(
              item.id,
              item.appointmentDate,
              item.time,
            );
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
  };

  const renderAppointment = ({ item }) => {
    const cancellable = canCancel(item.appointmentDate, item.time);
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentLeft}>
          <Text style={styles.appointmentDate}>
            {formatDateLong(item.appointmentDate)}
          </Text>
          <Text style={styles.appointmentTime}>{item.time}</Text>
        </View>
        {cancellable ? (
          <Pressable
            style={styles.cancelBtn}
            onPress={() => handleCancel(item)}
            disabled={isCancelling}
          >
            <Text style={styles.cancelBtnText}>Otkaži</Text>
          </Pressable>
        ) : (
          <Text style={styles.cannotCancelText}>Nije moguće{"\n"}otkazati</Text>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#4b0622", "#654b55"]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>MARTA FITNESS</Text>
              <Text style={styles.greeting}>Dobrodošla,</Text>
              <Text style={styles.name}>{firstName}!</Text>
            </View>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Appointments */}
          <Text style={styles.sectionLabel}>NADOLAZEĆI TERMINI</Text>

          {loading ? (
            <ActivityIndicator color="#F497BA" style={{ marginTop: 20 }} />
          ) : appointments.length === 0 ? (
            <View style={styles.emptyState}>
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
            <Text style={styles.addButtonText}>+ Dodaj novi termin</Text>
          </Pressable>

          {/* Logout */}
          <Pressable style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Odjava</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
