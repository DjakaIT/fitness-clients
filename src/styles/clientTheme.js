// Client-facing theme system — one accent (feminine rose), light + dark variants.
// Both objects share identical keys so any themed StyleSheet factory can consume
// either without conditionals. Warm rose/blush/plum tone — soft and feminine.

export const darkTheme = {
  mode: "dark",
  statusBar: "light",

  // Surfaces — warm near-black plum instead of neutral grey
  bg: "#161114",
  card: "#201A1E",
  cardElevated: "#292229",
  border: "#342C33",
  borderSoft: "#2B242A",

  // Accent (single) — soft blush rose, calm on dark
  accent: "#ED9CB8",
  accentSoft: "rgba(237, 156, 184, 0.13)",
  accentBorder: "rgba(237, 156, 184, 0.32)",
  onAccent: "#1E1218",

  // Text — warm whites / mauve-greys
  textPrimary: "#FCF6F9",
  textSecondary: "#AE9EA8",
  textTertiary: "#7C6B75",

  // Semantic
  success: "#5FD39B",
  successSoft: "rgba(95, 211, 155, 0.13)",
  danger: "#F0899A",
  dangerSoft: "rgba(240, 137, 154, 0.13)",

  // Overlays
  overlay: "rgba(10, 6, 9, 0.72)",
  inputBg: "#292229",

  // Shadow fragments (spread into styles)
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  accentShadow: {
    shadowColor: "#ED9CB8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const lightTheme = {
  mode: "light",
  statusBar: "dark",

  // Surfaces — warm blush white instead of cool grey
  bg: "#FBF5F7",
  card: "#FFFFFF",
  cardElevated: "#F8EEF2",
  border: "#F0E3EA",
  borderSoft: "#F5EAEF",

  // Accent (single) — deeper rose for contrast on light surfaces
  accent: "#D6497E",
  accentSoft: "rgba(214, 73, 126, 0.10)",
  accentBorder: "rgba(214, 73, 126, 0.28)",
  onAccent: "#FFFFFF",

  // Text — warm plum-black / mauve-greys
  textPrimary: "#2B1F26",
  textSecondary: "#8B7580",
  textTertiary: "#B7A6AE",

  // Semantic
  success: "#159A63",
  successSoft: "rgba(21, 154, 99, 0.10)",
  danger: "#D63A57",
  dangerSoft: "rgba(214, 58, 87, 0.09)",

  // Overlays
  overlay: "rgba(43, 31, 38, 0.35)",
  inputBg: "#FAF3F6",

  // Shadow fragments (spread into styles)
  cardShadow: {
    shadowColor: "#C99AB0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 2,
  },
  accentShadow: {
    shadowColor: "#D6497E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const THEMES = { dark: darkTheme, light: lightTheme };

// Back-compat alias — dark was the original single export.
export const dark = darkTheme;

export const radius = {
  hero: 28,
  card: 22,
  chip: 16,
  pill: 999,
};

// 8pt grid
export const space = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
};
