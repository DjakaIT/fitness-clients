import React from "react";
import { useState } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Modal,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import Ionicons from "@react-native-vector-icons/ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import GeneralButton from "../../components/GeneralButton";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/StylesHomeScreen";

const { width } = Dimensions.get("window");

const colors = {
  bgDeep: "#4b0622",
  bgSoft: "#654b55",
  textPrimary: "#FFFFFF",
  textSecondary: "#DBC1C9",
  accentPink: "#F497BA",
  cardBg: "rgba(255, 255, 255, 0.1)",
  cardBorder: "rgba(255, 255, 255, 0.2)",
  success: "#34D399",
};

const userData = {
  name: "Marta",
  currentWeight: 68.5,
  startWeight: 75.0,
  goalWeight: 62.0,
  progressPercent: 0.65,
};

export default function HomeScreen() {
  const navigate = useNavigation();
  const { user, logout } = useAuth();

  const lostSoFar = (userData.startWeight - userData.currentWeight).toFixed(1);
  const percentDisplay = Math.round(userData.progressPercent * 100);

  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const modalScale = useSharedValue(0.85);
  const modalTranslateY = useSharedValue(20);
  const modalOpacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  const openModal = () => {
    setProfileModalVisible(true);
    backdropOpacity.value = withTiming(1, { duration: 250 });
    modalOpacity.value = withTiming(1, { duration: 250 });
    modalScale.value = withSpring(1, {
      damping: 18,
      stiffness: 200,
      mass: 0.8,
    });
    modalTranslateY.value = withSpring(0, {
      damping: 18,
      stiffness: 200,
      mass: 0.8,
    });
  };

  const closeModal = () => {
    backdropOpacity.value = withTiming(0, { duration: 200 });
    modalOpacity.value = withTiming(0, { duration: 200 });
    modalScale.value = withTiming(0.85, { duration: 200 });
    modalTranslateY.value = withTiming(20, { duration: 200 });
    setTimeout(() => {
      setProfileModalVisible(false);
    }, 220);
  };

  const handleLogout = () => {
    closeModal();
    setTimeout(() => {
      logout();
    }, 250);
  };

  const handleProfile = () => {
    closeModal();
    setTimeout(() => {
      navigate.navigate("Profile");
    }, 250);
  };

  // Separate animated styles for backdrop and modal content
  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [
      { scale: modalScale.value },
      { translateY: modalTranslateY.value },
    ],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.bgSoft, colors.bgDeep]}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* --- HEADER --- */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Dobrodošla,</Text>
                <Text style={styles.headerTitle}>
                  {user?.displayName?.split(" ")[0] || userData.name}
                </Text>
              </View>

              <View style={styles.profileImageContainer}>
                <TouchableOpacity onPress={openModal} activeOpacity={0.7}>
                  <Image
                    source={{
                      uri: user?.photoURL || "https://i.pravatar.cc/150?img=5",
                    }}
                    style={styles.profileImage}
                  />
                  <View style={styles.notificationDot} />
                </TouchableOpacity>
              </View>
            </View>

            {/* --- GOAL / PROGRESS CARD --- */}
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Moj Napredak</Text>
                <Text style={styles.percentText}>{percentDisplay}%</Text>
              </View>

              {/* Custom Progress Bar */}
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={[colors.accentPink, "#F2829E"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressBarFill,
                    { width: `${percentDisplay}%` },
                  ]}
                />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Trenutno</Text>
                  <Text style={styles.statValue}>
                    {userData.currentWeight} <Text style={styles.unit}>kg</Text>
                  </Text>
                </View>

                <View style={styles.verticalDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Izgubljeno</Text>
                  <Text
                    style={[styles.statValue, { color: colors.accentPink }]}
                  >
                    -{lostSoFar}{" "}
                    <Text style={[styles.unit, { color: colors.accentPink }]}>
                      kg
                    </Text>
                  </Text>
                </View>

                <View style={styles.verticalDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Cilj</Text>
                  <Text style={styles.statValue}>
                    {userData.goalWeight} <Text style={styles.unit}>kg</Text>
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonStack}>
              <GeneralButton
                onPress={() => navigate.navigate("VideoCategories")}
                colors={["#8b5cf6", "#7c3aed"]} // Purple variation
                fullWidth
                style={styles.actionButton}
              >
                Video zbirka
              </GeneralButton>
              <GeneralButton
                onPress={() => navigate.navigate("Impressions")}
                colors={["#8b5cf6", "#7c3aed"]} // Purple variation
                fullWidth
                style={styles.actionButton}
              >
                Dojmovi
              </GeneralButton>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* --- PROFILE MODAL --- */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.modalBackdrop, backdropAnimatedStyle]}>
          <Pressable style={styles.backdropPressable} onPress={closeModal} />
        </Animated.View>

        {/* Modal content - centered overlay */}
        <View style={styles.modalCentering}>
          <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
            <LinearGradient
              colors={["rgba(101, 75, 85, 0.97)", "rgba(75, 6, 34, 0.97)"]}
              style={styles.modalGradient}
            >
              {/* Close X */}
              <TouchableOpacity
                onPress={closeModal}
                style={styles.modalCloseBtn}
                activeOpacity={0.6}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* User info */}
              <View style={styles.modalUserSection}>
                <Image
                  source={{
                    uri: user?.photoURL || "https://i.pravatar.cc/150?img=5",
                  }}
                  style={styles.modalAvatar}
                />
                <Text style={styles.modalUserName}>
                  {user?.displayName || "User"}
                </Text>
                <Text style={styles.modalUserEmail}>{user?.email || ""}</Text>
              </View>

              <View style={styles.modalDivider} />

              {/* Action buttons */}
              <View style={styles.modalActions}>
                {/* Profile */}
                <TouchableOpacity
                  onPress={handleProfile}
                  activeOpacity={0.7}
                  style={styles.modalBtn}
                >
                  <LinearGradient
                    colors={[
                      "rgba(244, 151, 186, 0.2)",
                      "rgba(244, 151, 186, 0.08)",
                    ]}
                    style={styles.modalBtnGradient}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={colors.accentPink}
                    />
                    <Text style={styles.modalBtnText}>Profil</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.textSecondary}
                      style={styles.modalBtnChevron}
                    />
                  </LinearGradient>
                </TouchableOpacity>

                {/* Sign out */}
                <TouchableOpacity
                  onPress={handleLogout}
                  activeOpacity={0.7}
                  style={styles.modalBtn}
                >
                  <LinearGradient
                    colors={[
                      "rgba(239, 68, 68, 0.15)",
                      "rgba(239, 68, 68, 0.05)",
                    ]}
                    style={styles.modalBtnGradient}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#EF4444"
                    />
                    <Text style={[styles.modalBtnText, { color: "#EF4444" }]}>
                      Odjavi se
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="rgba(239, 68, 68, 0.4)"
                      style={styles.modalBtnChevron}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Bottom accent line */}
              <LinearGradient
                colors={[colors.accentPink, "#F2829E", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalAccentLine}
              />
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
