import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";

import { Dimensions } from "react-native";
import { COLORS } from "../colors/Colors";



const courseCategories = [
  { value: "CC", label: "Cross-Cultural Analysis" },
  { value: "ER", label: "Ethnicity and Race" },
  { value: "IM", label: "Interpreting Arts and Media" },
  { value: "MF", label: "Mathematical and Formal Reasoning" },
  { value: "SI", label: "Scientific Inquiry" },
  { value: "SR", label: "Statistical Reasoning" },
  { value: "TA", label: "Textual Analysis" },
  { value: "PE-E", label: "Perspectives: Environmental Awareness" },
  { value: "PE-H", label: "Perspectives: Human Behavior" },
  { value: "PE-T", label: "Perspectives: Technology and Society" },
  { value: "PR-E", label: "Practice: Collaborative Endeavor" },
  { value: "PR-C", label: "Practice: Creative Process" },
  { value: "PR-S", label: "Practice: Service Learning" },
  { value: "C1", label: "Composition 1" },
  { value: "C2", label: "Composition 2" },
  { value: "AnyGE", label: "All Courses" },
];

export const MainScreen = ({ navigation }) => (
  <ScrollView style={styles.scrollContainer}>
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ClassSearch")}
      >
        <Text style={styles.buttonText}>Class Search</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("GESearch")}
      >
        <Text style={styles.buttonText}>GE Search</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
);
const { height: screenHeight, width: screenWidth } = Dimensions.get("window");


export const GESearchScreen = ({ navigation }) => (
  <ScrollView style={styles.scrollContainer}>
    <View style={styles.container}>
      {courseCategories.map((category, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => navigation.navigate("CourseList", { category })}
        >
          <Text style={styles.buttonText}>{category.value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
);


export const ClassSearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    <ClassSearch search={searchQuery} />
  };

  return (
    <View style={styles.emptyContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Ex: math, BIOL 15, pixar"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );
};




const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 10,
  },
  button: {
    backgroundColor: COLORS.secondary,
    padding: 17,
    marginVertical: screenHeight* 0.015,
    marginHorizontal: 10,
    width: screenWidth * 0.40,
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
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
  },
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
  searchInput: {
    height: 40,
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "white",
    width: "80%",
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
  scrollContainer: {
    backgroundColor: COLORS.primary,
  },
});
