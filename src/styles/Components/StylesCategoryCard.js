import { StyleSheet } from "react-native";
import abdominalIcon from "../../assets/icons-categories/abdominal.png";
import legIcon from "../../assets/icons-categories/leg.png";
import gluteIcon from "../../assets/icons-categories/gluteus.png";
import lowerWarmupIcon from "../../assets/icons-categories/lower_warmup.png";

export const styles = StyleSheet.create({
  card: {
    width: 150,
    height: 140,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  icon: {
    width: 56,
    height: 56,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
  },
});

export const CATEGORY_CONFIG = {
  "Trbušni mišići": {
    icon: abdominalIcon,
    color: "#6B7280",
    bgColor: "#F3F4F6",
  },
  "Noge": {
    icon: legIcon,
    color: "#6B7280",
    bgColor: "#F3F4F6",
  },
  "Gluteus": {
    icon: gluteIcon,
    color: "#6B7280",
    bgColor: "#F3F4F6",
  },
  "Zagrijavanje": {
    icon: lowerWarmupIcon,
    color: "#6B7280",
    bgColor: "#F3F4F6",
  },
  default: {
    icon: null,
    color: "#6B7280",
    bgColor: "#F3F4F6",
  },
};
