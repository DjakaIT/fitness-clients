import React from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  CaretLeftIcon,
  ChatCircleIcon,
  StarIcon,
  BarbellIcon,
  ForkKnifeIcon,
} from "phosphor-react-native";
import useFetchReviews from "../../hooks/useFetchReviews";
import { styles } from "../../styles/Admin/StylesAdminUserImpressionScreen";
import formatDate from "../../../backend/utils/dateUtil";

const ratingCategories = [
  { key: "training", label: "Trening", icon: BarbellIcon, bg: "#F0E7FF" },
  { key: "eating", label: "Hrana", icon: ForkKnifeIcon, bg: "#FFF7ED" },
  {
    key: "communication",
    label: "Komunikacija",
    icon: ChatCircleIcon,
    bg: "#F0F9FF",
  },
];

function StarRow({ rating }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          size={16}
          color={star <= rating ? "#8B5CF6" : "#D1D5DB"}
          weight={star <= rating ? "fill" : "bold"}
        />
      ))}
    </View>
  );
}

function ReviewCard({ review }) {
  return (
    <View style={styles.reviewCard}>
      <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>

      <View style={styles.ratingsContainer}>
        {ratingCategories.map(({ key, label, icon: Icon, bg }) => (
          <View key={key} style={[styles.ratingRow, { backgroundColor: bg }]}>
            <Icon size={18} color="#111827" weight="bold" />
            <Text style={styles.ratingLabel}>{label}</Text>
            <StarRow rating={review.ratings?.[key] || 0} />
            <Text style={styles.ratingNumber}>
              {review.ratings?.[key] || 0}/5
            </Text>
          </View>
        ))}
      </View>

      {review.reflection ? (
        <View style={styles.reflectionContainer}>
          <Text style={styles.reflectionTitle}>Osvrt</Text>
          <Text style={styles.reflectionText}>{review.reflection}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function AdminUserImpressionScreen({ route }) {
  const { userId, displayName } = route.params;
  const { reviews, isFetching } = useFetchReviews(userId);
  const navigation = useNavigation();
  const firstName = displayName?.split(" ")[0] || "...";

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <CaretLeftIcon color="#000" size={28} weight="bold" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Pregled dojmova koje je ostavila{" "}
          <Text style={styles.subtitleHighlight}>{firstName}</Text>
        </Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Text style={styles.statNumberPrimary}>{reviews.length}</Text>
            <Text style={styles.statLabelPrimary}>UKUPNO DOJMOVA</Text>
          </View>
        </View>

        {reviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {firstName} još nije ostavila nijedan dojam.
            </Text>
          </View>
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ReviewCard review={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
