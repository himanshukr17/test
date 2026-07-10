import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { FlatList } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const Notifications = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get("http://172.16.16.215:5000/RWA/Notification/all");
            if (res.data) {
                console.log("Notifications fetched:", res.data);
                setNotifications(res.data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }

    const openFile = async (url, nId) => {
        if (url) {

            const userId = await AsyncStorage.getItem('userId');
            console.log("User ID:", userId);
            console.log("nid:", nId);
            await axios.post('http://172.16.16.215:5000/RWA/Notification/markAsRead', { userId, nId });
            await Linking.openURL(url);
        }
    };


    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: '15%' }}>
                <View>
                    <Icon name="notifications" size={30} color="#8d8dc3ff" />
                </View>
                <View>

                    <Text style={styles.name}>{item.TITLE}</Text>
                    <Text style={styles.message}>{item.DESCRIPTION}</Text>

                </View>
            </View>
            <View style={{ backgroundColor: '#f0f0f0', padding: 4, borderRadius: 12, marginVertical: 4 }}>
                {item.FILE_URL && (
                    <TouchableOpacity onPress={() => openFile(item.FILE_URL, item.N_ID)} style={styles.linkBtn}>
                        <Text style={styles.linkText}>📄 View File</Text>
                    </TouchableOpacity>
                )}
            </View>



        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#ccccf6ff', '#e1e1e5ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <View style={styles.header}>
                    <View style={styles.topRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                            <Icon name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.titled}>Notifications</Text>

                    </View>
                </View>
            </LinearGradient>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20, marginTop: '5%' }}
                initialNumToRender={20}   // first render 20
                maxToRenderPerBatch={30}  // render in batches
                windowSize={10}           // keeps ~10 screens in memory
                removeClippedSubviews={true} // remove items outside screen
            />
        </View>
    )
}


export default Notifications

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        // backgroundColor: '#ededfaff',
        // elevation: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 5
    },
    topRow: {
        position: 'relative',
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },

    backIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },

    titled: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginTop: '5%',
        marginBottom: '2%',
        backgroundColor: '#f4f4f6ff',
        borderRadius: 18,
        elevation: 16,
        marginHorizontal: '5%',
    },
    name: { fontSize: 16, fontWeight: '600', color: 'black' },
    message: { fontSize: 14, color: 'gray' },
    linkBtn: { marginTop: 8 },
    linkText: { fontSize: 14, color: '#8d8dc3ff', fontWeight: '600' }
})