import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const AdvertisementDetails = ({ route, navigation }) => {
    const { ad } = route.params;

    return (
        <>
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
                        <Text style={styles.titled}>Advertisement Details</Text>

                    </View>
                </View>
            </LinearGradient>

            <View style={styles.container}>
                {/* Header Row */}



                {/* Scrollable Content */}
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <Image
                        source={{ uri: `http://172.16.16.215:5000/${ad.IMAGE}` }}
                        style={styles.image}
                    />

                    <Text style={styles.title}>{ad.TITILE}</Text>

                    <View>
                        <View style={styles.row}>
                            <Icon name='calendar' size={20} color='black' />
                            <View>
                                <Text style={styles.label}>Valid From:</Text>
                                <Text style={styles.value}>
                                    {new Date(ad.VALID_FROM).toLocaleDateString('en-GB', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <Icon name='calendar' size={20} color='black' />
                            <View>
                                <Text style={styles.label}>Valid Till:</Text>
                                <Text style={styles.value}>
                                    {new Date(ad.VALID_TILL).toLocaleDateString('en-GB', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View>
                        <Text style={styles.descTitle}>Description:</Text>
                        <Text style={styles.desc}>{ad.DESCRIPTION}</Text>
                    </View>
                </ScrollView>
            </View>
        </>

    );
};

export default AdvertisementDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 10,

    },
    scrollContainer: {
        paddingBottom: 30,
    },
    image: {
        width: '100%',
        height: 250,
        borderRadius: 10,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 25,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    label: {
        color: 'black',
        fontWeight: 'bold',
    },
    value: {
        color: 'black',
        fontWeight: 'bold',
    },
    descTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 10,
    },
    desc: {
        fontSize: 16,
        color: '#555',
        lineHeight: 22,
    },
    headerContainer: {
        position: 'relative',
        height: 50,
        justifyContent: 'center',
        marginBottom: 10
    },
    headerTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
    },
    header: {
        
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

});
