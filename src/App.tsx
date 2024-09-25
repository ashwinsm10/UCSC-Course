import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Dimensions, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  MainScreen,
  MajorRequirementsClassSearch,
} from "./components/HomeScreen";
import WebViewScreen from "./components/WebView";
import { COLORS } from "./colors/Colors";
import { ClassSearchResult } from "./components/ClassSearchResult";
import { MajorPlanner } from "./components/MajorPlanner";
import MyUCSCGrid from "./components/GE/GEListScreen";
import { GECourses } from "./components/GE/GEClassSearch";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const Stack = createStackNavigator();
const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{
              headerTitle: "",
              headerStyle: { height: screenHeight * 0.125 },
              headerShadowVisible: false, // This will remove the shadow on Android
              headerLeft: () => (
                <TouchableOpacity style={{ marginLeft: screenWidth * 0.02 }}>
                  <Icon
                    name="menu"
                    size={screenHeight * 0.05}
                    color={COLORS.black}
                  />
                </TouchableOpacity>
              ),
            }}
          />

          <Stack.Screen
            name="GECourses"
            component={GECourses}
            options={({ navigation, route }) => ({
              headerStyle: { height: screenHeight * 0.125 },
              headerTitle: route?.params?.category,

              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{ marginLeft: screenWidth * 0.02 }}
                >
                  <Icon name="arrow-back" size={screenHeight * 0.05} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="WebViewScreen"
            component={WebViewScreen}
            options={({ navigation }) => ({
              headerStyle: { height: screenHeight * 0.125 },
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{ marginLeft: screenWidth * 0.02 }}
                >
                  <Icon name="arrow-back" size={screenHeight * 0.05} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="ClassSearchResult"
            component={ClassSearchResult}
            options={({ navigation }) => ({
              headerStyle: { height: screenHeight * 0.125 },
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{ marginLeft: screenWidth * 0.02 }}
                >
                  <Icon name="arrow-back" size={screenHeight * 0.05} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="MajorRequirementsClassSearch"
            component={MajorRequirementsClassSearch}
            options={({ navigation }) => ({
              headerStyle: {
                height: screenHeight * 0.125,
                backgroundColor: COLORS.primary,
              },
              headerShadowVisible: false, // This will remove the shadow on Android

              headerTitle: "",
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{ marginLeft: screenWidth * 0.02 }}
                >
                  <Icon name="arrow-back" size={screenHeight * 0.05} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="MajorPlanner"
            component={MajorPlanner}
            options={({ navigation }) => ({
              headerStyle: { height: screenHeight * 0.125 },
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{ marginLeft: screenWidth * 0.02 }}
                >
                  <Icon name="arrow-back" size={screenHeight * 0.05} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="GESelect"
            component={MyUCSCGrid}
            options={({ navigation }) => ({
              headerStyle: { height: screenHeight * 0.125 },
              headerShadowVisible: false, // This will remove the shadow on Android

              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{ marginLeft: screenWidth * 0.02 }}
                >
                  <Icon name="arrow-back" size={screenHeight * 0.05} />
                </TouchableOpacity>
              ),
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
};

export default App;
