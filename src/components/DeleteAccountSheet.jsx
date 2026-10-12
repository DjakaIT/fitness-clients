import React, { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { WarningCircleIcon } from "phosphor-react-native";
import AppSheet from "./AppSheet";
import PressableScale from "./PressableScale";
import { useTheme, useThemedStyles } from "../context/ThemeContext";
import { makeSheetStyles } from "../styles/Components/StylesSheet";
import useDeleteAccount from "../hooks/useDeleteAccount";

/**
 * Confirmation for deleting one's own account. Says exactly what goes and
 * what cannot be undone before anything happens; the provider's own sheet
 * (Google / Apple) then asks her to confirm who she is.
 */
export default function DeleteAccountSheet({ visible, onClose }) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeSheetStyles);
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
    <AppSheet
      visible={visible}
      onClose={close}
      dismissible={!isDeleting}
      accessibilityLabel="Obrisati račun?"
    >
      <View style={[styles.iconBubble, styles.iconBubbleDanger]}>
        <WarningCircleIcon size={28} weight="duotone" color={theme.danger} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        Obrisati račun?
      </Text>
      <Text style={styles.body}>
        Trajno se brišu tvoj profil, mjere i slike napretka, upisane kilaže,
        dojmovi i programi.
      </Text>
      <Text style={styles.body}>
        Ovo se ne može poništiti. Za potvrdu ćeš se još jednom prijaviti svojim
        računom.
      </Text>

      {!!error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}

      <View style={styles.btnRow}>
        <PressableScale
          containerStyle={{ flex: 1 }}
          style={[styles.btn, styles.btnGhost]}
          onPress={close}
          disabled={isDeleting}
          accessibilityRole="button"
        >
          <Text style={styles.btnGhostText}>Odustani</Text>
        </PressableScale>
        <PressableScale
          containerStyle={{ flex: 1 }}
          style={[styles.btn, styles.btnDanger, isDeleting && styles.btnBusy]}
          onPress={confirm}
          disabled={isDeleting}
          accessibilityRole="button"
          accessibilityState={{ busy: isDeleting }}
        >
          {isDeleting ? (
            <ActivityIndicator color={styles.btnDangerText.color} />
          ) : (
            <Text style={styles.btnDangerText}>Obriši račun</Text>
          )}
        </PressableScale>
      </View>
    </AppSheet>
  );
}
