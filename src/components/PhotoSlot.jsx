import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { CameraIcon, XIcon } from "phosphor-react-native";
import PressableScale from "./PressableScale";
import { useTheme, useThemedStyles } from "../context/ThemeContext";
import { makeStyles } from "../styles/UI/StylesProgress";
import { photoUri } from "../utils/photoCapture";

/**
 * One of the four guided photo positions. Empty, it shows what to do —
 * the pose hint is on the slot itself, not in a help screen nobody opens.
 */
export default function PhotoSlot({
  angle,
  base64,
  busy = false,
  readOnly = false,
  onAdd,
  onRemove,
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const filled = Boolean(base64);

  return (
    <View style={styles.slot}>
      <PressableScale
        style={[styles.slotFrame, filled && styles.slotFrameFilled]}
        disabled={readOnly || busy}
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel={
          filled
            ? `${angle.label}, slika dodana. Dodirni za zamjenu.`
            : `${angle.label}, dodaj sliku. ${angle.hint}`
        }
      >
        {busy ? (
          <ActivityIndicator color={theme.accent} />
        ) : filled ? (
          <Image
            source={photoUri(base64)}
            style={styles.slotImage}
            contentFit="cover"
            transition={150}
            accessible={false}
          />
        ) : (
          <>
            <CameraIcon size={26} color={theme.accent} />
            <Text style={styles.slotLabel}>{angle.label}</Text>
            <Text style={styles.slotHint}>{angle.hint}</Text>
          </>
        )}
      </PressableScale>

      {filled && !readOnly && (
        <PressableScale
          containerStyle={styles.slotRemove}
          // The circle is on the container; this makes the whole circle the
          // target rather than just the glyph.
          style={{
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Ukloni sliku: ${angle.label}`}
        >
          <XIcon size={16} weight="bold" color="#FFFFFF" />
        </PressableScale>
      )}

      {filled && <Text style={styles.slotCaption}>{angle.label}</Text>}
    </View>
  );
}
