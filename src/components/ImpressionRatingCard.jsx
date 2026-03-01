import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ImpressionsRatingSystem from "./impressionRatingSystem";

const ImpressionsRatingCard = ({
  title,
  subtitle,
  icon: Icon,
  backgroundColor,
  rating,
  setRating,
}) => {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon color="#000" size={22} weight="bold" />
        </View>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <ImpressionsRatingSystem rating={rating} setRating={setRating} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 20, marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconContainer: { backgroundColor: "#FFF", padding: 10, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: "bold", color: "#000" },
  subtitle: { fontSize: 13, color: "#666" },
});

export default ImpressionsRatingCard;
