import React, { useCallback, useMemo } from "react";
import { StyleSheet, View, Text, Dimensions, ScrollView } from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { SelectList } from "react-native-dropdown-select-list";
import { COLORS } from "../colors/Colors";

const { width: screenWidth } = Dimensions.get("window");

type FilterBottomSheetProps = {
  onClose: () => void;
  availabilityFilter: string;
  setAvailabilityFilter: (value: string) => void;
  classTypeFilter: string;
  setClassTypeFilter: (value: string) => void;
};

export const FilterBottomSheet = React.memo(
  ({
    onClose,
    availabilityFilter,
    setAvailabilityFilter,
    classTypeFilter,
    setClassTypeFilter,
  }: FilterBottomSheetProps) => {
    const [isOpen, setIsOpen] = React.useState(true);

    const snapPoints = useMemo(() => ["20%", "50%", "70%"], []);

    const availabilityOptions = useMemo(
      () => [
        { key: "All", value: "All" },
        { key: "Low", value: "Low" },
        { key: "Medium", value: "Medium" },
        { key: "High", value: "High" },
      ],
      []
    );

    const classTypeOptions = useMemo(
      () => [
        { key: "All", value: "All" },
        { key: "Asynchronous Online", value: "Asynchronous Online" },
        { key: "Hybrid", value: "Hybrid" },
        { key: "Synchronous Online", value: "Synchronous Online" },
        { key: "In Person", value: "In Person" },
      ],
      []
    );

    const handleAvailabilityChange = useCallback(
      (value: string) => {
        setAvailabilityFilter(value);
      },
      [setAvailabilityFilter]
    );

    const handleClassTypeChange = useCallback(
      (value: string) => {
        setClassTypeFilter(value);
      },
      [setClassTypeFilter]
    );

    return (
      <View style={styles.overlayContainer}>
        {isOpen && (
          <BottomSheet
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            handleIndicatorStyle={{
              backgroundColor: COLORS.black,
              opacity: 0.6,
            }}
            backdropComponent={(props) => (
              <BottomSheetBackdrop
                {...props}
                opacity={0.5}
                enableTouchThrough={false}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                style={[
                  { backgroundColor: "rgba(0, 0, 0, 1)" },
                  StyleSheet.absoluteFillObject,
                ]}
              />
            )}
            backgroundStyle={{ backgroundColor: COLORS.secondary }}
            onClose={onClose} // Ensure closing when pan down is used
          >
              <View style={styles.rowContainer}>
                <View style={styles.filterItem}>
                  <Text style={styles.filterTitle}>Select Availability:</Text>
                  <SelectList
                    setSelected={handleAvailabilityChange}
                    data={availabilityOptions}
                    defaultOption={{
                      key: availabilityFilter,
                      value: availabilityFilter,
                    }}
                    boxStyles={styles.dropdown}
                    dropdownStyles={styles.dropdownList}
                    save="value"
                    search={false}
                  />
                </View>

                <View style={styles.filterItem}>
                  <Text style={styles.filterTitle}>Select Class Type:</Text>
                  <SelectList
                    setSelected={handleClassTypeChange}
                    data={classTypeOptions}
                    defaultOption={{
                      key: classTypeFilter,
                      value: classTypeFilter,
                    }}
                    boxStyles={styles.dropdown}
                    dropdownStyles={styles.dropdownList}
                    search={false}
                  />
                </View>
              </View>
          </BottomSheet>
        )}
      </View>
    );
  }
);
const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  filterOptionsContainer: {
    width: "95%",
    padding: screenWidth * 0.05, // 2.5% of screen width
    borderRadius: screenWidth * 0.025, // 2.5% of screen width
    alignItems: "center",
    justifyContent: "center",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding:5
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 10, // Space between items
  },
  filterTitle: {
    fontSize: screenWidth * 0.04, // 4% of screen width
    fontWeight: "bold",
    color: COLORS.green,
    marginBottom: 8, // Space between label and dropdown
  },
  dropdown: {
    backgroundColor: COLORS.green,
    borderRadius: 8,
    padding: 7,
  },
  dropdownList: {
    opacity: 0.5,
    backgroundColor: COLORS.green,
  },
});
