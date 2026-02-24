import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useGoogleAuth } from "../../hooks/auth/useGoogleAuth";

export default function LoginScreen() {
  const { signIn, loading } = useGoogleAuth();

  return (
    <LinearGradient colors={["#654b55", "#4b0622"]} style={styles.background}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brand}>Marta Fitness</Text>
            <Text style={styles.title}>Dobrodošla!</Text>
            <Text style={styles.subtitle}>
              Prijavi se sa Google računom da nastaviš
            </Text>
          </View>

          {/* Google Sign-In Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={signIn}
              disabled={loading}
              style={[styles.googleButton, loading && styles.buttonDisabled]}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#4285F4" />
              ) : (
                <>
                  <Image
                    source={{
                      uri: "https://developers.google.com/identity/images/g-logo.png",
                    }}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleButtonText}>
                    Nastavi s Google računom
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Prijavom prihvaćaš uvjete korištenja
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 48,
    alignItems: "center",
  },
  brand: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F497BA",
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#DBC1C9",
    textAlign: "center",
  },
  buttonContainer: {
    alignItems: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: "100%",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#DBC1C9",
    opacity: 0.6,
  },
});
