import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For icons like filter and clipboard
import * as Clipboard from "expo-clipboard";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "@/colors/Colors";
import { fetchCourses, fetchLastUpdate, getTimeAgo } from "./GetGEData";
import { useQuery } from "@tanstack/react-query";
import { FilterBottomSheet } from "../FilterBottomSheet";
import { Course } from "@/types/Types";
const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
export const GECourses = ({ navigation, route }) => {
  const { category } = route.params;
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [classTypeFilter, setClassTypeFilter] = useState("All");

  const {
    data: totalCourses,
    isLoading,
    error,
    refetch: refetchCourse,
  } = useQuery({
    queryKey: ["courses", category],
    queryFn: () => fetchCourses(category),
  });

  const { data: lastUpdated, refetch: refetchTime } = useQuery({
    queryKey: ["lastUpdate"],
    queryFn: () => fetchLastUpdate(),
  });

  React.useEffect(() => {
    if (totalCourses) {
      setCourses(filterCourses(totalCourses));
    }
  }, [totalCourses, availabilityFilter, classTypeFilter, search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchCourse();
    await refetchTime();
    setRefreshing(false);
  };

  const copyToClipboard = (courseCode: string) => {
    Clipboard.setStringAsync(courseCode);
    Alert.alert("Copied to Clipboard", `${courseCode} copied to clipboard.`);
  };

  const calculateSpotsLeft = (class_count: string) => {
    const [current, total] = class_count.split("/");
    const current_num = parseInt(current);
    const total_num = parseInt(total);
    return (total_num - current_num).toString() + "/" + total;
  };

  const getAvailabilityLevel = (class_count: string) => {
    const [current, total] = class_count.split("/");
    const spotsLeft = parseInt(total) - parseInt(current);
    if (spotsLeft < 10) return "Low";
    if (spotsLeft < 25) return "Medium";
    return "High";
  };

  const filterCourses = (courses: Course[]) => {
    return courses.filter((course) => {
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
  };

  const RMPButton = ({ text }: { text: string }) => {
    const searchName =
      text.split(" ")[1] +
      " " +
      (text.split(" ")[2] ?? "") +
      " " +
      text.split(" ")[0];
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("WebViewScreen", {
            url: `https://www.ratemyprofessors.com/search/professors/1078?q=${searchName}`,
            course: "Rate My Prof",
          })
        }
      >
        <Text style={styles.instructor}>{text}</Text>
      </TouchableOpacity>
    );
  };

  const renderCourseItem = ({ item }) => (
    <View style={styles.courseContainer}>
      <TouchableOpacity
        onPress={() => navigation.navigate("WebViewScreen", { url: item.link })}
      >
        <Ionicons
          name="information-circle-outline"
          size={24}
          color="gray"
          style={styles.icon}
        />
      </TouchableOpacity>
      <View style={styles.courseDetails}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.title}>{item.name + " "}</Text>
          <RMPButton text={item.instructor} />
        </View>
        <View style={styles.codeAndInstructor}>
          <View style={styles.codeContainer}>
            <Text style={styles.code}>{`${item.code}`}</Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(item.enroll_num.toString())}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text>{`(${item.enroll_num}`} </Text>
                <Ionicons name="clipboard-outline" size={18} color="gray" />
                <Text>{")"} </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.time}>{item.schedule}</Text>
        <Text>{item.location}</Text>

        {category === "AnyGE" && (
          <Text style={styles.classType}>{item.ge}</Text>
        )}
      </View>
      <Text style={styles.spots}>
        {calculateSpotsLeft(item.class_count)} left
      </Text>
    </View>
  );

  if (isLoading) {
    return <ActivityIndicator size={"large"} />;
  }

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
          onChangeText={(text) => setSearch(text)}
        />
      </View>

      <Text style={styles.lastUpdated}>{`Last Updated: ${getTimeAgo(
        lastUpdated
      ) ?? "Just now"}` }</Text>

      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        scrollIndicatorInsets={{ top: 20, bottom: 20 }}
      />

      <TouchableOpacity
        style={styles.myButton}
        onPress={() =>
          navigation.navigate("WebViewScreen", { url: "https://my.ucsc.edu/" })
        }
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.myButtonText}>Go to MyUCSC</Text>
          <Icon
            name="arrow-forward"
            size={20}
            style={{ color: COLORS.white }}
          />
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
    </View>
  );
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
    color: "#0000EE", // Blue color for button look
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
  myButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "green",
    padding: 15,
    alignItems: "center",
    borderRadius: 30,
    elevation: 5, // Shadow effect for the floating button on Android
    shadowColor: "#000", // Shadow effect for iOS
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
    paddingBottom: 80, // Adjusted to ensure content doesn't overlap with the floating button
  },
});

export default GECourses;
