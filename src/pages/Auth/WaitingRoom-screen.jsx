import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../backend/config/firebase";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/Auth/StylesWaitingRoomScreen";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WaitingRoomScreen() {
  const { user, status, trainingType, logout } = useAuth();
  const [selecting, setSelecting] = useState(false);

  const handleSelectTrainingType = async (type) => {
    if (!user?.uid) return;
    setSelecting(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { trainingType: type });
      // trainingType state updates automatically via onSnapshot in AuthContext
    } catch (e) {
      console.error(e);
    } finally {
      setSelecting(false);
    }
  };

  const isRejected = status === "rejected";
  const needsTrainingType = !isRejected && trainingType === null;
  const firstName = user?.displayName?.split(" ")[0] ?? "";

  return (
    <LinearGradient colors={["#4b0622", "#654b55"]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.brand}>MARTA FITNESS</Text>

          {isRejected ? (
            <>
              <Text style={styles.title}>Zahtjev odbijen</Text>
              <Text style={styles.subtitle}>
                Nažalost, tvoj zahtjev nije odobren.{"\n"}
                Za više informacija kontaktiraj Martu.
              </Text>
            </>
          ) : needsTrainingType ? (
            <>
              <Text style={styles.title}>
                Dobrodošla,{"\n"}
                {firstName}!
              </Text>
              <Text style={styles.subtitle}>
                Odaberi vrstu treninga koji želiš:
              </Text>
              {selecting ? (
                <ActivityIndicator color="#F497BA" style={{ marginTop: 32 }} />
              ) : (
                <View style={styles.typeRow}>
                  <Pressable
                    style={styles.typeCard}
                    onPress={() => handleSelectTrainingType("online")}
                  >
                    <Text style={styles.typeIcon}>💻</Text>
                    <Text style={styles.typeLabel}>Online</Text>
                  </Pressable>
                  <Pressable
                    style={styles.typeCard}
                    onPress={() => handleSelectTrainingType("in_person")}
                  >
                    <Text style={styles.typeIcon}>🏋️</Text>
                    <Text style={styles.typeLabel}>Osobno</Text>
                  </Pressable>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.title}>Zahtjev poslan!</Text>
              <Text style={styles.subtitle}>
                Čekamo potvrdu trenerice Marte.{"\n"}
                Dobit ćeš pristup čim te odobri.{"\n\n"}
                Vrsta treninga:{" "}
                <Text style={styles.highlight}>
                  {trainingType === "online" ? "Online" : "Osobno"}
                </Text>
              </Text>
              <View style={styles.spinnerWrap}>
                <ActivityIndicator size="large" color="#F497BA" />
              </View>
            </>
          )}

          <Pressable style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Odjava</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
