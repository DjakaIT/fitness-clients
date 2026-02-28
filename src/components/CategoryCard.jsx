import React from "react";
import { TouchableOpacity, Text, View, Image } from "react-native";
import { styles } from "../styles/Components/StylesCategoryCard";
import { CATEGORY_CONFIG } from "../utils/categoryConfig";

export default function CategoryCard({ name, categoryKey, onPress }) {
  const config = CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG.default;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: config.bgColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
        {config.icon && (
          <Image
            source={config.icon}
            style={styles.icon}
            resizeMode="contain"
          />
        )}
      </View>
      <Text style={[styles.name, { color: "#1F2937" }]} numberOfLines={1}>
        {name}
      </Text>
      <View style={[styles.accent, { backgroundColor: config.color }]} />
    </TouchableOpacity>
  );
}
