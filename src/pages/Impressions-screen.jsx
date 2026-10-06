import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import {
  Barbell,
  ForkKnife,
  ChatCircle,
  PaperPlaneTilt,
} from "phosphor-react-native";
import ImpressionsRatingCard from "../components/ImpressionRatingCard";
import ImpressionsBox from "../components/ImpressionBox";
import ProfilePageComponent from "../components/ProfilePageComponent";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { usePostReviews } from "../hooks/usePostReviews";
import { isCompleteRatings } from "../../backend/utils/reviews";

// Unrated until she taps a star. Pre-filled stars (this used to start at
// 3/4/5) were sent as her opinion whenever she skipped a category.
const UNRATED = { training: 0, eating: 0, communication: 0 };

// Original (light) palette left untouched; dark aligns to the coral theme.
const palette = (isDark, t) =>
  isDark
    ? {
        bg: t.bg,
        text: t.textPrimary,
        accent: t.accent,
        sub: t.textSecondary,
        onAccent: t.onAccent,
        // dark surfaces replace the light pastel rating-card tints
        cardTraining: t.card,
        cardEating: t.card,
        cardComm: t.card,
      }
    : {
        bg: "#FFF",
        text: "#000",
        accent: "#8B5CF6",
        sub: "#6B7280",
        onAccent: "#FFF",
        cardTraining: "#F0E7FF",
        cardEating: "#FFF7ED",
        cardComm: "#F0F9FF",
      };

const ImpressionsScreen = ({ navigation }) => {
  const [ratings, setRatings] = useState(UNRATED);
  const [reflection, setReflection] = useState("");
  const { user } = useAuth();
  const { isDark, theme } = useTheme();
  const P = palette(isDark, theme);
  const styles = makeStyles(P);

  const { submitReview, isSubmitting } = usePostReviews();

  const firstName = user?.displayName?.split(" ")[0] || "Draga";

  const allRated = isCompleteRatings(ratings);

  const handleSubmitting = async () => {
    if (!allRated || isSubmitting) return;
    const response = await submitReview(
      user.uid,
      user.displayName,
      ratings,
      reflection,
    );

    if (response.success) {
      navigation.goBack();
      setRatings(UNRATED);
      setReflection("");
    } else {
      Alert.alert("Greška", "Došlo je do problema prilikom slanja dojma.");
    }
  };

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          <View style={styles.topRow}>
            <Text style={styles.userName}>{firstName},</Text>
            <ProfilePageComponent />
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>
              kako ti je prošao protekli tjedan?
            </Text>
            <Text style={styles.subMessage}>
              Izdvoji trenutak da skupa sagledamo tvoj dojam.
            </Text>
          </View>

          {/* Cards Section */}
          <ImpressionsRatingCard
            title="Trening"
            subtitle="Volumen, intenzitet i izvedba"
            icon={Barbell}
            backgroundColor={P.cardTraining}
            rating={ratings.training}
            setRating={(v) => setRatings({ ...ratings, training: v })}
          />

          <ImpressionsRatingCard
            title="Hrana"
            subtitle="Nutritivna kvaliteta i vremensko planiranje"
            icon={ForkKnife}
            backgroundColor={P.cardEating}
            rating={ratings.eating}
            setRating={(v) => setRatings({ ...ratings, eating: v })}
          />

          <ImpressionsRatingCard
            title="Komunikacija"
            subtitle="Učestalost i jasnoća"
            icon={ChatCircle}
            backgroundColor={P.cardComm}
            rating={ratings.communication}
            setRating={(v) => setRatings({ ...ratings, communication: v })}
          />

          <ImpressionsBox value={reflection} onChangeText={setReflection} />

          {!allRated && (
            <Text style={styles.hint}>
              Ocijeni sve tri kategorije da možeš poslati dojam.
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.submitBtn,
              (isSubmitting || !allRated) && { opacity: 0.6 },
            ]}
            onPress={handleSubmitting}
            disabled={isSubmitting || !allRated}
            accessibilityRole="button"
            accessibilityState={{ disabled: isSubmitting || !allRated }}
          >
            <PaperPlaneTilt
              color={P.onAccent}
              size={20}
              weight="fill"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.btnText}>
              {isSubmitting ? "Slanje dojma..." : "Pošalji"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const makeStyles = (P) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: P.bg },
    container: { paddingHorizontal: 24, paddingVertical: 10 },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 40,
    },
    titleSection: { marginBottom: 30 },
    userName: { fontSize: 32, fontWeight: "900", color: P.text },
    mainTitle: {
      fontSize: 32,
      color: P.accent,
      fontWeight: "700",
      marginTop: -2,
    },
    subMessage: { fontSize: 15, color: P.sub, marginTop: 10 },
    hint: { fontSize: 13, color: P.sub, textAlign: "center", marginBottom: 4 },
    submitBtn: {
      backgroundColor: P.accent,
      flexDirection: "row",
      padding: 18,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
    },
    btnText: { color: P.onAccent, fontWeight: "800", fontSize: 18 },
  });

export default ImpressionsScreen;
