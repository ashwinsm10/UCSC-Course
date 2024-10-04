import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { DEGREE_API_URL } from "@/types/Types";
import { COLORS } from "@/colors/Colors";
import { useQuery } from "@tanstack/react-query";
import { NavigationProp } from "@react-navigation/native";
const fetchMajors = async () => {
  const response = await fetch(DEGREE_API_URL);
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};
type Props = {
  navigation: NavigationProp<any>;
};

export const MajorRequirementsClassSearch = ({ navigation }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: majors,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["majors"],
    queryFn: fetchMajors,
  });

  useFocusEffect(
    useCallback(() => {
      setSearchTerm("");
      refetch();
    }, [refetch])
  );

  const filteredMajors = majors
    ? majors.filter((major: string) =>
        major.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <TouchableOpacity
        style={styles.majorItem}
        onPress={() => navigation.navigate("MajorPlanner", { degree: item })}
      >
        <Text style={styles.majorText}>{item}</Text>
        <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    ),
    [navigation]
  );

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Error fetching degrees: {error.message}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text style={styles.title}>All Majors</Text>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.gray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by major..."
            placeholderTextColor={COLORS.gray}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <Text>Loading majors...</Text>
          </View>
        ) : filteredMajors.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              No majors found. Try a different search term.
            </Text>
          </View>
        ) : (
          <Animated.FlatList
            data={filteredMajors}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: COLORS.black,
  },
  listContainer: {
    paddingBottom: 20,
  },
  majorItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 4,
    marginTop: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  majorText: {
    fontSize: 16,
    color: COLORS.black,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: COLORS.red,
    textAlign: "center",
  },
});
