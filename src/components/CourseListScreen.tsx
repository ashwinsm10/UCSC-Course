import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import { COLORS } from "../colors/Colors";

const API_URL = "http://192.168.0.198:5001/api/courses";

interface Course {
  code: string;
  link: string;
  name: string;
  instructor: string;
  class_count: string;
  class_type: string;
}
export const CourseListScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}?course=${category.value}`);

      if (response.data && response.data.data) {
        setCourses(response.data.data);
      } else {
        setError("Unexpected response format.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error loading data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [category]);

  const handlePress = (url: string, course: string) => {
    navigation.navigate('WebViewScreen', { url, course });
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No courses available :(</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.listContainer}>
      {courses.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
  data={courses}
  keyExtractor={(item) => item.code} 
  renderItem={({ item, index }) => (
    <TouchableOpacity
      style={styles.courseItem}
      onPress={() => handlePress(item.link, item.name)}
    >
      <View style={styles.codeContainer}>
        <Text style={styles.codeText}>{item.code}</Text>
      </View>
      <View style={styles.numberContainer}>
        <Text style={styles.classNumber}>{index + 1}.</Text>
      </View>
      <View style={styles.textContainer}>
        <Text>Class: {item.name}</Text>
        <Text>Teacher: {item.instructor}</Text>
        <Text>Type: {item.class_type}</Text>
        <Text style={styles.classCountText}> Capacity {item.class_count}</Text>
      </View>
    </TouchableOpacity>
  )}
/>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.primary,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.gray,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  errorText: {
    color: COLORS.secondary,
    textAlign: "center",
    marginTop: 20,
  },
  listContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.primary,
  },
  courseItem: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  numberContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  classNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  textContainer: {
    flex: 1,
  },
  classCountText: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  codeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    padding: 5,
    borderRadius: 5,
  },
  codeText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
});