import React, { useCallback, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import { WebView } from "react-native-webview";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { COLORS } from "@/colors/Colors";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const WebViewBottomSheet = ({ visible, url, onClose }) => {
  const bottomSheetRef = useRef(null);
  const snapPoints = ["70%", "100%"];
  const [loading, setLoading] = useState(true); 

  const handleClosePress = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
      onClose();
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
      onClose={onClose}
    >
      <View style={styles.webviewWrapper}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClosePress}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>

        {url ? (
          <WebView
            originWhitelist={["*"]}
            source={{ uri: url }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            style={styles.webView}
          />
        ) : (
          <View style={styles.loadingOverlay}>
            <Text>No URL provided</Text>
          </View>
        )}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
          </View>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  webviewWrapper: {
    flex: 1,
    width: screenWidth * 0.95,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },
  header: {
    padding: 10,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  closeButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  webView: {
    flex: 1,
  },
});

export default WebViewBottomSheet;
