import React from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
 
const Guard = (props) => {
  return (
    <TouchableOpacity onPress={() => props.navigation.navigate('Home')}>
      <View style={{backgroundColor: 'grey', padding: 20}}>
        <Text>Touch Guardd</Text>
      </View>
    </TouchableOpacity>
  );
};
 
export default Guard;