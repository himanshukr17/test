import { StyleSheet, Text, TouchableOpacity, View, FlatList, Image, TextInput, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';


const RDirectory = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState("");


    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get("http://172.16.16.215:5000/RWA/User/resident");
            if (res.data.success) {
                setUsers(res.data.users);
                setFilteredUsers(res.data.users);

            }
        } catch (error) {
            console.error("Error fetching residents:", error);
        }
    };

    const handleSearch = (text) => {
        setSearchText(text);
        if (text.trim() === "") {
            setFilteredUsers(users);
            return;
        } else {
            const filtered = users.filter((item) => {
                const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
                return fullName.includes(text.toLowerCase());
            })
            setFilteredUsers(filtered);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>

            <Image
                source={{
                    uri: item.image ? `http://172.16.16.215:5000/${item.image.replace(/\\/g, '/')}`
                        : `https://avatar.iran.liara.run/username?username=${item.first_name} ${item.last_name}`
                }}
                style={styles.avatar}
            />
            <View style={{ flexDirection: "row", justifyContent: 'space-between', alignItems: "center", width: '80%' }}>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                    <View>
                        <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                        {item.allowed &&
                            <View style={styles.phoneWrapper}>
                                {item.flat_no && item.floor && item.block_no &&
                                    <View style={styles.callButton}>
                                        <Icon name="home" size={16} color="black" />
                                        <Text style={styles.callText}>{item.flat_no || ''}</Text>
                                        <Text style={styles.callText}>{item.floor || ''}</Text>
                                        <Text style={styles.callText}>Block:{item.block_no || ''}</Text>

                                    </View>
                                }

                            </View>
                        }
                    </View>

                    <View>
                        {item.type === 2 && (
                            <Image source={require('../../assets/images/green.png')} style={styles.icon} />
                        )}

                        {item.type == 1 && (
                            <>
                                {item.status == 0 && (
                                    <Image source={require('../../assets/images/grey.png')} style={styles.icon} />
                                )}
                                {item.status == 1 && (
                                    <Image source={require('../../assets/images/blue.png')} style={styles.icon} />
                                )}
                            </>
                        )}
                    </View>

                </View>


                <View>
                    {item.allowed &&
                        <View style={styles.phoneWrapper}>
                            {/*Call button*/}
                            <TouchableOpacity onPress={() => {
                                const phone = item.number;
                                if (phone) Linking.openURL(`tel:${phone}`);
                            }} style={styles.callButton}>
                                <View style={{ height: 25, width: 25, backgroundColor: "#7876e2", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                                    <Icon name="call" size={12} color="white" />
                                </View>

                            </TouchableOpacity>
                        </View>
                    }
                </View>

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
                        <Text style={styles.titled}>Resident Directory</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="gray" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholderTextColor="gray"
                    placeholder="Search by name..."
                    value={searchText}
                    onChangeText={handleSearch}
                />
            </View>

            <FlatList
                data={filteredUsers}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                initialNumToRender={20}   // first render 20
                maxToRenderPerBatch={30}  // render in batches
                windowSize={10}           // keeps ~10 screens in memory
                removeClippedSubviews={true} // remove items outside screen
            />
        </View>
    );
};

export default RDirectory;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 5 },
    topRow: { position: 'relative', width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', marginTop: '2%' },
    backIcon: { position: 'absolute', left: 16, zIndex: 1 },
    titled: { fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'center' },
    card: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', marginTop: '2%' },
    avatar: { width: 35, height: 35, borderRadius: 20, marginRight: 12 },
    name: { fontSize: 16, fontWeight: '600', color: 'black' },
    number: { fontSize: 14, color: 'gray' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: '5%',
        marginHorizontal: 16,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 8,
        color: 'black', // typed text visible
    },
    phoneWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: "5%",

    },

    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7
    },

    callText: {
        color: 'black',
        fontWeight: '600',
        fontSize: 14,

    },
    icon: {
        width: 13,
        height: 13,
        marginTop: 4,
    }



});
