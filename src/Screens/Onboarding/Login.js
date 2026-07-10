import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import InputField from '../../Component/InputField';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { requestUserPermission } from '../../../firebase';

const Login = (props) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // const handelLogin = async () => {
  //   try {
  //     const response = await axios.post('http://172.16.16.215:5000/RWA/User/login', {
  //       email: formData.email,
  //       password: formData.password,
  //     })
  //     // console.log('Login Response:', response);
  //     // console.log('Token:', response.data.token);

  //     if (response.status === 201) {
  //       // Handle successful login
  //       console.log('Module:', response.data.module);

  //       // Save token (or user data) in AsyncStorage
  //       await AsyncStorage.setItem('token', response.data.token);
  //       await AsyncStorage.setItem('userId', response.data.user.user_id);

  //       const modules=response.data.module.filter(m=>typeof m==='string' && m.trim()!=="");
  //       console.log("filtered:",JSON.stringify(modules))
  //       await AsyncStorage.setItem('modules',JSON.stringify(modules))

  //       await requestUserPermission();
  //       // await AsyncStorage.setItem('first_name', response.data.user.first_name);
  //       // await AsyncStorage.setItem('last_name', response.data.user.last_name);
  //       // await AsyncStorage.setItem('type', response.data.user.type);
  //       // await AsyncStorage.setItem('email', response.data.user.email);
  //       // await AsyncStorage.setItem('flat_no', (response.data.user.flat_no ?? '').toString());
  //       // await AsyncStorage.setItem('building_no', (response.data.user.building_no ?? '').toString());

  //       // await AsyncStorage.setItem('image', response.data.user.image);


  //       props.setIsAuth(true);
  //     }


  //   } catch (error) {

  //     if (error.response) {
  //       // API responded with an error
  //       console.log('Login failed:', error.response.data.message);
  //       alert(error.response.data.message || 'Invalid credentials');
  //     } else {
  //       // Network error or other issues
  //       console.error('Login error:', error.message);
  //       alert('Network error. Please try again.');
  //     }

  //   }

  // };


  const handelLogin = async () => {
    try {
      const response = await axios.post('http://172.16.16.215:5000/RWA/User/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 201) {
        console.log('Login Response:', response.data);

        // Save token & userId
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('userId', response.data.user.user_id);
        // await AsyncStorage.setItem('isAdmin', response.data.user.isAdmin);
        // console.log("Admin:", response.data.user.isAdmin);
        await AsyncStorage.setItem('userDetails', JSON.stringify(response.data.user));



        //  Safe check for modules
        const modules = Array.isArray(response.data.module)
          ? response.data.module.filter(m => typeof m === 'string' && m.trim() !== '')
          : []; // agar module undefined ho → empty array

        console.log("filtered:", JSON.stringify(modules));
        await AsyncStorage.setItem('modules', JSON.stringify(modules));

        await requestUserPermission();

        props.setIsAuth(true);
      }

    } catch (error) {
      if (error.response) {
        console.log('Login failed:', error.response.data.message);
        alert(error.response.data.message || 'Invalid credentials');
      } else {
        console.error('Login error:', error.message);
        alert('Network error. Please try again.');
      }
    }
  };

  const handelforgot = () => {
    props.navigation.navigate('Forgotpassword');
  }

  return (
    <View style={styles.parentview}>
      <View style={{ height: '40%' }}></View>
      <View style={styles.loginview}>
        <View style={styles.loginstyle}>
          <Text style={styles.logintext}>Login</Text>
        </View>

        <InputField
          label="E-mail"
          placeholder="Enter your email"
          value={formData.email}
          onChangeText={text => handleChange('email', text)}

        />

        <InputField
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChangeText={text => handleChange('password', text)}
          secureTextEntry={true}
        />
        <View >
          <TouchableOpacity style={styles.forgotview} onPress={handelforgot}>
            <Text style={{ color: "black", fontSize: 15 }}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: '8%' }} >
          <TouchableOpacity style={styles.loginbuttonView} onPress={handelLogin}                       >
            <Text style={styles.loginbuttontext}>Login</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.notaccountview}>
          <Text style={{ color: 'black' }}>
            Don't have an account?
            <TouchableOpacity onPress={() => props.navigation.navigate('SignUp')} ><Text style={{ color: 'blue' }}> Sign Up</Text></TouchableOpacity>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  parentview: {
    height: '100%',
    backgroundColor: '#d7e9ee',
  },
  loginview: {
    backgroundColor: '#fdfefd',
    height: '60%',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    zIndex: -1,
    paddingHorizontal: '8%',
  },
  loginstyle: {
    alignItems: 'center',
    marginTop: '10%',
  },
  logintext: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
  },
  forgotview: {
    alignItems: 'flex-end',
    marginTop: '10%',
  },
  loginbuttonView: {
    backgroundColor: '#ffa800',
    padding: '5%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '10px',
    alignItems: 'center',
    borderRadius: 25,
  },
  loginbuttontext: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  notaccountview: {
    alignItems: 'center',
    marginTop: '5%',
  },
});