import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryCard from "../../../components/CategoryCard";

const CATEGORIES = [
  { id: "1", name: "Strength", key: "strength" },
  { id: "2", name: "Cardio", key: "cardio" },
  { id: "3", name: "Yoga", key: "yoga" },
  { id: "4", name: "Pilates", key: "pilates" },
  { id: "5", name: "HIIT", key: "hiit" },
  { id: "6", name: "Stretching", key: "stretching" },
  { id: "7", name: "Boxing", key: "boxing" },
  { id: "8", name: "Dance", key: "dance" },
  { id: "9", name: "Meditation", key: "meditation" },
  { id: "10", name: "Cycling", key: "cycling" },
];

export default function VideoCategories({ navigation }) {
  const handleCategoryPress = (category) => {
    navigation.navigate("Video", { category: category.key });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <Text style={styles.subtitle}>Choose your category</Text>
      </View>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CategoryCard
            name={item.name}
            categoryKey={item.key}
            onPress={() => handleCategoryPress(item)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 4,
    fontWeight: "500",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
});
