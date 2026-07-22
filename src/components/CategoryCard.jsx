import React from "react";
import { TouchableOpacity, Text, View, Image } from "react-native";
import { makeStyles } from "../styles/Components/StylesCategoryCard";
import { CATEGORY_CONFIG } from "../utils/categoryConfig";
import { useThemedStyles } from "../context/ThemeContext";

export default function CategoryCard({ name, categoryKey, onPress }) {
  const config = CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG.default;
  const styles = useThemedStyles(makeStyles);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {config.icon ? (
        <View style={styles.imageWrap}>
          <Image source={config.icon} style={styles.image} resizeMode="cover" />
        </View>
      ) : (
        <View style={styles.fallbackImage}>
          <Text style={styles.fallbackGlyph}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.labelWrap}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.caption} numberOfLines={1}>
          Pogledaj vježbe
        </Text>
      </View>
    </TouchableOpacity>
  );
}
