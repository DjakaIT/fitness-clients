import React from "react";
import { View, Text, Image, Pressable, Animated, Platform } from "react-native";
import { styles } from "../styles/Components/StylesUserCard";
import formatDate from "../../backend/utils/dateUtil";

const useNativeDriver = Platform.OS !== "web";

export default function UserCard({
  displayName,
  photoUrl,
  lastLogin,
  buttonLabel = "Pregled klijentice",
  onPress,
}) {
  const animatedScale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.985,
      useNativeDriver,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[styles.card, { transform: [{ scale: animatedScale }] }]}
      >
        <View style={styles.left}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.placeholderAvatar, styles.avatar]}>
              <Text style={styles.avatarInitial}>
                {displayName ? displayName.charAt(0).toUpperCase() : "..."}
              </Text>
            </View>
          )}
          <View style={styles.info}>
            <Text style={styles.displayName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.subtitle}>
              {lastLogin ? (
                <Text style={styles.subtitle}>
                  Zadnja prijava: {formatDate(lastLogin)}
                </Text>
              ) : null}
            </Text>
          </View>
        </View>
        <View style={styles.action}>
          <Text style={styles.actionText}>{buttonLabel}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}
