import React, { useState } from "react";
import { View, Text, Pressable, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../backend/config/firebase";
import { useDeleteClientData } from "../hooks/useDeleteAccount";

const OTHER = {
  online: {
    to: "in_person",
    label: "Prebaci na osobni trening",
    effect:
      "Dobit će rezervaciju termina umjesto programa, videa i dojmova u aplikaciji.",
  },
  in_person: {
    to: "online",
    label: "Prebaci na online",
    effect:
      "Dobit će program, videe i dojmove umjesto rezervacije termina. Njeni nadolazeći termini ostaju u kalendaru — otkaži ih ovdje prije prebacivanja ako ih više ne treba.",
  },
};

/**
 * The trainer's account-level actions for one client, at the bottom of her
 * screen: moving her between online and in-person (once approved, only the
 * trainer can — firestore.rules freeze it for the client), and erasing her
 * data on request. Both move her out of the list this screen came from, so
 * both go back afterwards.
 */
export default function ClientAdminActions({
  userId,
  displayName,
  trainingType,
}) {
  const navigation = useNavigation();
  const { deleteClientData, isDeleting } = useDeleteClientData();
  const [isSwitching, setIsSwitching] = useState(false);
  const busy = isDeleting || isSwitching;
  const name = displayName || "klijentica";
  const switchTo = OTHER[trainingType];

  const confirmSwitch = () =>
    Alert.alert(switchTo.label + "?", `${name}: ${switchTo.effect}`, [
      { text: "Odustani", style: "cancel" },
      {
        text: "Prebaci",
        onPress: async () => {
          setIsSwitching(true);
          try {
            await updateDoc(doc(db, "users", userId), {
              trainingType: switchTo.to,
            });
            navigation.goBack();
          } catch (err) {
            console.error("Error switching training type:", err);
            Alert.alert("Greška", "Promjena nije spremljena. Pokušaj ponovo.");
          } finally {
            setIsSwitching(false);
          }
        },
      },
    ]);

  const confirmDelete = () =>
    Alert.alert(
      "Obrisati sve podatke?",
      `Trajno se brišu profil, termini, mjere i slike, kilaže, dojmovi i programi — ${name}. Ovo se ne može poništiti.\n\nNjen račun za prijavu ostaje dok ga ne obrišeš u Firebase konzoli (Authentication); ako se ponovo prijavi, kreće ispočetka u čekaonici.`,
      [
        { text: "Odustani", style: "cancel" },
        {
          text: "Obriši",
          style: "destructive",
          onPress: async () => {
            const result = await deleteClientData(userId);
            if (result.success) navigation.goBack();
            else
              Alert.alert(
                "Greška",
                "Brisanje nije dovršeno. Provjeri vezu i pokušaj ponovo.",
              );
          },
        },
      ],
    );

  return (
    <View style={s.wrap}>
      <Text style={s.label}>RAČUN</Text>
      {switchTo && (
        <Pressable
          style={[s.btn, busy && s.disabled]}
          onPress={confirmSwitch}
          disabled={busy}
          accessibilityRole="button"
        >
          <Text style={s.btnText}>{switchTo.label}</Text>
        </Pressable>
      )}
      <Pressable
        style={[s.btn, s.dangerBtn, busy && s.disabled]}
        onPress={confirmDelete}
        disabled={busy}
        accessibilityRole="button"
      >
        <Text style={s.dangerText}>
          {isDeleting ? "Brišem…" : "Obriši klijenticu i sve podatke"}
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 32 },
  label: {
    fontSize: 12,
    letterSpacing: 0.6,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    marginBottom: 12,
  },
  btn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  btnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
  },
  dangerBtn: {
    borderColor: "rgba(239, 68, 68, 0.25)",
    backgroundColor: "rgba(239, 68, 68, 0.06)",
  },
  dangerText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#DC2626",
  },
  disabled: { opacity: 0.5 },
});
