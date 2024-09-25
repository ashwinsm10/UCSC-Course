import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";
import { COLORS } from "../colors/Colors";
import Icon2 from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const CourseList = ({ 
  courses, 
  handlePress, 
  getHashColor, 
  refreshControl,
  EmptyState 
}) => {
  if (courses.length === 0) {
    return <EmptyState />;
  }
  const navigation = useNavigation<any>();
  const CopyButton = React.memo(({ text }: { text: string }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async (str: string) => {
      try {
        await Clipboard.setStringAsync(str);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to copy text:", error);
      }
    };

    return (
      <View style={{ alignItems: "center" }}>
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
            {copied ? ( // Show the clipboard-check icon only for the copied item
              <Icon2 name="clipboard-check" />
            ) : (
              <Icon2 name="clipboard" />
            )}
          </Text>
        </TouchableOpacity>
        {copied && (
          <Text
            style={{
              marginTop: 5,
              color: COLORS.green, // Use a color for the success message
              fontWeight: "bold",
            }}
          >
            Copied to clipboard!
          </Text>
        )}
      </View>
    );
  });
  const RMPButton = ({ text }: { text: string }) => {
    const fullName = text.split(",")[1] + " " + text.split(",")[0];
    const rmpSearch =text.split(",")[0] + " " + text.split(",")[1];
    return (
      <TouchableOpacity
        style={{
          alignSelf: "flex-start",
          backgroundColor: COLORS.primary,
          paddingHorizontal: 5,
          paddingVertical: 2,
          borderRadius: 5,
          borderWidth: 1,
        }}
        onPress={() =>
          navigation.navigate("WebViewScreen", {
            url: `https://www.ratemyprofessors.com/search/professors/1078?q=${rmpSearch}`,
            course: "Rate My Prof",
          })
        }
      >
        <Text
          style={{
            color: COLORS.secondary,
            fontWeight: "bold",
            textDecorationLine: "underline",
          }}
        >
          <Icon
            name="user"
            size={screenWidth * 0.04}
            color={COLORS.secondary}
          />
          {" " + fullName}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={courses}
      keyExtractor={(item) => item.class_nbr.toString()}
      ItemSeparatorComponent={() => (
        <View style={{ height: 1, backgroundColor: COLORS.primary }} />
      )}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={styles.courseItem}
          onPress={() => handlePress(item.link, item.name)}
        >
          <View style={styles.courseCode}>
            <Text style={styles.courseCodeText}>
              {item.subject + item.catalog_nbr}
            </Text>
          </View>
          <View style={styles.indexContainer}>
            <Text style={styles.indexText}>{index + 1}.</Text>
          </View>
          <View style={styles.courseDetails}>
            <Text>
              <Icon
                name="book"
                size={screenWidth * 0.04}
                color={COLORS.primary}
              />
              {" " + item.title}
            </Text>
            <RMPButton text={item.instructors[0].name} />
            <Text>
              <Icon
                name="calendar"
                size={screenWidth * 0.04}
                color={COLORS.primary}
              />
              {" " + item.schedule}
            </Text>
            <CopyButton text={item.class_nbr.toString()} />
            <Text style={[
              styles.availabilityText,
              { color: getHashColor(item.enrl_total, item.enrl_capacity) }
            ]}>
              {(Number(item.enrl_capacity) - Number(item.enrl_total)).toString() + "/" + item.enrl_capacity + " left"}
            </Text>
          </View>
          <Icon
            name="chevron-right"
            size={screenWidth * 0.025}
            color={COLORS.primary}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>
      )}
      refreshControl={refreshControl}
      scrollIndicatorInsets={{
        top: 0,
        bottom: screenHeight * 0.02,
        left: 0,
        right: -2,
      }}
    />
  );
};

const styles = StyleSheet.create({
  courseItem: {
    padding: screenWidth * 0.025,
    backgroundColor: COLORS.secondary,
    borderRadius: screenWidth * 0.025,
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  courseCode: {
    position: 'absolute',
    top: screenHeight * 0.005,
    right: screenWidth * 0.025,
    backgroundColor: COLORS.primary,
    padding: screenWidth * 0.0125,
    borderRadius: screenWidth * 0.0125,
  },
  courseCodeText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  indexContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: screenWidth * 0.025,
  },
  indexText: {
    fontSize: screenWidth * 0.04,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  courseDetails: {
    flex: 1,
  },
  availabilityText: {
    fontSize: screenWidth * 0.035,
    position: 'absolute',
    bottom: 0,
    right: 0,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  chevronIcon: {
    position: 'absolute',
    right: 0,
    bottom: screenHeight * 0.05,
  },
});