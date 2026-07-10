import { Image, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Carousel from "hrm-native-carousel";


const Advertisement = ({ ads,onPress }) => {
    // const [ads, setAds] = useState([]);
    const [outerSize, setOuterSize] = useState({ width: 0, height: 0 });

  

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity style={styles.card} onPress={() => onPress(item)} >
                {item.IMAGE ? (
                    <Image
                        source={{ uri: `http://172.16.16.215:5000/${item.IMAGE}` }}
                        style={styles.image}
                    />
                ) : (
                    <View style={styles.placeholder}>
                        <Text>No Image</Text>
                    </View>
                )}
            </TouchableOpacity>
        )
    }


    return (
        <View
            style={{ flex: 1 }}
            // onLayout={(event) => {
            //     const { width, height } = event.nativeEvent.layout;
            //     setOuterSize({ width, height });
            // }}
        >

            {ads.length > 0 && (
                <Carousel
                    data={ads}
                    renderItem={renderItem}
                    pagintionCircleFocusColour="blue"
                    pagintionCircleBlurColour="red"
                    // carouselWidth={outerSize.width}
                />
            )}

        </View>
    );
};

export default Advertisement;

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
        // backgroundColor:'red',
        margin: 0,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    placeholder: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee',
        borderRadius: 20,
    }

});
