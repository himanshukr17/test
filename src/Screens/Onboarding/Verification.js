import axios from 'axios';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { OtpInput } from "react-native-otp-entry";
import { useToast } from "react-native-toast-notifications";

const Verification = (props) => {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);

  const email = props.route.params?.email || "";
  console.log("email:", email);
  const toast = useToast();

  const handleVerification = async () => {
    let hasError = false;

    if (otp.trim() === "") {
      setOtpError("Please enter your code");
      hasError = true;
    } else {
      setOtpError("");
    }

    if (!hasError) {
      try {
        setLoading(true);
        const result = await axios.post(
          "http://172.16.16.215:5000/RWA/User/verifyforget",
          { email, otp }
        );

        toast.show("✅ Code verified successfully", {
          type: "success",
          placement: "top",
          duration: 2500,
          animationType: "zoom-in",
          style: {
            backgroundColor: "#d0f5d8",
            borderRadius: 10,
            padding: 12,
            borderColor: "#5bd67a",
            borderWidth: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
          textStyle: {
            color: "#1a3c24",
            fontSize: 14,
            fontWeight: "600",
          },
        });

        console.log("OTP verify result:", result.data);

        //  OTP correct hone par NewPassword screen pe jao
        props.navigation.navigate("NewPassword", { email });
        setOtp("");
      } catch (error) {
        console.log("OTP verify error:", error);
        toast.show("❌ Invalid or expired code", {
          type: "danger",
          placement: "top",
          duration: 2500,
          animationType: "zoom-in",
          style: {
            backgroundColor: "#fde2e2",
            borderRadius: 10,
            padding: 12,
            borderColor: "#f87171",
            borderWidth: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
          textStyle: {
            color: "#7f1d1d",
            fontSize: 14,
            fontWeight: "600",
          },
        });
        setOtpError("Invalid or expired code, please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogin = () => {
    props.navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.titleText}>Enter Verification Code</Text>

        <View style={{ marginTop: "10%" }}>
          <OtpInput numberOfDigits={4}
            theme={{
              pinCodeTextStyle: {
                color: "black",   //  text ka color black
                fontSize: 18,
                fontWeight: "600",
              },
            }}
            onTextChange={(text) => setOtp(text)} />
        </View>

        {otpError && <Text style={styles.errorText}>{otpError}</Text>}

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerification}
          disabled={loading}
        >
          <Text style={styles.verifyButtonText}>
            {loading ? "Verifying..." : "Verify"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.bottomText}>
          Already have an account?{" "}
          <Text style={styles.loginLink} onPress={handleLogin}>
            Login
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default Verification;

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfdff",
    justifyContent: "space-between",
  },
  cardContainer: {
    marginHorizontal: "6%",
    marginTop: '20%',
    padding: 20,
    borderRadius: 25,
    backgroundColor: "#fcfaf9",
  },
  titleText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 25,
    color: "#465060",
    fontWeight: "400",
  },
  verifyButton: {
    backgroundColor: "#ffa800",
    paddingVertical: 12,
    marginTop: "7%",
    borderRadius: 35,
    marginHorizontal: "5%",
    alignItems: "center",
  },
  verifyButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  bottomContainer: {
    paddingVertical: 15,
  },
  bottomText: {
    textAlign: "center",
    color: "#778499",
    fontSize: 15,
    fontWeight: "500",
  },
  loginLink: {
    color: "#ffa800",
    fontSize: 15,
  },
});
