import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Star } from "phosphor-react-native";
import { useTheme } from "../context/ThemeContext";

const ImpressionsRatingSystem = ({ rating, setRating }) => {
  const { isDark, theme } = useTheme();
  const activeColor = isDark ? theme.accent : "#8B5CF6";
  const inactiveColor = isDark ? theme.border : "#D1D5DB";

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            activeOpacity={0.7}
          >
            <Star
              size={28}
              color={star <= rating ? activeColor : inactiveColor}
              weight={star <= rating ? "fill" : "bold"}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[styles.ratingText, { color: activeColor }]}>
        {rating}/5
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  starsRow: { flexDirection: "row", gap: 8 },
  ratingText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ImpressionsRatingSystem;
