import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons';



const Actions = ({iconName,onPress,label}) => {
  return (

      <TouchableOpacity style={styles.button} onPress={onPress}>
            <Icon name={iconName} size={24} style={styles.icon} color='black' />
            <Text style={styles.text}>{label}</Text>
        </TouchableOpacity>    
  )
}

export default Actions

const styles = StyleSheet.create({
    button:{
        backgroundColor:"#fff",
        width:'30%',
        height:80,
        borderRadius:20,
        justifyContent:'center',
        alignItems:'center',
        elevation:6,
        shadowColor:'#000',
         shadowOffset: { width: 2, height: 4 },
         shadowRadius:4,
         shadowOpacity:0.3,
         padding:10,
         marginBottom:25
    },
    icon:{
        marginBottom:6
    },
    text:{
        fontSize:12,
        color:'black'
    }


})