import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CategoryCard, {
  CategoryCardSkeleton,
} from "../../../components/CategoryCard";
import useVideos from "../../../hooks/useVideos";
import { makeStyles } from "../../../styles/UI/VideoStyles/StylesVideoCategories";
import { useTheme } from "../../../context/ThemeContext";

// While the catalogue loads, hold the grid's shape with four placeholders so
// the tiles land in place instead of the layout jumping from spinner to grid.
const SKELETON_ROWS = [
  [0, 1],
  [2, 3],
];

export default function VideoCategories({ navigation }) {
  const { categories, loading } = useVideos();
  const { isDark, theme } = useTheme();
  // Built once per theme rather than on every render.
  const styles = useMemo(() => makeStyles(isDark, theme), [isDark, theme]);

  // Group into rows of two so the grid can flex to fill the screen height.
  const rows = useMemo(() => {
    const out = [];
    for (let i = 0; i < categories.length; i += 2) {
      out.push(categories.slice(i, i + 2));
    }
    return out;
  }, [categories]);

  const openCategory = (category) =>
    navigation.navigate("VideoList", { category });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={theme.statusBar} />
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Vježbe
        </Text>
        <Text style={styles.subtitle}>Izaberi odgovarajuću kategoriju</Text>
      </View>

      <View style={styles.grid}>
        {loading && categories.length === 0
          ? SKELETON_ROWS.map((row, ri) => (
              <View style={styles.gridRow} key={`sk-${ri}`}>
                {row.map((k) => (
                  <View key={k} style={{ flex: 1 }}>
                    <CategoryCardSkeleton />
                  </View>
                ))}
              </View>
            ))
          : rows.map((row, ri) => (
              <View style={styles.gridRow} key={`row-${ri}`}>
                {row.map((cat) => (
                  <CategoryCard
                    key={cat}
                    name={cat}
                    categoryKey={cat}
                    onPress={() => openCategory(cat)}
                  />
                ))}
                {row.length === 1 && <View style={styles.cardSpacer} />}
              </View>
            ))}
      </View>
    </SafeAreaView>
  );
}
