import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import GeneralButton from "../../components/GeneralButton";
import useFetchReviews from "../../hooks/useFetchReviews";

export default function AdminClientGeneralScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { userId, displayName, photoURL } = params ?? {};

  const { reviews, isFetching } = useFetchReviews(userId);
  const impressionCount = reviews.length;

  const initial = (displayName?.trim()?.[0] || "?").toUpperCase();

  const goToPrograms = () =>
    navigation.navigate("AdminClientPrograms", { userId, displayName });
  const goToBuilder = () =>
    navigation.navigate("AdminWorkoutBuilder", { userId, displayName });
  const goToImpressions = () =>
    navigation.navigate("AdminUserImpression", { userId, displayName });
  const goToMeasurements = () =>
    navigation.navigate("AdminClientMeasurements", { userId, displayName });

  return (
    <SafeAreaView style={s.safeArea}>
      <ProfilePageComponent />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={s.back}>← Natrag</Text>
        </Pressable>

        {/* Client header */}
        <View style={s.headerCard}>
          <View style={s.avatar}>
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={s.avatarImg} />
            ) : (
              <Text style={s.avatarInitial}>{initial}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.name} numberOfLines={1}>
              {displayName}
            </Text>
            <View style={s.badge}>
              <Text style={s.badgeText}>Online klijentica</Text>
            </View>
          </View>
        </View>

        {/* Program section */}
        <Text style={s.sectionLabel}>PROGRAM VJEŽBANJA</Text>
        <GeneralButton
          colors={["#7C3AED", "#6D28D9"]}
          fullWidth
          onPress={goToPrograms}
        >
          Pregled programa
        </GeneralButton>
        <Pressable style={s.outlineBtn} onPress={goToBuilder}>
          <Text style={s.outlineBtnText}>+ Novi program</Text>
        </Pressable>

        {/* Impressions cutout ticket card */}
        <Text style={[s.sectionLabel, { marginTop: 26 }]}>DOJMOVI</Text>
        <Pressable style={s.ticket} onPress={goToImpressions}>
          <View style={s.ticketMain}>
            {isFetching ? (
              <ActivityIndicator color="#7C3AED" style={{ alignSelf: "flex-start" }} />
            ) : (
              <Text style={s.ticketNumber}>{impressionCount}</Text>
            )}
            <Text style={s.ticketLabel}>
              {impressionCount === 1 ? "dojam ostavljen" : "dojmova ostavljeno"}
            </Text>
          </View>

          <View style={s.ticketStub}>
            <Text style={s.ticketStubText}>Pregledaj</Text>
            <Text style={s.ticketStubArrow}>→</Text>
          </View>

          {/* Perforation notches */}
          <View style={[s.notch, s.notchTop]} />
          <View style={[s.notch, s.notchBottom]} />
        </Pressable>

        {/* Progress / measurements */}
        <Text style={[s.sectionLabel, { marginTop: 26 }]}>NAPREDAK</Text>
        <Pressable style={s.outlineBtn} onPress={goToMeasurements}>
          <Text style={s.outlineBtnText}>Mjerenja i napredak</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const PAGE_BG = "#F7F7F8";

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE_BG },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  back: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#7C3AED",
    marginBottom: 12,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F2",
    padding: 16,
    marginBottom: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarInitial: {
    fontSize: 24,
    fontFamily: "Outfit_700Bold",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 20,
    fontFamily: "Outfit_700Bold",
    color: "#111827",
    marginBottom: 6,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5F3FF",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#7C3AED",
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    marginBottom: 12,
  },
  outlineBtn: {
    marginTop: 12,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  outlineBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#7C3AED",
  },
  ticket: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F2",
    minHeight: 96,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  ticketMain: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  ticketNumber: {
    fontSize: 34,
    fontFamily: "Outfit_700Bold",
    color: "#7C3AED",
    lineHeight: 38,
  },
  ticketLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
    marginTop: 2,
  },
  ticketStub: {
    width: 118,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
  },
  ticketStubText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#7C3AED",
  },
  ticketStubArrow: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#7C3AED",
    marginTop: 2,
  },
  notch: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: PAGE_BG,
    right: 109,
  },
  notchTop: { top: -9 },
  notchBottom: { bottom: -9 },
});
