import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CategoryCard from "../../../components/CategoryCard";
import useVideos from "../../../hooks/useVideos";
import { makeStyles } from "../../../styles/UI/VideoStyles/StylesVideoCategories";
import { useTheme } from "../../../context/ThemeContext";

export default function VideoCategories({ navigation }) {
  const { categories, loading } = useVideos();
  const { isDark, theme } = useTheme();
  const styles = makeStyles(isDark, theme);

  // Group into rows of two so the grid can flex to fill the screen height.
  const rows = [];
  for (let i = 0; i < categories.length; i += 2) {
    rows.push(categories.slice(i, i + 2));
  }

  const openCategory = (category) =>
    navigation.navigate("VideoList", { category });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={theme.statusBar} />
      <View style={styles.header}>
        <Text style={styles.title}>Vježbe</Text>
        <Text style={styles.subtitle}>Izaberi odgovarajuću kategoriju</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.accent}
          style={{ marginTop: 40 }}
        />
      ) : (
        <View style={styles.grid}>
          {rows.map((row, ri) => (
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
      )}
    </SafeAreaView>
  );
}
