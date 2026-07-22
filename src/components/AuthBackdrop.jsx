import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Barbell,
  Heartbeat,
  PersonSimpleRun,
  Sparkle,
  Medal,
  YinYang,
} from "phosphor-react-native";
import JoltIcon from "./JoltIcon";
import { AUTH } from "../styles/authTheme";

// Fixed positions (they sit, they don't drift) with staggered jolt delays.
const SYMBOLS = [
  { Icon: Barbell, size: 44, delay: 0, pos: { top: "8%", left: "8%" } },
  { Icon: PersonSimpleRun, size: 40, delay: 250, pos: { top: "34%", left: "5%" } },
  { Icon: Medal, size: 36, delay: 450, pos: { bottom: "13%", right: "9%" } },
  { Icon: Heartbeat, size: 32, delay: 650, pos: { top: "15%", right: "10%" } },
  { Icon: YinYang, size: 30, delay: 850, pos: { bottom: "20%", left: "11%" } },
  { Icon: Sparkle, size: 24, delay: 1100, pos: { top: "28%", right: "18%" } },
];

// Single shared backdrop for both splash + login so the animated symbols are
// always identical across the two screens.
export default function AuthBackdrop({ children }) {
  return (
    <LinearGradient colors={[AUTH.bgTop, AUTH.bgBottom]} style={{ flex: 1 }}>
      {SYMBOLS.map((s, i) => (
        <View
          key={i}
          style={[{ position: "absolute", opacity: AUTH.symbolOpacity }, s.pos]}
          pointerEvents="none"
        >
          <JoltIcon
            Icon={s.Icon}
            size={s.size}
            color={AUTH.symbol}
            delay={s.delay}
          />
        </View>
      ))}
      {children}
    </LinearGradient>
  );
}
