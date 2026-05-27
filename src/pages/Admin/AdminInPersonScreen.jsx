import React from "react";
import { View, Text, FlatList, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import useFetchInPersonUsers from "../../hooks/useFetchInPersonUsers";
import { styles } from "../../styles/Admin/StylesAdminInPersonScreen";

export default function AdminInPersonScreen() {
  const { users, loading } = useFetchInPersonUsers("in_person");

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfilePageComponent />
      <View style={styles.container}>
        <Text style={styles.title}>Uživo klijentice</Text>
        <Text style={styles.subtitle}>
          {users.length === 0
            ? "Trenutno nema klijentica na osobnom treningu."
            : `${users.length} klijentica dolazi osobno`}
        </Text>

        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
