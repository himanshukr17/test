import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
 
const BasicButton = () => {
return(
    <View>      
        <TouchableOpacity style= {{backgroundColor:"yellow", marginLeft:"20%", mareginRight:"20%", padding:"10px", bprderRadius:"10px"}}>
            <Text>Touch</Text>
        </TouchableOpacity>
    </View>
)}
 
export default BasicButton