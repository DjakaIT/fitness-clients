import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../backend/config/firebase";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/Auth/StylesWaitingRoomScreen";
import DeleteAccountSheet from "../../components/DeleteAccountSheet";
import { BRAND } from "../../../backend/config/tenant";
import { SafeAreaView } from "react-native-safe-area-context";

const TRAINING_TYPES = ["online", "in_person"];

export default function WaitingRoomScreen() {
  const { user, status, trainingType, logout } = useAuth();
  const [selecting, setSelecting] = useState(false);
  const [selectError, setSelectError] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const handleSelectTrainingType = async (type) => {
    if (!user?.uid) return;
    setSelecting(true);
    setSelectError(null);
    try {
      await updateDoc(doc(db, "users", user.uid), { trainingType: type });
      // trainingType state updates automatically via onSnapshot in AuthContext
    } catch (e) {
      console.error(e);
      setSelectError("Odabir nije spremljen. Provjeri vezu i pokušaj ponovo.");
    } finally {
      setSelecting(false);
    }
  };

  const isRejected = status === "rejected";
  const needsTrainingType =
    !isRejected && !TRAINING_TYPES.includes(trainingType);
  // The rules keep the type open only while the request is pending, so the
  // option to correct a wrong pick is offered exactly then.
  const canChangeType = status === "pending" && !needsTrainingType;
  const otherType = trainingType === "online" ? "in_person" : "online";
  const firstName = user?.displayName?.split(" ")[0] ?? "";

  return (
    <LinearGradient colors={["#4b0622", "#654b55"]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.brand}>{BRAND.appName}</Text>

          {isRejected ? (
            <>
              <Text style={styles.title}>Zahtjev odbijen</Text>
              <Text style={styles.subtitle}>
                Nažalost, tvoj zahtjev nije odobren.{"\n"}
                Za više informacija javi se trenerici.
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
                Čekamo potvrdu trenerice {BRAND.trainerNameGenitive}.{"\n"}
                Dobit ćeš pristup čim te odobri.{"\n\n"}
                Vrsta treninga:{" "}
                <Text style={styles.highlight}>
                  {trainingType === "online" ? "Online" : "Osobno"}
                </Text>
              </Text>
              {canChangeType && (
                <Pressable
                  style={styles.changeTypeBtn}
                  onPress={() => handleSelectTrainingType(otherType)}
                  disabled={selecting}
                  accessibilityRole="button"
                >
                  <Text style={styles.changeTypeText}>
                    {otherType === "online"
                      ? "Promijeni u online"
                      : "Promijeni u osobno"}
                  </Text>
                </Pressable>
              )}
              <View style={styles.spinnerWrap}>
                <ActivityIndicator size="large" color="#F497BA" />
              </View>
            </>
          )}

          {!!selectError && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {selectError}
            </Text>
          )}

          <View style={styles.bottomActions}>
            <Pressable
              style={styles.logoutBtn}
              onPress={logout}
              accessibilityRole="button"
            >
              <Text style={styles.logoutText}>Odjava</Text>
            </Pressable>
            {/* Signing in created an account; she must be able to remove
                it without ever being approved. */}
            <Pressable
              style={styles.deleteLink}
              onPress={() => setDeleteVisible(true)}
              accessibilityRole="button"
            >
              <Text style={styles.deleteLinkText}>Obriši račun</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
      <DeleteAccountSheet
        visible={deleteVisible}
        onClose={() => setDeleteVisible(false)}
      />
    </LinearGradient>
  );
}
