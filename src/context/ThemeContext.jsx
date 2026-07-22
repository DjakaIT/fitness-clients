import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEMES, darkTheme } from "../styles/clientTheme";

const STORAGE_KEY = "@marta/client-theme";
const DEFAULT_MODE = "dark";

const ThemeContext = createContext({
  mode: DEFAULT_MODE,
  theme: darkTheme,
  isDark: true,
  toggle: () => {},
  setMode: () => {},
});

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(DEFAULT_MODE);

  // Restore saved preference once on mount.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (active && (saved === "light" || saved === "dark")) {
          setModeState(saved);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      mode,
      theme: THEMES[mode] ?? darkTheme,
      isDark: mode === "dark",
      toggle,
      setMode: persist,
    }),
    [mode, toggle, persist],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Memoized themed styles: pass a factory (theme, mode) => StyleSheet.
export function useThemedStyles(factory) {
  const { theme, mode } = useTheme();
  return useMemo(() => factory(theme, mode), [factory, theme, mode]);
}
