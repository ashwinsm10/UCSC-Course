import React from "react"
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ClassSearchScreen, GESearchScreen, MainScreen } from "./components/HomeScreen";
import WebViewScreen from "./components/WebView";
import { COLORS } from "./colors/Colors";
import { CourseListScreen } from "./components/CourseListScreen";
const Stack = createStackNavigator();
const App = () => {
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.header },
            headerTintColor: "black",
          }}
        >
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{ title: "Home" }}
          />
          <Stack.Screen
            name="ClassSearch"
            component={ClassSearchScreen}
            options={{ title: "Class Search" }}
          />
          <Stack.Screen
            name="GESearch"
            component={GESearchScreen}
            options={{ title: "GE Search" }}
          />
          <Stack.Screen
            name="CourseList"
            component={CourseListScreen}
            options={({ route }) => ({
              title: route?.params?.category.label,
              
            })}
          />
          <Stack.Screen
            name="WebViewScreen"
            component={WebViewScreen}
            options={({ route  }) => ({
              title: route?.params?.course
            })}
          />
          
        </Stack.Navigator>
      </NavigationContainer>
    );
  };
  export default App;