import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";

import { House, VideoCamera, User } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY = "#6366F1";
const INACTIVE = "#94A3B8";
const BACKGROUND = "#FFFFFF";

const TabItem = ({ label, Icon, isActive, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(isActive ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isActive ? 1.1 : 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isActive ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.tab} onPress={onPress}>
      <Animated.View
        style={{
          transform: [{ scale }],
          opacity,
          alignItems: "center",
        }}
      >
        <Icon
          size={24}
          weight={isActive ? "fill" : "regular"}
          color={isActive ? PRIMARY : INACTIVE}
        />
        <Text style={[styles.label, { color: isActive ? PRIMARY : INACTIVE }]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const BottomBar = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  const tabConfig = {
    Home: { label: "Home", Icon: House },
    VideoCategories: { label: "Videos", Icon: VideoCamera },
    Impressions: { label: "Impressions", Icon: User },
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 16 }]}>
      {state.routes.map((route, index) => {
        const config = tabConfig[route.name];
        if (!config) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            label={config.label}
            Icon={config.Icon}
            isActive={isFocused}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
};

export default BottomBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: BACKGROUND,
    paddingTop: 14,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 20,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
