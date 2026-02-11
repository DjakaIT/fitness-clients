import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";

const CATEGORY_CONFIG = {
  strength: { icon: "🏋️", color: "#FF6B6B", bgColor: "#FFF0F0" },
  cardio: { icon: "🏃", color: "#4ECDC4", bgColor: "#E8FAF8" },
  yoga: { icon: "🧘", color: "#A78BFA", bgColor: "#F3F0FF" },
  pilates: { icon: "🤸", color: "#F59E0B", bgColor: "#FFF8E7" },
  hiit: { icon: "⚡", color: "#EF4444", bgColor: "#FEF2F2" },
  stretching: { icon: "🙆", color: "#10B981", bgColor: "#ECFDF5" },
  boxing: { icon: "🥊", color: "#F97316", bgColor: "#FFF7ED" },
  dance: { icon: "💃", color: "#EC4899", bgColor: "#FDF2F8" },
  meditation: { icon: "🧠", color: "#6366F1", bgColor: "#EEF2FF" },
  cycling: { icon: "🚴", color: "#0EA5E9", bgColor: "#F0F9FF" },
  default: { icon: "🔥", color: "#6B7280", bgColor: "#F3F4F6" },
};

export default function CategoryCard({ name, categoryKey, onPress }) {
  const config =
    CATEGORY_CONFIG[categoryKey?.toLowerCase()] || CATEGORY_CONFIG.default;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: config.bgColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>
      <Text style={[styles.name, { color: "#1F2937" }]} numberOfLines={1}>
        {name}
      </Text>
      <View style={[styles.accent, { backgroundColor: config.color }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  icon: {
    fontSize: 28,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  accent: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginTop: 12,
  },
});
