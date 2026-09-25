import React, { memo } from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import PressableScale from "./PressableScale";
import Skeleton from "./Skeleton";
import { makeStyles } from "../styles/Components/StylesCategoryCard";
import { CATEGORY_CONFIG } from "../utils/categoryConfig";
import { useThemedStyles } from "../context/ThemeContext";

/**
 * A category tile. Responds on press-down with a critically damped scale,
 * like every other tappable surface, instead of the opacity flash of
 * TouchableOpacity. Visual design is unchanged.
 */
function CategoryCard({ name, categoryKey, onPress }) {
  const config = CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG.default;
  const styles = useThemedStyles(makeStyles);

  return (
    <PressableScale
      containerStyle={{ flex: 1 }}
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, pogledaj vježbe`}
    >
      {config.icon ? (
        <View style={styles.imageWrap}>
          <Image
            source={config.icon}
            style={styles.image}
            contentFit="cover"
            accessible={false}
          />
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
    </PressableScale>
  );
}

export default memo(CategoryCard);

export function CategoryCardSkeleton() {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.card}>
      <Skeleton style={{ flex: 1 }} radius={16} />
      <View style={styles.labelWrap}>
        <Skeleton style={{ height: 16, width: "70%" }} radius={6} />
        <Skeleton
          style={{ height: 12, width: "45%", marginTop: 6 }}
          radius={6}
        />
      </View>
    </View>
  );
}
