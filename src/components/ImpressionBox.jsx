import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import GeneralButton from "./GeneralButton";

export default function ImpressionBox() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.title}>Napiši svoje dojmove od prošlog tjedna</Text>
        <GeneralButton style={styles.generalButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    padding: 20,
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  generalButton: {
    marginTop: 20,
    marginBottom: 20,
    width: 200,
  },
});
