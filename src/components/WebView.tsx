import React from "react";
import { WebView } from "react-native-webview";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const WebViewScreen = ({ route }) => {
  const { url } = route.params;

  return (
    <View style={styles.webviewContainer}>
      <WebView
        source={{ uri: url }}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator size="large" color="#B59410" />
        )}
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