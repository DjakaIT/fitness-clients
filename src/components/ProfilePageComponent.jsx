import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Pressable, Modal } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Moon, Sun } from "phosphor-react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme, useThemedStyles } from "../context/ThemeContext";
import { makeStyles } from "../styles/Components/StylesProfileModal";

function Avatar({ uri, initial, style, textStyle, styles }) {
  if (uri) {
    return (
      <View style={style}>
        <Image source={{ uri }} style={styles.avatarImage} />
      </View>
    );
  }
  return (
    <View style={style}>
      <View style={styles.avatarFallback}>
        <Text style={[styles.avatarFallbackText, textStyle]}>{initial}</Text>
      </View>
    </View>
  );
}

export default function ProfilePageComponent() {
  const { user, logout } = useAuth();
  const { theme, mode, setMode } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [visible, setVisible] = useState(false);

  const modalScale = useSharedValue(0.85);
  const modalTranslateY = useSharedValue(20);
  const modalOpacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  const initial = (user?.displayName ?? "?").charAt(0).toUpperCase();

  const openModal = () => {
    setVisible(true);
    backdropOpacity.value = withTiming(1, { duration: 250 });
    modalOpacity.value = withTiming(1, { duration: 250 });
    modalScale.value = withSpring(1, { damping: 18, stiffness: 200, mass: 0.8 });
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
      setVisible(false);
    }, 220);
  };

  const handleLogout = () => {
    closeModal();
    setTimeout(() => {
      logout();
    }, 250);
  };

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
    <>
      <TouchableOpacity onPress={openModal} activeOpacity={0.7}>
        <Avatar
          uri={user?.photoURL}
          initial={initial}
          style={styles.avatarButton}
          styles={styles}
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <Pressable style={styles.backdropPressable} onPress={closeModal} />
        </Animated.View>

        <View style={styles.centering} pointerEvents="box-none">
          <Animated.View style={[styles.card, modalAnimatedStyle]}>
            <TouchableOpacity
              onPress={closeModal}
              style={styles.closeBtn}
              activeOpacity={0.6}
            >
              <Ionicons name="close" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            <View style={styles.userSection}>
              <Avatar
                uri={user?.photoURL}
                initial={initial}
                style={styles.modalAvatar}
                textStyle={{ fontSize: 30 }}
                styles={styles}
              />
              <Text style={styles.userName}>{user?.displayName || "Korisnica"}</Text>
              <Text style={styles.userEmail}>{user?.email || ""}</Text>
            </View>

            <View style={styles.divider} />

            {/* Theme toggle */}
            <View style={styles.themeRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setMode("light")}
                style={[
                  styles.themeOption,
                  mode === "light" && styles.themeOptionActive,
                ]}
              >
                <Sun
                  size={18}
                  weight={mode === "light" ? "fill" : "regular"}
                  color={mode === "light" ? theme.accent : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    mode === "light" && styles.themeOptionTextActive,
                  ]}
                >
                  Svijetla
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setMode("dark")}
                style={[
                  styles.themeOption,
                  mode === "dark" && styles.themeOptionActive,
                ]}
              >
                <Moon
                  size={18}
                  weight={mode === "dark" ? "fill" : "regular"}
                  color={mode === "dark" ? theme.accent : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    mode === "dark" && styles.themeOptionTextActive,
                  ]}
                >
                  Tamna
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.7}
              style={styles.logoutBtn}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.danger} />
              <Text style={styles.logoutText}>Odjavi se</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
