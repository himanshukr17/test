import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import InputField from '../../Component/InputField';
import axios from 'axios';
import { useToast } from "react-native-toast-notifications";

const NewPassword = (props) => {
  const [formData, setFormData] = useState({
    password: '',
  });
  const [confirmPass, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassError, setConfirmPassError] = useState('');

  const toast = useToast();

  const email = props.route.params?.email || '';

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    let hasError = false;

    if (formData.password.trim() === '') {
      setPasswordError('Please enter your password');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (confirmPass.trim() === '') {
      setConfirmPassError('Please confirm your password');
      hasError = true;
    } else if (formData.password !== confirmPass) {
      setConfirmPassError('Passwords do not match');
      hasError = true;
    } else {
      setConfirmPassError('');
    }

    if (!hasError) {
      try {
        const result = await axios.post(
          'http://172.16.16.215:5000/RWA/User/resetpass',
          {
            email,
            newPassword: formData.password,
          }
        );

        console.log('Reset Password Response:', result.data);

         toast.show("✅ Password reset successfully", {
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

        // clear fields
        setFormData({ password: '' });
        setConfirmPassword('');

        // navigate to login after success
        props.navigation.navigate('Login');
      } catch (error) {
        console.log('Error in reset password:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.titleText}>Enter New Password</Text>
        <View style={{ marginHorizontal: '5%', marginTop: 20 }}>
          <InputField
            placeholder="Enter New Password"
            value={formData.password}
            secureTextEntry
            onChangeText={(text) => handleChange('password', text)}
          />
          {passwordError ? (
            <Text style={{ color: 'red' }}>{passwordError}</Text>
          ) : null}
        </View>

        <Text style={{ marginLeft: '8%', marginTop: 20, color: 'black' }}>
          Confirm Password
        </Text>
        <View style={{ marginHorizontal: '5%', marginTop: 10 }}>
          <InputField
            placeholder="Confirm Password"
            
            value={confirmPass}
            secureTextEntry
            onChangeText={(text) => setConfirmPassword(text)}
          />
          {confirmPassError ? (
            <Text style={{ color: 'red' }}>{confirmPassError}</Text>
          ) : null}
        </View>

        <TouchableOpacity style={styles.verifyButton} onPress={handleSave}>
          <Text style={styles.verifyButtonText}>SAVE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.bottomText}>
          Already have an account?{' '}
          <Text
            style={styles.loginLink}
            onPress={() => props.navigation.navigate('Login')}
          >
            Login
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default NewPassword;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdff',
    justifyContent: 'space-between',
  },
  cardContainer: {
    marginHorizontal: '6%',
    marginTop: '20%',
    padding: 20,
    borderRadius: 25,
    backgroundColor: '#fcfaf9',
  },
  titleText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#465060',
    fontWeight: '500',
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
  bottomContainer: {
    paddingVertical: 15,
  },
  bottomText: {
    textAlign: 'center',
    color: '#778499',
    fontSize: 15,
    fontWeight: '500',
  },
  loginLink: {
    color: '#ffa800',
    fontSize: 15,
    fontWeight: '600',
  },
});
