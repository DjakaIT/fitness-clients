import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles } from "../styles/Components/StylesVideoCard";
import { useTheme, useThemedStyles } from "../context/ThemeContext";

export default function VideoCard({ title, image, onPress, imageScale }) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {/* IMAGE */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={[styles.image, { transform: [{ scale: imageScale }] }]}
          />
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={3}>
            {title}
          </Text>

          <Pressable
            onPress={onPress}
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Ionicons name="play" size={18} color={theme.onAccent} />
            <Text style={styles.buttonText}>Pogledaj</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
