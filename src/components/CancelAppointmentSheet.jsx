import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { WarningCircle, CheckCircle } from "phosphor-react-native";
import { useTheme, useThemedStyles } from "../context/ThemeContext";
import {
  formatDateLong,
  canCancel,
  hoursUntilAppointment,
} from "../../backend/utils/appointmentConfig";

export default function CancelAppointmentSheet({
  visible,
  appointment,
  onClose,
  onConfirm,
  isCancelling,
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  if (!appointment) return null;

  const { appointmentDate, time } = appointment;
  const hours = hoursUntilAppointment(appointmentDate, time);
  const allowed = canCancel(appointmentDate, time);
  const isPast = hours <= 0;

  const hoursLeftLabel =
    hours >= 1
      ? `još ${Math.floor(hours)} h do termina`
      : "termin je vrlo blizu";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>Otkaži termin</Text>

          <View style={styles.apptCard}>
            <Text style={styles.apptDate}>{formatDateLong(appointmentDate)}</Text>
            <Text style={styles.apptTime}>{time}</Text>
          </View>

          {allowed ? (
            <View style={[styles.banner, styles.bannerOk]}>
              <CheckCircle size={22} weight="fill" color={theme.success} />
              <Text style={[styles.bannerText, { color: theme.success }]}>
                Možeš otkazati ovaj termin ({hoursLeftLabel}).
              </Text>
            </View>
          ) : (
            <View style={[styles.banner, styles.bannerWarn]}>
              <WarningCircle size={22} weight="fill" color={theme.danger} />
              <Text style={[styles.bannerText, { color: theme.danger }]}>
                {isPast
                  ? "Ovaj termin je već prošao."
                  : "Termin je za manje od 24 sata. Otkazivanje u aplikaciji nije moguće — javi se trenerici."}
              </Text>
            </View>
          )}

          <View style={styles.btnRow}>
            <Pressable
              style={[styles.btn, styles.btnGhost]}
              onPress={onClose}
              disabled={isCancelling}
            >
              <Text style={styles.btnGhostText}>
                {allowed ? "Zadrži termin" : "U redu"}
              </Text>
            </Pressable>

            {allowed && (
              <Pressable
                style={[styles.btn, styles.btnDanger, isCancelling && styles.btnBusy]}
                onPress={onConfirm}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color={theme.onAccent} />
                ) : (
                  <Text style={styles.btnDangerText}>Otkaži termin</Text>
                )}
              </Pressable>
            )}
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
    title: {
      fontSize: 20,
      fontFamily: "Outfit_700Bold",
      color: t.textPrimary,
      marginBottom: 16,
    },
    apptCard: {
      backgroundColor: t.cardElevated,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 18,
      marginBottom: 16,
    },
    apptDate: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: t.textSecondary,
    },
    apptTime: {
      fontSize: 28,
      fontFamily: "Outfit_700Bold",
      color: t.textPrimary,
      marginTop: 2,
    },
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 14,
      padding: 14,
    },
    bannerOk: { backgroundColor: t.successSoft },
    bannerWarn: { backgroundColor: t.dangerSoft },
    bannerText: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      lineHeight: 19,
    },
    btnRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 22,
    },
    btn: {
      flex: 1,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    btnGhost: {
      backgroundColor: t.cardElevated,
    },
    btnGhostText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: t.textSecondary,
    },
    btnDanger: {
      backgroundColor: t.danger,
    },
    btnDangerText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: t.onAccent,
    },
    btnBusy: { opacity: 0.85 },
  });
