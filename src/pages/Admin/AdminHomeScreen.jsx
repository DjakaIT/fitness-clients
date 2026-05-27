import React from "react";
import { Text, View, Image, Pressable } from "react-native";
import GeneralButton from "../../components/GeneralButton";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../../styles/Admin/StylesAdminHomeScreen";
import usePendingUsers from "../../hooks/usePendingUsers";

export default function AdminHomeScreen() {
  const navigation = useNavigation();
  const { pendingUsers } = usePendingUsers();
  const hasPending = pendingUsers.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Dobrodošla nazad,{"\n"}
        <Text style={styles.name}>Marta.</Text>
      </Text>

      <View style={styles.imageWrapper}>
        <View style={styles.imageBorder}>
          <Image
            source={require("../../../assets/images/logo.jpeg")}
            style={styles.profileImage}
          />
        </View>
      </View>

      <Text style={styles.brandText}>MARTA FITNESS</Text>

      {hasPending && (
        <Pressable
          style={styles.notificationCard}
          onPress={() => navigation.navigate("AdminUserList")}
        >
          <View style={styles.notificationDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.notificationTitle}>
              {pendingUsers.length === 1
                ? "1 nova prijava"
                : `${pendingUsers.length} novih prijava`}
            </Text>
            <Text style={styles.notificationSub}>
              {pendingUsers[0]?.displayName} čeka odobrenje →
            </Text>
          </View>
        </Pressable>
      )}

      <Text style={styles.description}>
        Iza ovog ekrana stoje{"\n"}djevojke koje s tobom grade{"\n"}bolju
        budućnost, zato je ova{"\n"}aplikacija tu da ti olakša.
      </Text>

      <View style={styles.buttonContainer}>
        <GeneralButton
          onPress={() => navigation.navigate("AdminUserList")}
          colors={["#7C3AED", "#7C3AED"]}
          size="lg"
          fullWidth
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Online klijentice</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </View>
        </GeneralButton>
        <GeneralButton
          onPress={() => navigation.navigate("AdminInPerson")}
          colors={["#7C3AED", "#7C3AED"]}
          size="lg"
          fullWidth
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Uživo klijentice</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </View>
        </GeneralButton>
      </View>
    </View>
  );
}
