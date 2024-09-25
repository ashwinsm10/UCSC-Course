import { COLORS } from "@/colors/Colors";
import { customCategoryOrder, MAJOR_API_URL } from "@/types/Types";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { CourseList } from "./CourseList";
import { fetchClassesBySubjectAndNumber } from "./GetClassSearchData";
import Icon from "react-native-vector-icons/Ionicons"; // Import vector icons

export const MajorPlanner = ({ route, navigation }) => {
  const { degree } = route.params;
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courseList, setCourseList] = useState([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getHashColor = (enrl_total: string, enrl_capacity: string) => {
    const current = parseInt(enrl_total, 10);
    const total = parseInt(enrl_capacity, 10);
    const remaining = total - current;

    if (remaining > 0) {
      if (remaining < 10) return COLORS.red; // Low availability
      else if (remaining < 25) return COLORS.orange; // Medium availability
      return COLORS.green; // High availability
    }

    return COLORS.black; // When total is 0 or invalid
  };

  // Sort categories based on custom order
  const sortCategories = (categories) => {
    return categories.sort((a, b) => {
      const indexA = customCategoryOrder.indexOf(a);
      const indexB = customCategoryOrder.indexOf(b);

      // Sort based on custom order index or alphabetically if not found in custom order
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const encodedDegree = encodeURIComponent(degree);
      const response = await fetch(`${MAJOR_API_URL}/${encodedDegree}`);
      const data = await response.json();
      const sortedData = sortCategories(Object.keys(data)); // Sort categories here
      setCourses(data);
      if (sortedData.length > 0) {
        setSelectedCategory(sortedData[0]); // Set first sorted category as default
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [degree]);

  const handleCoursePress = async (course) => {
    try {
      setCourseLoading(true);
      const [subject, number] = course.split(" ");

      const result = await fetchClassesBySubjectAndNumber(
        subject,
        number,
        "2248"
      ); // Adjust quarter as needed
      setCourseList(result);
    } catch (error) {
      console.error(error);
    } finally {
      setCourseLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color={COLORS.primary} />;
  if (error)
    return (
      <Text style={styles.errorText}>Error fetching data: {error.message}</Text>
    );

  const categories = sortCategories(Object.keys(courses)); // Ensure categories are sorted before rendering
  const courseListForCategory = selectedCategory
    ? courses[selectedCategory]
    : [];

  const filteredCourses = courseListForCategory.filter((course) =>
    course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDropdownItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedCategory(item);
        setShowDropdown(false);
      }}
      style={styles.dropdownItem}
    >
      <Text style={styles.dropdownItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderCourseItem = ({ item }) => (
    <View style={styles.courseContainer}>
      <TouchableOpacity
        onPress={() => {
          setExpandedCourse(expandedCourse === item ? null : item);
          handleCoursePress(item);
        }}
        style={styles.courseButton}
      >
        <Text style={styles.courseCode}>{item}</Text>
        <Icon
          name={expandedCourse === item ? "chevron-down" : "chevron-forward"}
          size={20}
          color={COLORS.black}
          style={styles.courseIcon}
        />
      </TouchableOpacity>

      {expandedCourse === item && (
        <View style={styles.courseListContainer}>
          {courseLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <CourseList
              courses={courseList}
              handlePress={(url, course) =>
                navigation.navigate("WebViewScreen", { url, course })
              }
              getHashColor={getHashColor}
              EmptyState={() => (
                <Text style={styles.emptyState}>No courses found</Text>
              )}
            />
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Courses for {degree}</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search courses..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <TouchableOpacity
        onPress={() => setShowDropdown(!showDropdown)}
        style={styles.dropdownButton}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedCategory || "Select Category"}
        </Text>
        <Icon
          name={showDropdown ? "chevron-down" : "chevron-forward"}
          size={20}
          color={COLORS.black}
          style={styles.dropdownIcon}
        />
      </TouchableOpacity>

      {showDropdown && (
        <FlatList
          data={categories} // Use sorted categories here for the dropdown as well
          renderItem={renderDropdownItem}
          keyExtractor={(item) => item}
          style={styles.dropdownList}
        />
      )}

      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item}
        ListEmptyComponent={
          <Text style={styles.emptyState}>No courses available</Text>
        }
        style={styles.courseList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.primary,
  },
  searchBar: {
    height: 40,
    width: "50%",
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: COLORS.lightGray,
  },
  courseCode: {
    fontSize: 18,
    color: COLORS.black,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.header,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  dropdownButtonText: {
    fontSize: 18,
    color: COLORS.secondary,
    flex: 1,
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  dropdownList: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
    height: "10%",
  },
  dropdownItem: {
    padding: 10,
    paddingVertical: 5,
    alignSelf: "center",
    borderBottomColor: COLORS.gray,
  },
  dropdownItemText: {
    fontSize: 18,
    color: COLORS.black,
  },
  courseContainer: {
    marginBottom: 6,
  },
  courseButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.skyblue,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    justifyContent: "space-between", // Space out children
  },
  courseIcon: {
    marginLeft: 10,
  },
  courseListContainer: {
  },
  courseList: {
    flex: 1,
  },
  emptyState: {
    textAlign: "center",
    fontSize: 16,
    color: COLORS.gray,
    padding: 20,
  },
  errorText: {
    color: COLORS.red,
    textAlign: "center",
    fontSize: 16,
    padding: 20,
  },
});
