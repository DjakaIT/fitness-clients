import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Star } from "phosphor-react-native";

const ImpressionsRatingSystem = ({ rating, setRating }) => {
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
              color={star <= rating ? "#8B5CF6" : "#D1D5DB"}
              weight={star <= rating ? "fill" : "bold"}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingText}>{rating}/5</Text>
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
    color: "#8B5CF6",
  },
});

export default ImpressionsRatingSystem;
