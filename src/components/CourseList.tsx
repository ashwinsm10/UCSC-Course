import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { COLORS } from "../colors/Colors";
import { useNavigation } from "@react-navigation/native";
import { Class, Course } from "@/types/Types";
import { Buffer } from "buffer"; // Import Buffer if it's not already available
import WebViewBottomSheet from "./WebBottomModal";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const CourseList = ({
  courses,
  getHashColor,
  refreshControl,
  EmptyState,
}: {
  courses: Course[] | Class[];
}) => {
  if (courses.length === 0) {
    return <EmptyState />;
  }

  const navigation = useNavigation<any>();
  const [bottomSheetVisible, setBottomSheetVisible] = React.useState(false);
  const [webUrl, setWebUrl] = React.useState(""); // State to keep track of the URL

  const handleOpenBottomSheet = (url) => {
    setWebUrl(url); // Set the URL to be loaded in the WebView
    setBottomSheetVisible(true);
  };

  const handleCloseBottomSheet = () => {
    setBottomSheetVisible(false);
  };

  const handlePress = (quarterId, classNbr) => {
    // Construct the class_data string
    const classData = `a:2:{s:5:":STRM";s:4:"${quarterId}";s:10:":CLASS_NBR";s:5:"${classNbr}";}`;

    // Encode classData in Base64
    const encodedClassData = Buffer.from(classData).toString("base64");

    // Construct the full URL
    const url = `https://pisa.ucsc.edu/class_search/index.php?action=detail&class_data=${encodedClassData}`;

    // Log the IDs for debugging (optional)
    console.log(quarterId, classNbr);

    // Instead of navigation, open the bottom sheet
    handleOpenBottomSheet(url);
  };
  const copyToClipboard = (courseCode: string) => {
    Clipboard.setStringAsync(courseCode);
    Alert.alert("Copied to Clipboard", `${courseCode} copied to clipboard.`);
  };

  const RMPButton = ({ text }: { text: string }) => {
    const searchName = text.split(",")[0] + " " + (text.split(",")[2] ?? "");

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
  };

  const renderCourseItem = ({ item, index }) => (
    <View style={styles.courseContainer}>
      <TouchableOpacity onPress={() => handlePress(item.strm, item.class_nbr)}>
        <Ionicons
          name="information-circle-outline"
          size={24}
          color="gray"
          style={styles.icon}
        />
      </TouchableOpacity>
      <View style={styles.courseDetails}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.title}>{item.title + " "}</Text>
          <RMPButton text={item.instructors[0].name} />
        </View>
        <View style={styles.codeAndInstructor}>
          <View style={styles.codeContainer}>
            <Text
              style={styles.code}
            >{`${item.subject}${item.catalog_nbr}`}</Text>
          </View>
        </View>
        <Text
          style={styles.time}
        >{`${item.meeting_days} ${item.start_time}-${item.end_time}`}</Text>
        <Text>{item.location || "Location TBA"}</Text>
      </View>
      <Text
        style={[
          styles.spots,
          { color: getHashColor(item.enrl_total, item.enrl_capacity) },
        ]}
      >
        {(Number(item.enrl_capacity) - Number(item.enrl_total)).toString() +
          "/" +
          item.enrl_capacity +
          " left"}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => copyToClipboard(item.class_nbr.toString())}
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
          onPress={() => console.log("Add to cart pressed")}
          style={styles.addToCartButton}
        >
          <Text style={styles.addToCartButtonText}>Add to</Text>
          <Ionicons name="cart-outline" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.class_nbr.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={refreshControl}
        scrollIndicatorInsets={{ top: 20, bottom: 20 }}
      />
      <WebViewBottomSheet
        visible={bottomSheetVisible}
        url={webUrl}
        onClose={handleCloseBottomSheet}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 80,
  },
  courseContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  icon: {
    marginRight: 10,
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
  addToCartButton: {
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
  addToCartButtonText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "bold",
    marginRight: 5,
  },
});

export default CourseList;
