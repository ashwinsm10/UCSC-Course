import { COLORS } from "@/colors/Colors";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { NavigationProp } from "@react-navigation/native";

type Props = {
  navigation: NavigationProp<any>;
};
export const HomeScreen = ({ navigation }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

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
    setSearchTerm("");
    Keyboard.dismiss();
  };

  const buttonTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to SlugCourse!</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Python, CSE 13s, BIOL 15..."
          placeholderTextColor={COLORS.gray}
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {isFocused && (
          <Animated.View
            style={[
              styles.cancelButtonContainer,
              { transform: [{ translateX: buttonTranslateX }] },
            ]}
          >
            <TouchableOpacity onPress={handleCancelPress}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, styles.geButton]}
        onPress={() => navigation.navigate("GESelect")}
      >
        <Text style={styles.buttonText}>GE Search</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.majorButton]}
        onPress={() => navigation.navigate("MajorRequirementsClassSearch")}
      >
        <Text style={styles.buttonText}>Major Requirements Class Search</Text>
      </TouchableOpacity>

      <Text style={styles.findText}>
        Find Your Perfect Schedule <Icon name="smile-o" size={22} />
      </Text>
      <Text style={styles.instructionsText}>
        Select General Education or Major Requirements to begin your search.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.white,
  },
  welcomeText: {
    color: COLORS.title,
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 20,
  },
  searchContainer: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.text,
  },
  cancelButtonContainer: {
    position: "absolute",
    right: -20,
  },
  cancelButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  button: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
    alignItems: "center",
  },
  geButton: {
    backgroundColor: COLORS.green,
  },
  majorButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.white,
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
    color: COLORS.gray,
    paddingHorizontal: 30,
  },
});
