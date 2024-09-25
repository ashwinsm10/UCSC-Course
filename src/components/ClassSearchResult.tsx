import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableWithoutFeedback,
  Animated,
  TextInput,
  Keyboard,
  Easing,
  Dimensions,
} from "react-native";
import { COLORS } from "../colors/Colors";
import { Class, LAST_UPDATE_URL, SEARCH_API_URL } from "../types/Types";
import * as Clipboard from "expo-clipboard";
import Icon2 from "react-native-vector-icons/FontAwesome5";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  fetchClassesBySubjectAndNumber,
  fetchClassesByTitle,
} from "./GetClassSearchData";
import { useRef } from "react";
import { FilterBottomSheet } from "./FilterBottomSheet";
import { CourseList } from "./CourseList";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const ClassSearchResult = ({ route, navigation }) => {
  const { search } = route.params;
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

  const [totalCourses, setTotalCourses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("All");
  const [classTypeFilter, setClassTypeFilter] = useState<string>("All");
  const [searchAnim] = useState(new Animated.Value(0));
  useEffect(() => {
    fetchCourses();
    fetchLastUpdate();
  }, [search, availabilityFilter, classTypeFilter]);

  const searchInputRef = useRef(null);
  const [showMessage, setShowMessage] = useState(false);
  const [copiedEnrollNum, setCopiedEnrollNum] = useState("");

  useEffect(() => {
    handleRefresh();
  }, [search]);

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

        if (available <= 0) {
          return false;
        }

        if (availabilityFilter === "Low" && available < 10) return true;
        if (
          availabilityFilter === "Medium" &&
          available >= 10 &&
          available < 25
        )
          return true;
        if (availabilityFilter === "High" && available >= 25) return true;

        return false;
      });
    }

    // Apply classTypeFilter
    if (classTypeFilter !== "All") {
      filteredCourses = filteredCourses.filter(
        (course) => course.class_type === classTypeFilter
      );
    }

    // Apply search query filter
    if (searchQuery) {
      filteredCourses = filteredCourses.filter((course) =>
        [
          course.code,
          course.name,
          course.instructor,
          course.schedule,
          course.location,
        ].some((field) =>
          field.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setCourses(filteredCourses);
  }, [availabilityFilter, classTypeFilter, totalCourses, searchQuery]);

  useEffect(() => {
    Animated.timing(searchAnim, {
      toValue: searchVisible ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [searchVisible]);

  const handlePress = (url: string, course: string) => {
    navigation.navigate("WebViewScreen", { url, course });
  };

  const EmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: COLORS.primary,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold", color: COLORS.gray }}>
        No courses available :(
      </Text>
    </View>
  );
  const handleCopy = async (str: string) => {
    try {
      await Clipboard.setStringAsync(str);
      setCopiedEnrollNum(str);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        setCopiedEnrollNum("");
      }, 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };
  const CopyButton = ({ text }: { text: string }) => {
    return (
      <TouchableOpacity
        style={{
          alignSelf: "center",
          backgroundColor: COLORS.primary,
          paddingHorizontal: 5,
          paddingVertical: 2,
          borderRadius: 5,
          borderWidth: 1,
        }}
        onPress={() => handleCopy(text)}
      >
        <Text
          style={{
            color: COLORS.secondary,
            fontWeight: "bold",
            textDecorationLine: "underline",
          }}
        >
          {text}{" "}
          {copiedEnrollNum === text ? ( // Show the clipboard-check icon only for the copied item
            <Icon2 name="clipboard-check" />
          ) : (
            <Icon2 name="clipboard" />
          )}
        </Text>
      </TouchableOpacity>
    );
  };
  

  const getHashColor = (enrl_total: string, enrl_capacity: string) => {
    const current = parseInt(enrl_total, 10);
    const total = parseInt(enrl_capacity, 10);

    if (total > 0) {
      const remaining = total - current;
      if (remaining < 10) return COLORS.red; // Low availability
      else if (remaining < 25) return COLORS.orange; // Medium availability
      return COLORS.green; // High availability
    }

    return COLORS.gray; // When total is 0 or invalid
  };

  if (loading && !refreshing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.primary,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    !loading && (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Icon
              name="filter"
              size={screenWidth * 0.085}
              color={COLORS.secondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setSearchVisible(!searchVisible)}
          >
            <Icon
              name="search"
              size={screenWidth * 0.07}
              color={COLORS.secondary}
            />
          </TouchableOpacity>
          {!searchVisible && (
            <View style={styles.lastUpdateContainer}>
              <Text style={styles.lastUpdateText}>
                Last updated: {lastUpdate}
              </Text>
            </View>
          )}

          {searchVisible && (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Animated.View
                style={[
                  styles.searchContainer,

                  {
                    width: searchAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [screenWidth * 0.75, screenWidth * 0.75], // Expands from 0 to 75% of screen width
                    }),
                    opacity: searchAnim,
                  },
                ]}
              >
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search classes by anything..."
                  placeholderTextColor={COLORS.gray}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="done"
                />
              </Animated.View>
            </TouchableWithoutFeedback>
          )}
        </View>
        {modalVisible && (
          <FilterBottomSheet
            onClose={() => setModalVisible(false)}
            availabilityFilter={availabilityFilter}
            setAvailabilityFilter={setAvailabilityFilter}
            classTypeFilter={classTypeFilter}
            setClassTypeFilter={setClassTypeFilter}
          />
        )}

        <CourseList
          courses={courses}
          handlePress={handlePress}
          getHashColor={getHashColor}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.secondary}
            />
          }
          EmptyState={EmptyState}
        />

        {showMessage && (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>Copied to clipboard!</Text>
          </View>
        )}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: screenHeight * 0.01, // 1% of screen height
    flex: 1,
    padding: screenWidth * 0.025, // 2.5% of screen width
    backgroundColor: COLORS.primary,
  },
  courseItem: {
    padding: screenWidth * 0.025, // 2.5% of screen width
    backgroundColor: COLORS.secondary,
    borderRadius: screenWidth * 0.025, // 2.5% of screen width
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    position: "relative",
  },

  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    marginRight: "4%", // 2.5% of screen width
    marginBottom: screenHeight * 0.015, // 1.5% of screen height
  },
  lastUpdateContainer: {
    padding: screenWidth * 0.0125, // 1.25% of screen width
    paddingVertical: screenHeight * 0.01, // 1% of screen height
    backgroundColor: COLORS.secondary,
    borderRadius: screenWidth * 0.0125, // 1.25% of screen width
    marginBottom: screenHeight * 0.01, // 1% of screen height
  },
  lastUpdateText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchContainer: {
    height: screenHeight * 0.045, // 5% of screen height (match height of lastUpdateContainer)
    backgroundColor: COLORS.primary,
    borderRadius: screenWidth * 0.0125, // 1.25% of screen width
    justifyContent: "center", // Center content vertically
    marginBottom: screenHeight * 0.01,
  },
  searchInput: {
    height: "100%", // Fill height of searchContainer
    width: "99%", // Fill width of searchContainer (adjust width as needed)
    borderColor: COLORS.secondary,
    borderWidth: 1,
    borderRadius: screenWidth * 0.0125, // 1.25% of screen width
    paddingHorizontal: screenWidth * 0.025, // 2.5% of screen width
    color: COLORS.secondary,
  },
  messageContainer: {
    position: "absolute",
    top: 20, // Adjust to position the message at the top
    left: 0,
    right: 0,
    alignItems: "center",
  },
  message: {
    padding: 10,
    backgroundColor: COLORS.primary,
    opacity: 0.8,
    color: "white",
    fontWeight: "bold",
    borderRadius: 5,
  },
});
