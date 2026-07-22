import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ImpressionsRatingSystem from "./impressionRatingSystem";
import { useTheme } from "../context/ThemeContext";

const ImpressionsRatingCard = ({
  title,
  subtitle,
  icon: Icon,
  backgroundColor,
  rating,
  setRating,
}) => {
  const { isDark, theme } = useTheme();

  // Light: original look (pastel bg, white icon chip, black text).
  // Dark: aligned to the coral theme (dark card + accent icon chip).
  const iconBg = isDark ? theme.accentSoft : "#FFF";
  const iconColor = isDark ? theme.accent : "#000";
  const titleColor = isDark ? theme.textPrimary : "#000";
  const subColor = isDark ? theme.textSecondary : "#666";
  const cardBorder = isDark
    ? { borderWidth: 1, borderColor: theme.borderSoft }
    : null;

  return (
    <View style={[styles.card, { backgroundColor }, cardBorder]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Icon color={iconColor} size={22} weight="bold" />
        </View>
        <View>
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: subColor }]}>{subtitle}</Text>
        </View>
      </View>
      <ImpressionsRatingSystem rating={rating} setRating={setRating} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 20, marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconContainer: { padding: 10, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: "bold" },
  subtitle: { fontSize: 13 },
});

export default ImpressionsRatingCard;
