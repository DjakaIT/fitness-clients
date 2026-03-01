import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { PencilSimple } from "phosphor-react-native";

const ImpressionsBox = ({ value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <PencilSimple size={20} color="#8B5CF6" weight="bold" />
        <Text style={styles.label}>Osvrt</Text>
      </View>
      <Text style={styles.hint}>
        Što bi <Text style={{ fontWeight: "bold" }}>promijenila</Text>, ostavila{" "}
        <Text style={{ fontWeight: "bold" }}>kao i do sada</Text>,{" "}
        <Text style={{ fontWeight: "bold" }}>poboljšala</Text>?
      </Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="U proteklom tjednu sam..."
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 24, paddingBottom: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 17, fontWeight: "bold" },

  hint: { fontSize: 14, color: "#4B5563", marginTop: 10, lineHeight: 20 },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    height: 120,
    marginTop: 12,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 15,
  },
});

export default ImpressionsBox;
