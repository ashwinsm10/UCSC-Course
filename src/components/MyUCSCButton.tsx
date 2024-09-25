import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

export const RenderMyUCSCButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        navigation.navigate("WebViewScreen", {
          url: "https://my.ucsc.edu/",
          course: "MyUCSC",
        });
      }}
    >
      <View style={styles.iconTextContainer}>
        <Text style={styles.text}>{"MyUCSC"}</Text>
        <Icon name="add-circle" size={20} color="black" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "black",
    fontWeight: "bold",
    marginLeft: 5,
  },
});
