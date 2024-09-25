import React from "react";
import { WebView } from "react-native-webview";
import { View, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "@/colors/Colors";
const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const WebViewScreen = ({ route }) => {
  const navigation = useNavigation<any>();
  const { url } = route.params;

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;

    if (url.includes("cmd=login")) {
      navigation.navigate("WebViewScreen", {
        url: "https://my.ucsc.edu/psp/csprd/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.SSR_SSENRL_CART.GBL?PORTALPARAM_PTCNAV=HC_SSR_SSENRL_CART_GBL&EOPP.SCNode=SA&EOPP.SCPortal=EMPLOYEE&EOPP.SCName=UCSC_MOBILE_ENROLL&EOPP.SCLabel=&EOPP.SCPTcname=PT_PTPP_SCFNAV_BASEPAGE_SCR&FolderPath=PORTAL_ROOT_OBJECT.PORTAL_BASE_DATA.CO_NAVIGATION_COLLECTIONS.UCSC_MOBILE_ENROLL.ADMN_S201704121458063536484878&IsFolder=false",
        course: "Add Class",
      });
    }
  };

  return (
    <View style={styles.webviewContainer}>
      <WebView
        originWhitelist={["*"]}
        source={{ uri: url }}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator size="large" color={COLORS.secondary} />
        )}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  webviewContainer: {
    flex: 1,
  },
});

export default WebViewScreen;
