import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

// A background symbol that stays put and periodically "jolts" — a quick
// scale-up + rotate that springs back, then rests. Stagger via `delay`.
export default function JoltIcon({
  Icon,
  size,
  color,
  weight = "duotone",
  delay = 0,
  interval = 1900,
}) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration: 130,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(v, {
          toValue: 0,
          damping: 4.5,
          stiffness: 320,
          mass: 0.5,
          useNativeDriver: true,
        }),
        Animated.delay(interval),
      ]),
    );
    const t = setTimeout(() => anim.start(), delay);
    return () => {
      clearTimeout(t);
      anim.stop();
    };
  }, [v, delay, interval]);

  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "9deg"] });

  return (
    <Animated.View
      style={{ transform: [{ scale }, { rotate }] }}
      pointerEvents="none"
    >
      <Icon size={size} color={color} weight={weight} />
    </Animated.View>
  );
}
