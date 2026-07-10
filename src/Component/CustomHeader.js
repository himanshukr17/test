

import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import sos from '../assets/images/sos.png'
// import { Image } from 'react-native-svg';

const { width } = Dimensions.get('window'); // get device screen width
const ICON_SIZE = width * 0.11; // 8% of screen width (adjust as needed)

const CustomHeader = ({
  navigation,
  title = 'Header',
  onBellPress,
  onLogoutPress,
  showMenu = true,
  showTitle = true,
  showBell = true,
  showLogout = false,
  backgroundColor = 'transparent',
}) => {
  return (
    <View style={{
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      backgroundColor: backgroundColor,
      elevation: 4,
    }}>

      {/* Menu */}
      {showMenu ? (
        <TouchableOpacity onPress={() => navigation?.openDrawer()}>
          <Icon name="bars-staggered" size={24} color="black" />
        </TouchableOpacity>
      ) : <View style={{ width: 24 }} />}

      {/* Title */}
      {showTitle && (
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2c3e50' }}>
          Hello {title} !
        </Text>
      )}

      {/* Bell  */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  {showBell && (
    <TouchableOpacity onPress={()=>navigation.navigate('Sos')}>
      <Image
        source={sos}
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
          // marginRight: 10,
        }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  )}
</View>
    </View>
  );
};

export default CustomHeader;
