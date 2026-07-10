import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import InputField from '../../Component/InputField';
import axios from 'axios';
import { useToast } from "react-native-toast-notifications";

const Forgotpassword = (props) => {
  const [formData, setFormData] = useState({
    email: '',
  });
  const [emailError, setEmailError] = useState("");
  const toast = useToast();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const handelVerification = async () => {
    let hasError = false;
    if (formData.email.trim() === "") {
      setEmailError("Please enter your email");
      hasError = true;
    } else {
      setEmailError("");
    }
    if (!hasError) {
      try {
        const result = await axios.post('http://172.16.16.215:5000/RWA/User/forget', formData)
        console.log("result", result.data);


        if (result.status === 200 && result.data.success) {
          const emailToSend = formData.email
          toast.show("✅ Email Sent successfully", {
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
          setFormData({ email: "" });
          props.navigation.navigate('Verification', { email: emailToSend });
        }

        else {
          toast.show(result.data.message || "Something Went Wrong", {
            type: "danger",
            placement: "top",
            duration: 2500,
            animationType: "zoom-in",
            style: {
              backgroundColor: "#f5d0d0ff",
              borderRadius: 10,
              padding: 12,
              borderColor: "#d6655bff",
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
        }

      } catch (error) {
        if (error.response) {
          // Backend se status mila hai
          if (error.response.status === 404) {
            toast.show("❌ User not found", {
              type: "danger",
              placement: "top",
            });

          } else if (error.response.status === 500) {
            toast.show("❌ Server error, please try again", {
              type: "danger",
              placement: "top",
            });
          } else {
            toast.show(error.response.data.message || "❌ Unexpected error", {
              type: "danger",
              placement: "top",
            });
          }
        } else {
          // Agar response hi nahi aaya (network error)
          toast.show("❌ Network error, please check connection", {
            type: "danger",
            placement: "top",
          });
        }


      }
    }
    // props.navigation.navigate('Verification');
  };

  return (
    <View style={{ height: '100vh', backgroundColor: '#fdfdff', flex: 1 }}>
      <View
        style={{
          height: '40%',
          marginLeft: '6%',
          marginRight: '6%',
          backgroundColor: 'red',
          marginTop: '50%',
          borderRadius: 25,
          backgroundColor: '#fcfaf9',
        }}>
        <Text
          style={{
            marginTop: '15%',
            textAlign: 'center',
            fontSize: 25,
            color: '#465060',
            fontWeight: '400',
          }}>
          Enter Email address


        </Text>
        <View style={{ marginRight: "5%", marginLeft: "5%" }}>
          <InputField
            //    label="E-mail"
            placeholder="Enter your email"
            placeholderTextColor="black"
            value={formData.email}
            onChangeText={text => handleChange('email', text)}
          />
          {emailError && <Text style={{ color: 'red' }}>{emailError}</Text>}
        </View>
        <TouchableOpacity style={{ backgroundColor: '#ffa800', padding: 10, borderRadius: 35, marginRight: "5%", marginLeft: "5%", marginTop: "5%" }} onPress={handelVerification}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: "500", fontSize: 18 }}>Send Code</Text>
        </TouchableOpacity>
      </View>
      {/* <View backgroundColor="black">
        <Text style={{color:"white", textAlign:"center",}}>Already have an account?<Text style={{color:"ffa800"}}> Login</Text></Text>
      </View> */}
    </View>
  );
};

export default Forgotpassword;
