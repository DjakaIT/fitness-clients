import { StyleSheet } from "react-native";

export const makeStyles = (t) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.bg,
    },
    separator: {
      height: 20,
    },
    listContent: {
      paddingTop: 20,
      paddingBottom: 20, // enough space to clear the BottomBar
    },
  });
