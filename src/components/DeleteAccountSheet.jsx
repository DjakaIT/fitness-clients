import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { WarningCircleIcon } from "phosphor-react-native";
import { useTheme, useThemedStyles } from "../context/ThemeContext";
import useDeleteAccount from "../hooks/useDeleteAccount";

/**
 * Confirmation for deleting one's own account. Says exactly what goes and
 * what cannot be undone before anything happens; the provider's own sheet
 * (Google / Apple) then asks her to confirm who she is.
 */
export default function DeleteAccountSheet({ visible, onClose }) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { deleteAccount, isDeleting } = useDeleteAccount();
  const [error, setError] = useState(null);

  const close = () => {
    if (isDeleting) return;
    setError(null);
    onClose();
  };

  const confirm = async () => {
    setError(null);
    const result = await deleteAccount();
    // On success the session ends and the app returns to the login screen
    // on its own; a cancelled provider sheet just leaves this one open.
    if (!result.success && !result.cancelled) {
      setError(result.error ?? "Brisanje nije uspjelo. Pokušaj ponovo.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <WarningCircleIcon size={24} weight="fill" color={theme.danger} />
            <Text style={styles.title} accessibilityRole="header">
              Obrisati račun?
            </Text>
          </View>

          <Text style={styles.body}>
            Trajno se brišu tvoj profil, mjere i slike napretka, upisane kilaže,
            dojmovi i programi. Nadolazeći termini se otkazuju — osim onih za
            manje od 24 sata, za njih se javi trenerici.
          </Text>
          <Text style={styles.body}>
            Ovo se ne može poništiti. Za potvrdu ćeš se još jednom prijaviti
            svojim računom.
          </Text>

          {!!error && (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          )}

          <View style={styles.btnRow}>
            <Pressable
              style={[styles.btn, styles.btnGhost]}
              onPress={close}
              disabled={isDeleting}
              accessibilityRole="button"
            >
              <Text style={styles.btnGhostText}>Odustani</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnDanger, isDeleting && styles.busy]}
              onPress={confirm}
              disabled={isDeleting}
              accessibilityRole="button"
              accessibilityState={{ busy: isDeleting }}
            >
              {isDeleting ? (
                <ActivityIndicator color={theme.onAccent} />
              ) : (
                <Text style={styles.btnDangerText}>Obriši račun</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: t.overlay,
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: t.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderColor: t.borderSoft,
      paddingHorizontal: 22,
      paddingTop: 12,
      paddingBottom: 34,
    },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: t.border,
      marginBottom: 18,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 14,
    },
    title: {
      fontSize: 20,
      fontFamily: "Outfit_700Bold",
      color: t.textPrimary,
    },
    body: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: t.textSecondary,
      lineHeight: 21,
      marginBottom: 10,
    },
    error: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: t.danger,
      marginTop: 4,
    },
    btnRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 18,
    },
    btn: {
      flex: 1,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    btnGhost: { backgroundColor: t.cardElevated },
    btnGhostText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: t.textSecondary,
    },
    btnDanger: { backgroundColor: t.danger },
    btnDangerText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: t.onAccent,
    },
    busy: { opacity: 0.85 },
  });
