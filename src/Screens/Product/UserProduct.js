import { Image, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from 'react-native-toast-notifications';

const UserProduct = ({ navigation }) => {
    const [product, setProducts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const toast = useToast();



    useEffect(() => {
        fetchProducts();
        console.log("Products:", product);
    }, [])

    const fetchProducts = async () => {
        const userId = await AsyncStorage.getItem('userId');
        console.log("User ID:", userId);

        try {
            const res = await axios.get(`http://172.16.16.215:5000/RWA/Product/user/${userId}`);

            if (res.status == 200) {
                setProducts(res.data.data);
                console.log("Products in Product:", res.data);
            } else {
                console.warn("Failed to fetch products, status:", res.status);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        }
    };

    {/* Update Flag */ }
    const UpdateFlag = async (id) => {

        try {
            console.log("id:", id);
            const res = await axios.put(`http://172.16.16.215:5000/RWA/Product/update/${id}`);
            // console.log(res.data);
            if (res.status == 200) {
                toast.show(" Product Sold successfully", {
                    type: "success",
                    placement: "top",
                    duration: 2500,
                    animationType: "zoom-in",
                    style: {
                        backgroundColor: '#d0f5d8',
                        borderRadius: 10,
                        padding: 12,
                        borderColor: '#5bd67a',
                        borderWidth: 1,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5
                    },
                    textStyle: {
                        color: '#1a3c24',
                        fontSize: 14,
                        fontWeight: '600'
                    }
                });
            }
            fetchProducts();
            setModalVisible(false);
        } catch (err) {
            console.log(err);
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProducts();
        setRefreshing(false);
    }

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                {selectedProduct && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>

                            {/* Header: Title + Price */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{selectedProduct.TITLE}</Text>
                                <View style={{ borderRadius: 10, }}>

                                    <TouchableOpacity onPress={() => UpdateFlag(selectedProduct.PRODUCT_ID)} >
                                        <LinearGradient
                                            useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                            colors={['#ddceceff', '#ca7575ff', '#bb3030ff']}   // left dark → right light
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{ padding: 5, borderRadius: 10, paddingHorizontal: 10 }}
                                        >
                                            <Text style={styles.modalPriceText}>Sold</Text>
                                        </LinearGradient>

                                    </TouchableOpacity>
                                </View>

                            </View>

                            {/* Image */}
                            <Image
                                source={{ uri: `http://172.16.16.215:5000/${selectedProduct.IMAGE}` }}
                                style={{
                                    width: '100%',      // modal width ke hisaab se adjust
                                    height: undefined,  // height auto calculate
                                    aspectRatio: 1,     // original ratio maintain (1 = square, use image's real ratio if possible)
                                    borderRadius: 15,
                                    marginVertical: 15,
                                }}
                                resizeMode="contain"     // image ko crop na karne ke liye
                            />

                            <View>
                                {/* Description */}
                                <Text style={styles.modalUser}>
                                    Description:
                                </Text>
                                <Text style={styles.modalDesc}>{selectedProduct.DESCRIPTION}</Text>

                                {/* Owner Details */}

                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.modalUser}>
                                        Owner:
                                    </Text>
                                    <Text style={styles.modalUserDetails}>
                                        {selectedProduct.userDetails.first_name} {selectedProduct.userDetails.last_name}
                                    </Text>
                                    <View>
                                        {[2, 5].includes(selectedProduct.userDetails.type) && (
                                            <Image
                                                source={require('../../assets/images/green.png')}
                                                style={styles.icon}
                                            />
                                        )}


                                        {selectedProduct.userDetails.type == 1 && (
                                            <>
                                                {selectedProduct.userDetails.status == 0 && (
                                                    <Image source={require('../../assets/images/grey.png')} style={styles.icon} />
                                                )}
                                                {selectedProduct.userDetails.status == 1 && (
                                                    <Image source={require('../../assets/images/blue.png')} style={styles.icon} />
                                                )}
                                            </>
                                        )}
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.modalUser}>
                                        Flat:
                                    </Text>
                                    <Text style={styles.modalUserDetails}>
                                        {selectedProduct.userDetails.flat_no}-{selectedProduct.userDetails.floor}

                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.modalUser}>
                                        Contact:
                                    </Text>
                                    <TouchableOpacity onPress={() => {
                                        const phone = selectedProduct.userDetails.number;
                                        if (phone) Linking.openURL(`tel:${phone}`);
                                    }}>
                                        <Text style={styles.modalContact}>
                                            <Icon name="call" size={12} color="#7876e2" />
                                            {selectedProduct.userDetails.number}
                                        </Text>
                                    </TouchableOpacity>

                                </View>
                            </View>


                            {/* Close Button */}
                            <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "30%", marginTop: '10%' }}>
                                 <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <LinearGradient
                                        useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                        colors={['#ceceddff', '#60498fff', '#441678ff']}   // left dark → right light
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ padding: 5, borderRadius: 10 }}
                                    >
                                        <Text style={styles.closeButtonText}>Close</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

            </Modal>

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
                            <Text style={styles.titled}>Your Products</Text>

                        </View>
                    </View>
                </LinearGradient>

                {product.length == 0 ? (
                    <Text style={styles.noData}>You have not created any Product</Text>
                ) : (
                    <>
                        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} style={{ padding: 10, marginTop: '7%' }}
                            contentContainerStyle={styles.scrollContent}
                        >

                            {product.map((product, index) => (
                                <TouchableOpacity key={index} style={styles.card}
                                    onPress={() => {
                                        setSelectedProduct(product);
                                        setModalVisible(true)
                                    }}>
                                    {/* Title Section */}
                                    <View style={styles.topRoww}>
                                        <View style={styles.leftTop}>
                                            <Icon name="calendar" size={20} color="#555" />
                                            <View style={{ marginLeft: 12 }}>
                                                <Text style={styles.title}>{product.TITLE}</Text>
                                                <Text style={styles.subtitle}>
                                                    {new Date(product.DATE).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </Text>

                                            </View>
                                        </View>

                                        <View>
                                            <View style={{ alignItems: 'flex-start' }}>

                                                {product.FLAG == 1 ? (
                                                    <View style={{ backgroundColor: '#a3f7b2ff', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4 }}>
                                                        <Text style={{ color: '#08b436ff', fontWeight: 'bold', fontSize: 12 }}>Sell</Text>
                                                    </View>
                                                ) : (
                                                    <View style={{ backgroundColor: '#f3a2a2ff', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4 }}>
                                                        <Text style={{ color: '#990b0bff', fontWeight: 'bold', fontSize: 12 }}>Sold</Text>
                                                    </View>
                                                )}



                                            </View>
                                            <View>
                                                <Text></Text>
                                            </View>
                                        </View>





                                    </View>


                                    {/* Divider */}
                                    {/* <View style={styles.divider} /> */}

                                    {/* Bottom Section */}
                                    {/* <View style={styles.bottomRow}>
                                                                   <View style={styles.avatarGroup}>
                           
                                                                   </View>
                                                                   <View>
                           
                                                                   </View>
                                                               </View> */}
                                </TouchableOpacity>
                            ))}

                        </ScrollView>
                    </>
                )}

                {/* Create Service Button */}
                <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('CreateProduct')}>
                    <Icon name="add" size={28} color="black" />
                </TouchableOpacity>





            </View>
        </>

    )
}


export default UserProduct

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
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
    card: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        elevation: 3
    },

    title: {
        fontSize: 16,
        fontWeight: '700',
        color: "#333"
    },
    subtitle: {
        fontSize: 13,
        color: "#333"
    },
    divider: {
        backgroundColor: "#eee",
        height: 1,
        marginVertical: 10
    },

    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    topRoww: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    leftTop: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    noData: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#777',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', // thoda dark overlay for focus
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        // alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 10,
    },
    modalHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        flexWrap: 'wrap',
    },
    modalPriceTag: {
        // backgroundColor: '#60498f',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    modalPriceText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalImage: {
        width: '100%',
        height: 220,
        borderRadius: 15,
        marginVertical: 15,
    },
    modalDesc: {
        fontSize: 14,
        color: '#555',
        // textAlign: 'center',
        marginBottom: 15,

    },
    modalUser: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 5,
        color: '#333',
    },
    modalUserDetails: {
        fontSize: 14,
        // fontWeight: '500',
        marginBottom: 5,
        color: '#353030ff',
        marginLeft: 3,

    },
    modalContact: {
        fontSize: 14,
        // fontWeight: '500',
        marginBottom: 5,
        color: '#7876e2',
        marginLeft: 3,

    },
    closeButton: {
        marginTop: 15,
        backgroundColor: '#60498f',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 60,
        right: 20,
        backgroundColor: 'white',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    icon: {
        width: 20,
        height: 20,
        marginLeft: 4,
    }
})