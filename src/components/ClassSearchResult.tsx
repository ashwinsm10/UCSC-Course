import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../colors/Colors";
import { Class } from "../types/Types";
import * as Clipboard from "expo-clipboard";
import {
  fetchClassesBySubjectAndNumber,
  fetchClassesByTitle,
} from "./GetClassSearchData";
import { FilterBottomSheet } from "./FilterBottomSheet";
import { CourseList } from "./CourseList";

export const ClassSearchResult = ({ route, navigation }) => {
  const { search } = route.params;
  const [totalCourses, setTotalCourses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("All");
  const [classTypeFilter, setClassTypeFilter] = useState<string>("All");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const quarter = "2248";
      let data: Class[] = [];

      if (search.includes(" ")) {
        const [subject, number] = search.split(" ");
        data = await fetchClassesBySubjectAndNumber(subject.toUpperCase(), number.toUpperCase(), quarter);
      } else {
        data = await fetchClassesByTitle(search, quarter);
      }

      setCourses(data);
      setTotalCourses(data);
    } catch {
      setError("Failed to load classes.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLastUpdate = () => {
    try {
      const currentTime = new Date().toLocaleString();
      setLastUpdate(currentTime);
    } catch (err) {
      console.error("Error setting last update time:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    await fetchLastUpdate();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCourses();
    fetchLastUpdate();
  }, [search, availabilityFilter, classTypeFilter]);

  useEffect(() => {
    let filteredCourses = totalCourses;

    filteredCourses = filteredCourses.map((course) => {
      if (course.location === "Online") {
        if (course.start_time === "TBA") {
          return { ...course, class_type: "Asynchronous Online" };
        } else {
          return { ...course, class_type: "Synchronous Online" };
        }
      } else {
        return { ...course, class_type: "In Person" };
      }
    });

    if (availabilityFilter !== "All") {
      filteredCourses = filteredCourses.filter((course) => {
        const total = parseInt(course.enrl_capacity, 10);
        const current = parseInt(course.enrl_total, 10);
        const available = total - current;

        if (available <= 0) return false;
        if (availabilityFilter === "Low" && available < 10) return true;
        if (availabilityFilter === "Medium" && available >= 10 && available < 25) return true;
        if (availabilityFilter === "High" && available >= 25) return true;

        return false;
      });
    }

    if (classTypeFilter !== "All") {
      filteredCourses = filteredCourses.filter((course) => course.class_type === classTypeFilter);
    }

    if (searchQuery) {
      filteredCourses = filteredCourses.filter((course) =>
        [course.code, course.name, course.instructor, course.schedule, course.location].some((field) =>
          field.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setCourses(filteredCourses);
  }, [availabilityFilter, classTypeFilter, totalCourses, searchQuery]);

 

  

  const getHashColor = (enrl_total: string, enrl_capacity: string) => {
    const current = parseInt(enrl_total, 10);
    const total = parseInt(enrl_capacity, 10);

    if (total > 0) {
      const remaining = total - current;
      if (remaining < 10) return COLORS.red;
      else if (remaining < 25) return COLORS.orange;
      return COLORS.green;
    }

    return COLORS.gray;
  };

  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateText}>No courses available :(</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="filter" size={24} color="black" style={styles.filterIcon} />
        </TouchableOpacity>
        <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search anything..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.lastUpdated}>{`Last Updated: ${lastUpdate}`}</Text>

      <CourseList
        courses={courses}
        getHashColor={getHashColor}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        EmptyState={EmptyState}
      />

      <TouchableOpacity
        style={styles.myButton}
        onPress={() =>
          navigation.navigate("WebViewScreen", {
            url: "https://my.ucsc.edu/",
            search: "MyUCSC",
          })
        }
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.myButtonText}>Go to MyUCSC</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </View>
      </TouchableOpacity>

      {modalVisible && (
        <FilterBottomSheet
          onClose={() => setModalVisible(false)}
          availabilityFilter={availabilityFilter}
          setAvailabilityFilter={setAvailabilityFilter}
          classTypeFilter={classTypeFilter}
          setClassTypeFilter={setClassTypeFilter}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EDEB",
    borderRadius: 10,
    margin: 10,
    paddingHorizontal: 10,
  },
  filterIcon: {
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  lastUpdated: {
    marginLeft: 15,
    color: "gray",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.white,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.gray,
  },
  myButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "green",
    padding: 15,
    alignItems: "center",
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  myButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },
});

export default ClassSearchResult;