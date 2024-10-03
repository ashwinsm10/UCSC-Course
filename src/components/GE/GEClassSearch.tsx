import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "@/colors/Colors";
import { fetchCourses, fetchLastUpdate, getTimeAgo } from "./GetGEData";
import { useQuery } from "@tanstack/react-query";
import { FilterBottomSheet } from "../FilterBottomSheet";
import { Course } from "@/types/Types";
import WebViewBottomSheet from "../WebBottomModal";
export const GECourses = ({ navigation, route }) => {
  const { category } = route.params;
  const [search, setSearch] = useState("");
  const [visibleModal, setVisibleModal] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [classTypeFilter, setClassTypeFilter] = useState("All");
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [webUrl, setWebUrl] = useState(""); // State to keep track of the URL
  const handleOpenBottomSheet = (url:string) => {
    if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
      console.warn("Invalid URL format");
      return;
    }
    setWebUrl(url);
    setBottomSheetVisible(true);
  };

  const handleCloseBottomSheet = () => {
    setBottomSheetVisible(false);
  };

  const {
    data: courses,
    isLoading,
    refetch: refetchCourse,
  } = useQuery({
    queryKey: ["courses", category],
    queryFn: () => fetchCourses(category),
  });

  const { data: lastUpdated, refetch: refetchTime } = useQuery({
    queryKey: ["lastUpdate"],
    queryFn: fetchLastUpdate,
  });

  const filterCourses = useCallback(() => {
    if (!courses) return [];
    return courses.filter((course:Course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(search.toLowerCase()) ||
        course.code.toLowerCase().includes(search.toLowerCase()) ||
        course.instructor.toLowerCase().includes(search.toLowerCase());
      const matchesAvailability =
        availabilityFilter === "All" ||
        getAvailabilityLevel(course.class_count) === availabilityFilter;
      const matchesClassType =
        classTypeFilter === "All" || course.class_type === classTypeFilter;
      return matchesSearch && matchesAvailability && matchesClassType;
    });
  }, [courses, search, availabilityFilter, classTypeFilter]);

  useEffect(() => {
    setFilteredCourses(filterCourses());
  }, [filterCourses]);

  const onRefresh = useCallback(async () => {
    await Promise.all([refetchCourse(), refetchTime()]);
  }, [refetchCourse, refetchTime]);

  const copyToClipboard = useCallback((courseCode: string) => {
    Clipboard.setStringAsync(courseCode);
    Alert.alert("Copied to Clipboard", `${courseCode} copied to clipboard.`);
  }, []);

  const RMPButton = useCallback(
    ({ text }: { text: string }) => {
      const searchName = text.split(" ").slice(1).join(" ");
      return (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("WebViewScreen", {
              url: `https://www.ratemyprofessors.com/search/professors/1078?q=${searchName}`,
              course: "Rate My Prof",
              search: text,
            })
          }
        >
          <Text style={styles.instructor}>{text}</Text>
        </TouchableOpacity>
      );
    },
    [navigation]
  );

  const renderCourseItem = useCallback(
    ({ item }: { item: Course }) => (
      <View style={styles.courseContainer}>
        <TouchableOpacity onPress={() => handleOpenBottomSheet(item.link)}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="gray"
          />
        </TouchableOpacity>
        <View style={styles.courseDetails}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.title}>{item.name + " "}</Text>
            <RMPButton text={item.instructor} />
          </View>
          <View style={styles.codeAndInstructor}>
            <View style={styles.codeContainer}>
              <Text style={styles.code}>{item.code}</Text>
            </View>
          </View>
          <Text style={styles.time}>{item.schedule}</Text>
          <Text style={styles.time}>{item.location}</Text>
          {category === "AnyGE" && <Text style={styles.time}>{item.ge}</Text>}
        </View>
        <Text style={[styles.spots, { color: getHashColor(item.class_count) }]}>
          {calculateSpotsLeft(item.class_count)} left
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => copyToClipboard(item.enroll_num.toString().trim())}
            style={styles.copyButton}
          >
            <Ionicons
              name="clipboard-outline"
              size={18}
              color="gray"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert("Not Implemented", "Coming soon...")}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>Add to</Text>
            <Ionicons name="cart-outline" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [navigation, category, copyToClipboard, RMPButton]
  );

  if (isLoading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={() => setVisibleModal(true)}>
          <Ionicons
            name="filter"
            size={24}
            color="black"
            style={styles.filterIcon}
          />
        </TouchableOpacity>
        <Ionicons
          name="search"
          size={20}
          color="gray"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search anything..."
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <Text style={styles.lastUpdated}>
        Last Updated: {lastUpdated ? getTimeAgo(lastUpdated) : "Just now"}
      </Text>
      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        scrollIndicatorInsets={{ top: 20, bottom: 20 }}
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
          <Icon name="arrow-forward" size={20} color={COLORS.white} />
        </View>
      </TouchableOpacity>
      {visibleModal && (
        <FilterBottomSheet
          availabilityFilter={availabilityFilter}
          setAvailabilityFilter={setAvailabilityFilter}
          classTypeFilter={classTypeFilter}
          setClassTypeFilter={setClassTypeFilter}
          onClose={() => setVisibleModal(false)}
        />
      )}
      <WebViewBottomSheet
        visible={bottomSheetVisible}
        url={webUrl}
        onClose={handleCloseBottomSheet}
      />
    </View>
  );
};

const calculateSpotsLeft = (class_count: string) => {
  const [current, total] = class_count.split("/").map(Number);
  return `${total - current}/${total}`;
};

const getAvailabilityLevel = (class_count: string) => {
  const [current, total] = class_count.split("/").map(Number);
  const spotsLeft = total - current;
  if (spotsLeft < 10) return "Low";
  if (spotsLeft < 25) return "Medium";
  return "High";
};

const getHashColor = (capacity: string) => {
  const [currentStr, totalStr] = capacity.split("/");
  const current = parseInt(currentStr, 10);
  const total = parseInt(totalStr, 10);

  if (total > 0) {
    const remaining = total - current;
    if (remaining < 10) return COLORS.red;
    else if (remaining < 25) return COLORS.orange;
    return COLORS.green;
  }

  return COLORS.gray;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
  courseContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  courseDetails: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  codeAndInstructor: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  code: {
    fontSize: 14,
    color: "gray",
    marginRight: 5,
  },
  instructor: {
    fontSize: 14,
    color: "#0000EE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginRight: 8,
  },
  time: {
    fontSize: 14,
    color: "gray",
  },
  spots: {
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
  },
  buttonContainer: {
    position: "absolute",
    right: 10,
    bottom: 10,
    flexDirection: "row",
  },
  copyButton: {
    backgroundColor: COLORS.white,
    padding: 5,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginRight: 8,
  },
  copyButtonText: {
    fontSize: 12,
    color: "gray",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: COLORS.green,
    padding: 5,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "bold",
    marginRight: 5,
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
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 80,
  },
});
