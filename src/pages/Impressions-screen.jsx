import ImpressionBox from "../components/ImpressionBox";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../styles/StylesImpressionsScreen";

export default function ImpressionsScreen() {
  return (
    <LinearGradient
      colors={["#667eea", "#764ba2", "#f093fb"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <View>
        <ImpressionBox />
      </View>
    </LinearGradient>
  );
}
