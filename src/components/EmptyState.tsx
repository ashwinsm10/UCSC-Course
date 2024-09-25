import { COLORS } from "@/colors/Colors";
import React from "react";
import {
  Text,
  Dimensions,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
interface EmptyStateProps {
  setAvailabilityFilter?: (value: string) => void; // Optional
  setClassTypeFilter?: (value: string) => void; // Optional
  setSearchQuery?: (value: string) => void; // Optional
}
export const EmptyState: React.FC<EmptyStateProps> = ({
  setAvailabilityFilter,
  setClassTypeFilter,
  setSearchQuery,
}) => {
  const handleClearFilters = () => {
    if (setAvailabilityFilter) setAvailabilityFilter("All");
    if (setClassTypeFilter) setClassTypeFilter("All");
    if (setSearchQuery) setSearchQuery("");
  };

  return (
    <View style={styles.emptycontainer}>
      <Icon
        name="search"
        size={80}
        color={COLORS.primary}
        style={{ marginBottom: 20 }}
      />
      <Text style={styles.title}>No results found</Text>
      <Text style={styles.message}>
        No results match the filter criteria. Clear all filters and try again.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleClearFilters}>
        <Text style={styles.buttonText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  emptycontainer: {
    borderRadius: screenWidth * 0.08,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.secondary,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: "center",
  },
  button: {
    marginBottom: screenHeight * 0.015, // 1.5% of screen height
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
