import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CategoryCard from "../../../components/CategoryCard";
import { getCategories } from "../../../../backend/data/videos";
import { makeStyles } from "../../../styles/UI/VideoStyles/StylesVideoCategories";
import { useTheme } from "../../../context/ThemeContext";

const CATEGORIES = getCategories();

// Group into rows of two so the grid can flex to fill the screen height.
const ROWS = [];
for (let i = 0; i < CATEGORIES.length; i += 2) {
  ROWS.push(CATEGORIES.slice(i, i + 2));
}

export default function VideoCategories({ navigation }) {
  const { isDark, theme } = useTheme();
  const styles = makeStyles(isDark, theme);

  const openCategory = (category) =>
    navigation.navigate("VideoList", { category });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={theme.statusBar} />
      <View style={styles.header}>
        <Text style={styles.title}>Vježbe</Text>
        <Text style={styles.subtitle}>Izaberi odgovarajuću kategoriju</Text>
      </View>

      <View style={styles.grid}>
        {ROWS.map((row, ri) => (
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
