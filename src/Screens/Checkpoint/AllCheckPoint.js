import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AllCheckPoint = ({ navigation }) => {
    const [checkpoints, setCheckpoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCheckpoints();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCheckpoints();
        setRefreshing(false);
    };

    const fetchCheckpoints = async () => {
        try {
            setLoading(true);
            const userID = await AsyncStorage.getItem('userId');
            console.log('Fetching checkpoints for userID:', userID);
            const res = await axios.get(`http://172.16.16.215:5000/RWA/Checkpoint/user/${userID}`);
            console.log('Fetched checkpoints:', res.data);
            setCheckpoints(res.data.data || []);
        } catch (err) {
            console.error('Error fetching checkpoints:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.topRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                        <Icon name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.titled}>All Checkpoints</Text>
                </View>
            </View>

            {/* Body */}
            <ScrollView contentContainerStyle={{ padding: 16, marginTop: 10 }} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} >
                {loading ? (
                    <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
                ) : checkpoints.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>No checkpoints found</Text>
                ) : (
                    checkpoints.map((cp) => (
                        <TouchableOpacity
                            key={cp._id}
                            style={styles.card}
                            onPress={() => navigation.navigate('CheckPoint', { checkpoint: cp })}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ backgroundColor: '#d7d7f6ff', padding: 5, borderRadius: 5 }}>
                                    <Text style={styles.cpDetail}>Block No: {cp.BLOCK_NO}</Text>
                                </View>
                                <View style={{ backgroundColor: '#d7d7f6ff', padding: 5, borderRadius: 5 }}>
                                    <Text style={styles.cpDetail}>
                                        Time: {new Date(cp.TIME).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ marginTop: 15, alignSelf: 'center' }}>
                                <Text style={styles.cpTitle}>Checkpoint Address: {cp.CHECKPOINT_ADDRESS}</Text>

                            </View>


                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default AllCheckPoint;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#ededfaff',
        elevation: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 5,
    },
    topRow: {
        position: 'relative',
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
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
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderRadius: 12,
        marginBottom: 25,
        elevation: 5,
    },
    cpTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
        color: 'black'
    },
    cpDetail: {
        fontSize: 14,
        color: '#0e0e0eff',
    },
});
