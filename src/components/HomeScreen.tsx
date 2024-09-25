import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Animated,
  FlatList,
  Button,
} from "react-native";
import { Dimensions } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { COLORS } from "../colors/Colors";
import { courseCategories, DEGREE_API_URL, majors } from "../types/Types";
import { TouchableWithoutFeedback, Keyboard } from "react-native";
import { EmptyState } from "./EmptyState";

export const MainScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  const handleSearchSubmit = () => {
    navigation.navigate("ClassSearchResult", { search: searchTerm });
  };

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleCancelPress = () => {
    setIsFocused(false);
    Keyboard.dismiss();
  };

  const buttonTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30], // Adjust this range to control how far the button moves
  });

  return (
    <View style={styles.container2}>
      <Text style={styles.welcomeText}>Welcome to SlugCourse!</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput2}
          placeholder="Python, CSE 13s, BIOL 15..."
          placeholderTextColor="#C7B8A0"
          enterKeyHint="search"
          onSubmitEditing={handleSearchSubmit}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {isFocused && (
          <Animated.View
            style={{
              transform: [{ translateX: buttonTranslateX }],
              position: "absolute",
              right: -20,
            }}
          >
            <TouchableOpacity onPress={handleCancelPress}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <TouchableOpacity
        style={styles.geButton}
        onPress={() => navigation.navigate("GESelect")}
      >
        <Text style={styles.geButtonText}>GE Search</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.majorButton}
        onPress={() => navigation.navigate("MajorRequirementsClassSearch")}
      >
        <Text style={styles.majorButtonText}>
          Major Requirements Class Search
        </Text>
      </TouchableOpacity>

      <Text style={styles.findText}>
        {"Find Your Perfect Schedule "}
        <Icon name={"smile-o"} size={22} />
      </Text>
      <Text style={styles.instructionsText}>
        Select General Education or Major Requirements to begin your search.
      </Text>
    </View>
  );
};
const { height: screenHeight, width: screenWidth } = Dimensions.get("window");


export const MajorRequirementsClassSearch = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Single animated value

  const filteredMajors = majors.filter((major) =>
    major.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await fetch(DEGREE_API_URL);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setMajors(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMajors();
  }, []);

  useEffect(() => {
    if (loading || filteredMajors.length === 0) return;

    // Start the fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [filteredMajors, loading]);

  const handlePress = (degree) => {
    navigation.navigate("MajorPlanner", { degree });
  };

  if (loading) {
    return (
      <ActivityIndicator
        size={"large"}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      />
    );
  }

  if (error) return <Text>Error fetching degrees: {error.message}</Text>;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.button, {marginBottom:10,marginRight:10}]}
      onPress={() => handlePress(item)}
    >
      <Text style={styles.buttonText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by major..."
        placeholderTextColor={COLORS.white}
        value={searchTerm}
        onChangeText={(text) => setSearchTerm(text)}
      />

      {filteredMajors.length === 0 ? (
        <EmptyState setSearchQuery={setSearchTerm} />
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}> 
          <FlatList
            data={filteredMajors}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 20 }}
            style={{ flexGrow: 0 }}
          />
        </Animated.View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: COLORS.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  noFlexDirection: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredContainer: {
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: "row", // Arrange buttons in a row
    justifyContent: "space-between", // Space between the buttons
  },

  button: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.black,
    fontWeight: "bold",
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
    color: COLORS.text,
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: COLORS.black,
    opacity: 0.6,
    color: COLORS.white,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  errorText: {
    color: COLORS.text,
    textAlign: "center",
    marginTop: 20,
  },
  scrollContainer: {
    backgroundColor: COLORS.primary,
  },
  shadowProp: {
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  container2: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  welcomeText: {
    color: COLORS.title,
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 40,
    fontFamily: "cursive",
  },
  searchContainer: {
    marginVertical: 20,
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#F7F1E6",
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    flexDirection: "row", // Use flex to align children horizontally
    alignItems: "center", // Center items vertically
  },
  searchInput2: {
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#000",
    flex: 1, // Allow the input to grow and fill available space
  },
  cancelButton: {
    fontSize: 14, // Make the text smaller
    color: "#317084", // Adjust color as needed
    paddingVertical: 10, // Add some vertical padding
    paddingHorizontal: 10, // Add horizontal padding for touch area
  },
  geButton: {
    backgroundColor: COLORS.green, // Green button
    width: "100%",
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 10,
  },
  geButtonText: {
    textAlign: "center",
    color: COLORS.black,
    fontSize: 16,
    fontWeight: "bold",
  },
  majorButton: {
    backgroundColor: COLORS.primary, // Light background
    width: "100%",
    paddingVertical: 15,
    borderRadius: 25,
  },
  majorButtonText: {
    textAlign: "center",
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  findText: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 20,
  },
  instructionsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    paddingHorizontal: 30,
  },
});
