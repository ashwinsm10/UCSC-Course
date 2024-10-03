import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/colors/Colors";
import { customCategoryOrder, MAJOR_API_URL } from "@/types/Types";
import { CourseList } from "./CourseList";
import { fetchClassesBySubjectAndNumber } from "./GetClassSearchData";

const { width: screenWidth } = Dimensions.get("window");

export const MajorPlanner = ({ route, navigation }) => {
  const { degree } = route.params;
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courseList, setCourseList] = useState([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCourses, setExpandedCourses] = useState({});

  const sortCategories = (categories) => {
    return categories.sort((a, b) => {
      const indexA = customCategoryOrder.indexOf(a);
      const indexB = customCategoryOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const encodedDegree = encodeURIComponent(degree.replace(/\//g, "-"));
      const response = await fetch(`${MAJOR_API_URL}/${encodedDegree}`);
      const data = await response.json();
      const sortedCategories = sortCategories(Object.keys(data));
      setCourses(data);
      if (sortedCategories.length > 0) {
        setSelectedCategory(sortedCategories[0]);
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
    setExpandedCourses((prev) => ({
      ...prev,
      [course]: !prev[course],
    }));

    if (!courseList[course]) {
      try {
        setCourseLoading((prev) => ({ ...prev, [course]: true }));
        const [subject, number] = course.split(" ");
        const result = await fetchClassesBySubjectAndNumber(
          subject,
          number,
          "2248"
        );
        setCourseList((prev) => ({ ...prev, [course]: result }));
      } catch (error) {
        console.error(error);
      } finally {
        setCourseLoading((prev) => ({ ...prev, [course]: false }));
      }
    }
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.selectedCategoryItem,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.selectedCategoryText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderCourseItem = ({ item }) => (
    <View style={styles.courseContainer}>
      <TouchableOpacity
        style={styles.courseItem}
        onPress={() => handleCoursePress(item)}
      >
        <Text style={styles.courseCode}>{item}</Text>
        <Ionicons
          name={expandedCourses[item] ? "chevron-up" : "chevron-down"}
          size={24}
          color={COLORS.primary}
        />
      </TouchableOpacity>
      {expandedCourses[item] && (
        <View style={styles.expandedCourseContent}>
          {courseLoading[item] ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : courseList[item] && courseList[item].length > 0 ? (
            <CourseList
              courses={courseList[item]}
              handlePress={(url, course) =>
                navigation.navigate("WebViewScreen", { url, course })
              }
              getHashColor={(enrl_total, enrl_capacity) => {
                const current = parseInt(enrl_total, 10);
                const total = parseInt(enrl_capacity, 10);
                const remaining = total - current;
                if (remaining < 10) return COLORS.red;
                if (remaining < 25) return COLORS.orange;
                return COLORS.green;
              }}
              EmptyState={() => (
                <Text style={styles.emptyState}>No classes found</Text>
              )}
            />
          ) : (
            <Text style={styles.emptyState}>No classes found</Text>
          )}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error fetching data: {error.message}
        </Text>
      </View>
    );
  }

  const categories = sortCategories(Object.keys(courses));
  const filteredCourses = selectedCategory
    ? courses[selectedCategory].filter((course) =>
        course.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{degree} Major Requirements</Text>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.gray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.gray}
          />
        </View>
        <View style={{ marginBottom: 10, marginLeft: 10 }}>
          <FlatList
            horizontal
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            style={styles.categoryList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item}
          style={styles.courseList}
          ListEmptyComponent={
            <Text style={styles.emptyState}>No courses available</Text>
          }
        />
        
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
    padding: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    marginHorizontal: 10,
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
  categoryListContainer: {
    marginBottom: 16,
  },
  categoryList: {
    flexGrow: 0,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  selectedCategoryItem: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.black,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  qualificationsContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  qualificationsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  courseList: {
    flex: 1,
  },
  courseContainer: {
    marginTop:8,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 10,
  },
  courseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  courseCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  expandedCourseContent: {
  },
  emptyState: {
    textAlign: "center",
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.red,
    textAlign: "center",
  },
});
