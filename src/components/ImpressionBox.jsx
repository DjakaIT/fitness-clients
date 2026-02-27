import React from "react";
import { View, Text, StyleSheet } from "react-native";
import GeneralButton from "./GeneralButton";
import { styles } from "../styles/Components/StylesImpressionsBox";

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
