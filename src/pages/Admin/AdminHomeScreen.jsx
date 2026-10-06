import React, { useMemo } from "react";
import { Text, View, Image, Pressable, ScrollView } from "react-native";
import GeneralButton from "../../components/GeneralButton";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../../styles/Admin/StylesAdminHomeScreen";
import usePendingUsers from "../../hooks/usePendingUsers";
import useTrainerSchedule from "../../hooks/useTrainerSchedule";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import { BRAND } from "../../../backend/config/tenant";
import {
  formatWeekLabel,
  getBookingWindow,
} from "../../../backend/utils/appointmentConfig";

export default function AdminHomeScreen() {
  const navigation = useNavigation();
  const { pendingUsers } = usePendingUsers();
  const hasPending = pendingUsers.length > 0;

  // Clients can only book a week the trainer has saved a schedule for, and
  // she has to save it again every week — even unchanged. Without a nudge
  // here the first sign of a forgotten week was a client saying she could
  // not book.
  const { schedule, loading: scheduleLoading } = useTrainerSchedule();
  const bookingWeek = useMemo(() => getBookingWindow().weekStart, []);
  const scheduleMissing =
    !scheduleLoading && schedule?.weekStart !== bookingWeek;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Theme + logout: the one place in the admin section, instead of a
          bubble repeated (and out of place) on every sub-screen. */}
      <View style={styles.topBar}>
        <ProfilePageComponent />
      </View>

      <Text style={styles.greeting}>
        Dobrodošla nazad,{"\n"}
        <Text style={styles.name}>{BRAND.trainerName}.</Text>
      </Text>

      <View style={styles.imageWrapper}>
        <View style={styles.imageBorder}>
          <Image
            source={require("../../../assets/images/logo.jpeg")}
            style={styles.profileImage}
          />
        </View>
      </View>

      <Text style={styles.brandText}>{BRAND.appName}</Text>

      {hasPending && (
        <Pressable
          style={styles.notificationCard}
          onPress={() => navigation.navigate("AdminUserList")}
          accessibilityRole="button"
        >
          <View style={styles.notificationDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.notificationTitle}>
              {pendingUsers.length === 1
                ? "1 nova prijava"
                : `${pendingUsers.length} novih prijava`}
            </Text>
            <Text style={styles.notificationSub}>
              {/* An Apple account can arrive without a name. */}
              {pendingUsers[0]?.displayName ||
                pendingUsers[0]?.email ||
                "Nova klijentica"}{" "}
              čeka odobrenje →
            </Text>
          </View>
        </Pressable>
      )}

      {scheduleMissing && (
        <Pressable
          style={styles.notificationCard}
          onPress={() => navigation.navigate("AdminTrainerTime")}
          accessibilityRole="button"
        >
          <View style={[styles.notificationDot, styles.reminderDot]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.notificationTitle}>
              Raspored za {formatWeekLabel(bookingWeek)} nije spremljen
            </Text>
            <Text style={styles.notificationSub}>
              Klijentice ne mogu rezervirati dok ga ne spremiš →
            </Text>
          </View>
        </Pressable>
      )}

      <Text style={styles.description}>
        Iza ovog ekrana stoje{"\n"}djevojke koje s tobom grade{"\n"}bolju
        budućnost, zato je ova{"\n"}aplikacija tu da ti olakša.
      </Text>

      <View style={styles.buttonContainer}>
        <GeneralButton
          onPress={() => navigation.navigate("AdminUserList")}
          colors={["#7C3AED", "#7C3AED"]}
          size="lg"
          fullWidth
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Online klijentice</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </View>
        </GeneralButton>
        <GeneralButton
          onPress={() => navigation.navigate("AdminInPerson")}
          colors={["#7C3AED", "#7C3AED"]}
          size="lg"
          fullWidth
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Uživo klijentice</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </View>
        </GeneralButton>
      </View>
    </ScrollView>
  );
}
