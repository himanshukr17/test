import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from "react-native";
import axios from 'axios';
import { useToast } from 'react-native-toast-notifications';
import InputField from "../../Component/InputField";
import { Picker } from '@react-native-picker/picker';
import { Switch } from "react-native";

const SignUp = (props) => {

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    mobile_number: '',
    type: '',
    allowed: false

  })

  // const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);


  {/* Toast for notifications */ }
  const toast = useToast();

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = "First Name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.mobile_number.trim()) newErrors.mobile_number = "Number is required";
    if (!formData.type.trim()) newErrors.type = "Type is required";
    // if (!formData.allowed) newErrors.allowed = "You must agree to share info";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // setErrorModalVisible(true);
      return;
    }

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        mobile_number: formData.mobile_number,
        type: formData.type,
        allowed: formData.allowed
      }

      console.log("payload:", payload);

      const res = await axios.post('http://172.16.16.215:5000/RWA/User/register', payload);
      console.log(res.data);
      if (res.data.success) {
        const emailToSend = formData.email
        toast.show("✅ Registeration successfull", {
          type: "success",
          placement: "top",
          duration: 2500,
          animationType: "zoom-in",
          style: {
            backgroundColor: '#d0f5d8',
            borderRadius: 10,
            padding: 12,
            borderColor: '#5bd67a',
            borderWidth: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5
          },
          textStyle: {
            color: '#1a3c24',
            fontSize: 14,
            fontWeight: '600'
          }
        });
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          mobile_number: '',
          type: '',
          allowed: false
        });

        setErrors({});
        props.navigation.navigate('RegVerification', { email: emailToSend });
      }


    } catch (error) {
      console.error(error);
    }

  }






  return (
    <ScrollView contentContainerStyle={{
      flexGrow: 1,
      justifyContent: "center",
      // alignItems: "center",
    }}
      style={{ flex: 1 }}>
      <View style={styles.cardContainer}>

        <View style={{ marginHorizontal: '5%' }}>

          <InputField
            placeholder="Enter First Name"
            label="First Name"
            value={formData.first_name}
            // secureTextEntry
            onChangeText={(text) => handleChange('first_name', text)}
          />
          {errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}

        </View>




        <View style={{ marginHorizontal: '5%' }}>

          <InputField
            placeholder="Enter Last Name"
            label="Last Name"
            value={formData.last_name}
            // secureTextEntry
            onChangeText={(text) => handleChange('last_name', text)}
          />
          {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}

        </View>




        <View style={{ marginHorizontal: '5%' }}>

          <InputField
            label="Email"
            placeholder="Enter Email"
            value={formData.email}
            // secureTextEntry
            onChangeText={(text) => handleChange('email', text)}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        </View>




        <View style={{ marginHorizontal: '5%' }}>

          <InputField
            placeholder="Enter Password"
            label="Password"
            value={formData.password}
            secureTextEntry
            onChangeText={(text) => handleChange('password', text)}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        </View>




        <View style={{ marginHorizontal: '5%' }}>

          <InputField
            placeholder="Enter Mobile Number"
            label="Contact"
            value={formData.mobile_number}
            // secureTextEntry
            onChangeText={(text) => handleChange('mobile_number', text)}
            keyboardType="numeric"
          />
          {errors.mobile_number && <Text style={styles.errorText}>{errors.mobile_number}</Text>}

        </View>



        <Text style={styles.titleText}>Type:</Text>
        <View style={{ marginHorizontal: '5%' }}>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.type}
              onValueChange={itemValue => handleChange('type', itemValue)}
              style={styles.pickerInner}
            >
              <Picker.Item label="Select Type" value="" />
              <Picker.Item label="Tenant" value="1" />
              <Picker.Item label="Owner" value="2" />
              <Picker.Item label="Guard" value="3" />
              <Picker.Item label="Service Agent" value="4" />
              <Picker.Item label="Committee Member" value="5" />
              <Picker.Item label="Hawker" value="6" />
              <Picker.Item label="Maid" value="7" />
            </Picker>
          </View>
          {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}

        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: '5%', marginTop: 20 }}>
          <Switch
            value={formData.allowed}
            onValueChange={(newValue) => handleChange('allowed', newValue)}
            trackColor={{ false: "grey", true: "#ffa800" }}
            thumbColor={formData.allowed ? "#ffcc00" : "#f4f3f4"}
          />
          <Text style={{ flex: 1, marginLeft: 10, color: 'black', fontSize: 14 }}>
            I agree to share my personal information (contact, address etc.) with other residents.
          </Text>
        </View>
        {/* {errors.allowed && <Text style={styles.errorText}>{errors.allowed}</Text>} */}

        <TouchableOpacity style={styles.verifyButton} onPress={handleSubmit}>
          <Text style={styles.verifyButtonText}>SAVE</Text>
        </TouchableOpacity>


      </View>
    </ScrollView >
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdff',
    justifyContent: 'center',
    // alignItems: 'center',
    paddingTop: 10

  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },

  cardText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  btnContainer: {
    flexDirection: 'row',
    marginTop: 40,
  },
  btn: {
    backgroundColor: 'tomato',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
  },
  navBtn: {
    marginTop: 40,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 6,
  },
  navBtnText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5
  },
  cardContainer: {
    marginHorizontal: '6%',
    // marginTop: '20%',
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#fcf5f1ff',
    // width:'80%'
    marginTop: '15%',
    marginBottom: '15%'
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    // backgroundColor: '#f9f9f9',
    marginBottom: 5,
    overflow: 'hidden',
    height: 43,
    justifyContent: 'center',
  },

  pickerInner: {
    color: 'grey', // text color
    width: '100%',
  },
  verifyButton: {
    backgroundColor: '#ffa800',
    paddingVertical: 12,
    marginTop: 30,
    borderRadius: 35,
    marginHorizontal: '5%',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  titleText: {
    // textAlign: 'center',
    marginBottom: 5, fontSize: 16, color: 'black', marginLeft: '5%', marginTop: 20
  },
});
