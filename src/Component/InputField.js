import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const InputField = ({ label, placeholder, value, onChangeText, secureTextEntry = false }) => {
  const [hidePassword, setHidePassword] = useState(secureTextEntry);

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ marginBottom: 5, fontSize: 16, color: 'black' }}>{label}</Text>

      <View style={{
        position: 'relative',
        justifyContent: 'center',
      }}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="gray"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry ? hidePassword : false}
          style={{
            borderWidth: 1,
            borderColor: '#e2e8f0',
            borderRadius: 10,
            padding: 10,
            paddingRight: 40, // 👈 space for the eye icon
            fontSize: 16,
            color: 'black',
          }}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setHidePassword(!hidePassword)}
            style={{
              position: 'absolute',
              right: 10,
              top: '35%',
            }}
          >
            <Icon
              name={hidePassword ? 'eye-off' : 'eye'}
              size={22}
              color="gray"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default InputField;
