import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryCard from "../../../components/CategoryCard";
import { getCategories } from "../../../../backend/data/videos";

const CATEGORIES = getCategories();

export default function VideoCategories({ navigation }) {
  const handleCategoryPress = (category) => {
    navigation.navigate("VideoList", { category: category });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vježbe</Text>
        <Text style={styles.subtitle}>Izaberi odgovarajuću kategoriju</Text>
      </View>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item}
        columnWrapperStyle={styles.row}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CategoryCard
            name={item}
            categoryKey={item}
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
