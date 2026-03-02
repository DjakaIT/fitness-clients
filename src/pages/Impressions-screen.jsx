import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import {
  CaretLeft,
  Barbell,
  ForkKnife,
  ChatCircle,
  PaperPlaneTilt,
} from "phosphor-react-native";
import ImpressionsRatingCard from "../components/ImpressionRatingCard";
import ImpressionsBox from "../components/ImpressionBox";
import ProfilePageComponent from "../components/ProfilePageComponent";
import { useAuth } from "../context/AuthContext";

const ImpressionsScreen = ({ navigation }) => {
  const [ratings, setRatings] = useState({ training: 4, eating: 3, comms: 5 });
  const [reflection, setReflection] = useState("");
  const { user } = useAuth();

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
          {/* Header Navigation */}
          <View style={styles.navBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <CaretLeft color="#000" size={28} weight="bold" />
            </TouchableOpacity>
            <ProfilePageComponent />
          </View>

          {/* Hero Text */}
          <View style={styles.titleSection}>
            <Text style={styles.userName}>
              {user?.displayName?.split(" ")[0] || userData.name},
            </Text>
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
            backgroundColor="#F0E7FF"
            rating={ratings.training}
            setRating={(v) => setRatings({ ...ratings, training: v })}
          />

          <ImpressionsRatingCard
            title="Hrana"
            subtitle="Nutritivna kvaliteta i vremensko planiranje"
            icon={ForkKnife}
            backgroundColor="#FFF7ED"
            rating={ratings.eating}
            setRating={(v) => setRatings({ ...ratings, eating: v })}
          />

          <ImpressionsRatingCard
            title="Komunikacija"
            subtitle="Učestalost i jasnoća"
            icon={ChatCircle}
            backgroundColor="#F0F9FF"
            rating={ratings.comms}
            setRating={(v) => setRatings({ ...ratings, comms: v })}
          />

          <ImpressionsBox value={reflection} onChangeText={setReflection} />

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitBtn}>
            <PaperPlaneTilt
              color="#FFF"
              size={20}
              weight="fill"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.btnText}>Pošalji</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  container: { paddingHorizontal: 24, paddingVertical: 10 },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#10B981",
  }, // Green dot indicator
  titleSection: { marginBottom: 30 },
  userName: { fontSize: 32, fontWeight: "900", color: "#000" },
  mainTitle: {
    fontSize: 32,
    color: "#8B5CF6",
    fontWeight: "700",
    marginTop: -4,
  },
  subMessage: { fontSize: 15, color: "#6B7280", marginTop: 10 },
  submitBtn: {
    backgroundColor: "#8B5CF6",
    flexDirection: "row",
    padding: 18,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#FFF", fontWeight: "800", fontSize: 18 },
  footerText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 20,
    letterSpacing: 1,
  },
});

export default ImpressionsScreen;
