import React, { useState } from "react";
import { Input, ThemeProvider } from "react-native-elements";
import { StyleSheet, Text, View } from 'react-native';
import { theme } from "../../config/theme"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
 
const CustomInput = (props) => {
      // const [date, setDate] = useState(new Date());
      // const [, setShowPicker] = useState(false);
 
      let {
            style,
            next,
            colour,
            showPicker,
            onpress,
            inputvalue
 
      } = props
 
      return (
            <ThemeProvider theme={theme}>
                  {showPicker && <DateTimePicker
                        testID="dateTimePicker"
                        value={inputvalue}
                        themeVariant={'light'}
                        open={true}
                        // minimumDate={dt}
                        // maximumDate={new Date()}
                        mode={'date'}
                        display="default"
                        {...props}
                  />}
 
                  <Input
                        inputContainerStyle={[styles.inputContainerStyle, { marginBottom: style }]}
                        labelStyle={[styles.labelStyle, { color: colour ? colour : theme.colors.white }]}
                        inputStyle={styles.inputStyle}
                        leftIconContainerStyle={styles.iconContainer}
                        rightIconContainerStyle={styles.iconContainer}
                        value={inputvalue && (new Date(inputvalue).toDateString())}
                        rightIcon={
                              <View style={{ marginRight: 5 }}>
                                    <Icon
                                          name={"calendar"}
                                          color={theme.colors.black}
                                          onPress={onpress}
                                          size={24}
                                          style={{ marginRight: "5%" }}
                                    />
                              </View>
                        }
 
                  {...props}
                  />
            </ThemeProvider>
 
      )
};
 
 
const styles = StyleSheet.create({
      inputContainerStyle: {
            fontFamily: "Nunito",
            fontSize: 18,
            backgroundColor: "#f8f8ff",
            borderWidth: 0.4,
            borderRadius: 20,
            width: "120%",
            marginTop: 10,
            marginRight: 0,
            paddingRight: 0,
            marginBottom: 10,
            fontWeight: "normal",
            // borderBottomColor: theme.colors.black,
            // backgroundColor:'/'
      },
      iconContainer: {
            paddingRight: 0
      },
      labelStyle: {
            fontFamily: "Nunito-Bold",
            fontSize: 14,
            fontWeight: "normal",
            marginLeft: 0,
            lineHeight: 18,
            color: "white"
 
      },
      inputStyle: {
            fontFamily: "Nunito-Regular",
            fontSize: 14,
            fontWeight: "normal",
      },
});
export default CustomInput;
 