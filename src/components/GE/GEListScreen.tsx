import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Button,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { COLORS } from "@/colors/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const data = [
  { key: "CC", image: require("../../assets/cc.webp") },
  { key: "ER", image: require("../../assets/er.webp") },
  { key: "IM", image: require("../../assets/im.webp") },
  { key: "MF", image: require("../../assets/mf.webp") },
  { key: "SI", image: require("../../assets/si.webp") },
  { key: "SR", image: require("../../assets/sr.webp") },
  { key: "TA", image: require("../../assets/ta.webp") },
  { key: "PE-E", image: require("../../assets/pe-e.webp") },
  { key: "PE-H", image: require("../../assets/pe-h.webp") },
  { key: "PE-T", image: require("../../assets/pe-t.webp") },
  { key: "PR-E", image: require("../../assets/pr-e.webp") },
  { key: "PR-C", image: require("../../assets/pr-c.webp") },
  { key: "PR-S", image: require("../../assets/pr-s.webp") },
  { key: "C1", image: require("../../assets/c1.webp") },
  { key: "C2", image: require("../../assets/c2.webp") },
  { key: "AnyGE", image: require("../../assets/anyge.webp") },
];

const MyUCSCGrid = ({ navigation }) => {
  const [showImages, setShowImages] = useState(true);

  useEffect(() => {
    const loadToggleState = async () => {
      const storedState = await AsyncStorage.getItem("showImages");
      if (storedState !== null) {
        setShowImages(JSON.parse(storedState));
      }
    };
    loadToggleState();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("showImages", JSON.stringify(showImages));
  }, [showImages]);

  const toggleImages = () => {
    setShowImages((prev) => !prev);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate("GECourses", { category: item.key })}
    >
      {showImages && item.image ? (
        <Image
          source={item.image}
          style={styles.image}
          contentFit="cover"
          transition={250}
          cachePolicy={"memory"}
        />
      ) : (
        <View style={styles.placeholder} />
      )}
      <Text style={[showImages ? styles.text : styles.textWithCenter]}>
        {item.key}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Button
        title={showImages ? "Hide Images" : "Show Images"}
        onPress={toggleImages}
      />
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        numColumns={2}
        contentContainerStyle={styles.flatList}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 5, // Margin of 10 from left and right
    backgroundColor: COLORS.white,
  },
  flatList: {
    justifyContent: "center",
  },
  item: {
    flex: 1,
    marginVertical: 5, // Margin top and bottom 5
    marginHorizontal: 5, // Margin left and right 5
    alignItems: "center", // Center items in the grid
    justifyContent: "center",
    position: "relative", // For absolute positioning of the text
  },
  image: {
    width: (screenWidth - 30) / 2, // Subtract total margins and divide by 2 for square image
    height: (screenWidth - 30) / 3, // Same as width to ensure square
    borderRadius: 10,
  },
  text: {
    position: "absolute",
    bottom: 10, // Align the text to the bottom-left of the image
    left: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff", // White color to contrast with the image
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  placeholder: {
    width: (screenWidth - 30) / 2,
    height: (screenWidth - 30) / 3,
    backgroundColor: COLORS.green, // Or any other color you prefer
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textWithCenter: {
    position: "absolute",
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff", // White color to contrast with the image
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
});

export default MyUCSCGrid;
