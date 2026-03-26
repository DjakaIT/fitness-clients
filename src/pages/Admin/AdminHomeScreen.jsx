import React from "react";
import { Text, View, Image, StyleSheet } from "react-native";
import GeneralButton from "../../components/GeneralButton";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../../styles/Admin/StylesAdminHomeScreen";

export default function AdminHomeScreen() {
  const navigation = useNavigation();

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
            <Text style={styles.buttonText}>Tvoje klijentice</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </View>
        </GeneralButton>
      </View>
    </View>
  );
}
