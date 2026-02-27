import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useGoogleAuth } from "../../hooks/auth/useGoogleAuth";
import { styles } from "../../styles/Auth/StylesLoginScreen";

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
