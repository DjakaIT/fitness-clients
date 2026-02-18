import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getVideosByCategory } from "../../backend/data/videos";

const colors = {
  cardBg: "#FFFFFF",
  title: "#3B0F2E",
  shadow: "#E9D8F5",
  button: "#E9A6B2",
};

export default function VideoCard({ title, image, onPress, imageScale }) {
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
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          <Pressable
            onPress={onPress}
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={styles.buttonText}>Watch now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20, // space from screen edges
  },

  card: {
    flexDirection: "row",
    backgroundColor: colors.cardBg,
    borderRadius: 28,
    padding: 14,
    boxShadow: `0px 18px 30px rgba(233, 216, 245, 0.35)`,
    elevation: 10,
  },

  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  content: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: "space-between",
  },

  title: {
    fontSize: 22,
    fontFamily: "LatoBold",
    color: colors.title,
    letterSpacing: -0.3,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.button,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    gap: 10,
  },

  buttonText: {
    fontFamily: "LatoBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
