import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  CaretLeftIcon,
  CaretRightIcon,
  PlusIcon,
  CameraIcon,
  RulerIcon,
} from "phosphor-react-native";
import { useAuth } from "../../../context/AuthContext";
import { useTheme, useThemedStyles } from "../../../context/ThemeContext";
import useClientMeasurements from "../../../hooks/useClientMeasurements";
import PressableScale from "../../../components/PressableScale";
import Skeleton from "../../../components/Skeleton";
import {
  formatDateLong,
  formatDateShort,
  toLocalDateString,
} from "../../../../backend/utils/appointmentConfig";
import { MEASUREMENT_FIELDS } from "../../../../backend/utils/progress";
import { makeStyles } from "../../../styles/UI/StylesProgress";

const filled = (entry) => MEASUREMENT_FIELDS.filter((f) => entry[f.key]);
const photoCount = (entry) =>
  Array.isArray(entry.photoAngles) ? entry.photoAngles.length : 0;

export default function ProgressScreen({ navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { measurements, loading } = useClientMeasurements(user?.uid);

  const latest = measurements[0];
  const history = measurements.slice(1);
  const open = (date) => navigation.navigate("CheckIn", { date });

  return (
    <View style={styles.screen}>
      <StatusBar style={theme.statusBar} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <PressableScale
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Natrag"
            hitSlop={10}
          >
            <CaretLeftIcon size={20} color={theme.textPrimary} />
          </PressableScale>

          <Text style={styles.title} accessibilityRole="header">
            Moj napredak
          </Text>
          <Text style={styles.subtitle}>
            Mjere i slike vidite samo ti i trenerica.
          </Text>

          <PressableScale
            style={styles.primaryBtn}
            onPress={() => open(toLocalDateString())}
            accessibilityRole="button"
          >
            <PlusIcon size={20} weight="bold" color={theme.onAccent} />
            <Text style={styles.primaryBtnText}>Novi unos</Text>
          </PressableScale>

          {loading ? (
            <View style={{ marginTop: 24, gap: 12 }}>
              <Skeleton style={{ height: 150 }} radius={22} />
              <Skeleton style={{ height: 70 }} radius={16} />
              <Skeleton style={{ height: 70 }} radius={16} />
            </View>
          ) : !latest ? (
            <View style={styles.emptyCard}>
              <RulerIcon size={36} weight="duotone" color={theme.accent} />
              <Text style={styles.emptyTitle}>Još nema unosa</Text>
              <Text style={styles.emptyText}>
                Upiši mjere i dodaj slike. Svaki idući unos pokazuje koliko si
                napredovala.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Najnovije</Text>
              <PressableScale
                style={styles.card}
                onPress={() => open(latest.date)}
                accessibilityRole="button"
                accessibilityLabel={`Unos ${formatDateLong(latest.date)}, otvori`}
              >
                <Text style={styles.cardDate}>
                  {formatDateLong(latest.date)}
                </Text>
                {filled(latest).length > 0 && (
                  <View style={styles.tileGrid}>
                    {filled(latest).map((f) => (
                      <View key={f.key} style={styles.tile}>
                        <Text style={styles.tileLabel}>{f.label}</Text>
                        <Text style={styles.tileValue}>
                          {latest[f.key]}
                          <Text style={styles.tileUnit}> {f.unit}</Text>
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                {photoCount(latest) > 0 && (
                  <View style={[styles.photoCount, { marginTop: 12 }]}>
                    <CameraIcon size={14} color={theme.accent} />
                    <Text style={styles.photoCountText}>
                      {photoCount(latest)} / 4 slike
                    </Text>
                  </View>
                )}
              </PressableScale>

              {history.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Povijest</Text>
                  {history.map((entry) => (
                    <PressableScale
                      key={entry.id}
                      style={styles.historyRow}
                      onPress={() => open(entry.date)}
                      accessibilityRole="button"
                      accessibilityLabel={`Unos ${formatDateLong(entry.date)}, otvori`}
                    >
                      <View style={styles.historyBody}>
                        <Text style={styles.historyDate}>
                          {formatDateShort(entry.date)}
                        </Text>
                        <View style={styles.chips}>
                          {filled(entry).map((f) => (
                            <View key={f.key} style={styles.chip}>
                              <Text style={styles.chipText}>
                                {f.label} {entry[f.key]}
                              </Text>
                            </View>
                          ))}
                          {photoCount(entry) > 0 && (
                            <View style={[styles.chip, styles.photoCount]}>
                              <CameraIcon size={12} color={theme.accent} />
                              <Text style={styles.photoCountText}>
                                {photoCount(entry)}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <CaretRightIcon size={16} color={theme.textTertiary} />
                    </PressableScale>
                  ))}
                </>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
