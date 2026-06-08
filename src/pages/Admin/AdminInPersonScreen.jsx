import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import useFetchInPersonUsers from "../../hooks/useFetchInPersonUsers";
import { styles } from "../../styles/Admin/StylesAdminInPersonScreen";
import GeneralButton from "../../components/GeneralButton";

export default function AdminInPersonScreen() {
  const { users, loading } = useFetchInPersonUsers();
  const navigation = useNavigation();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate("AdminClientSchedule", {
          userId: item.id,
          displayName: item.displayName,
        })
      }
    >
      {item.photoURL ? (
        <Image source={{ uri: item.photoURL }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>
            {item.displayName?.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{item.displayName}</Text>
        <Text style={styles.meta}>🏋️ Osobni trening</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfilePageComponent />
      <View style={styles.container}>
        <Text style={styles.title}>Uživo klijentice</Text>
        <Text style={styles.subtitle}>
          {users.length === 0
            ? "Trenutno nema klijentica na osobnom treningu."
            : `${users.length} klijentic${users.length === 1 ? "a" : "e"} dolazi osobno`}
        </Text>

        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.actionsRow}>
          <GeneralButton
            size="sm"
            style={styles.actionButton}
            colors={["#7C3AED", "#7C3AED"]}
            onPress={() => navigation.navigate("AdminTrainerTime")}
          >
            Uredi vrijeme
          </GeneralButton>

          <GeneralButton
            size="sm"
            style={styles.actionButton}
            colors={["#111827", "#111827"]}
            onPress={() => navigation.navigate("AdminTrainerSavedTime")}
          >
            Prikaži vrijeme
          </GeneralButton>
        </View>
      </View>
    </SafeAreaView>
  );
}
