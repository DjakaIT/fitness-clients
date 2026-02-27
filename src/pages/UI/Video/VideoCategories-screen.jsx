import React from "react";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryCard from "../../../components/CategoryCard";
import { getCategories } from "../../../../backend/data/videos";
import { styles } from "../../../styles/UI/VideoStyles/StylesVideoCategories";

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
