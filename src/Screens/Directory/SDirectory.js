import { StyleSheet, Text, TouchableOpacity, View, FlatList, Image, TextInput, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import Iconn from 'react-native-vector-icons/FontAwesome'; // use star icons


const SDirectory = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState("");


    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get("http://172.16.16.215:5000/RWA/User/serviceAgent");
            if (res.data.success) {
                setUsers(res.data.data);
                setFilteredUsers(res.data.data);
                // console.log("Users:", res.data);
            }
        } catch (error) {
            console.error("Error fetching residents:", error);
        }
    };
    console.log("Filtered Users:", filteredUsers);

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


  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars.push(<Iconn key={i} name="star" size={8} color="#FFD700" style={{marginRight: 2}} />);
        } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
            stars.push(<Iconn key={i} name="star-half-o" size={8} color="#FFD700" style={{marginRight: 2}} />);
        } else {
            stars.push(<Iconn key={i} name="star-o" size={8} color="#FFD700" style={{marginRight: 2}} />);
        }
    }
    return <View style={{flexDirection: 'row', marginTop: 2}}>{stars}</View>;
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
            <View style={{ flexDirection: "row", justifyContent: 'space-between', width: '80%' }}>
                <View style={{ flexDirection: 'row',gap:5 }}>
                    <View>
                        <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                        
                        <View style={styles.phoneWrapper}>
                            {/*Call button*/}
                            <TouchableOpacity onPress={() => {
                                const phone = item.number;
                                if (phone) Linking.openURL(`tel:${phone}`);
                            }} style={styles.callButton}>
                                <Icon name="call" size={16} color="#7876e2" />
                                <Text style={styles.callText}>{item.number || ''}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View>
                        {item.rating && renderStars(item.rating)}
                    </View>
                </View>


                <View >
                    {item.services && item.services.length > 0 && item.services.map((service, index) => (
                        <View key={index} style={{ backgroundColor: '#ccccf6ff', padding: 2, borderRadius: 10, marginBottom: 5, alignItems: 'center', paddingHorizontal: 5 }}>
                            <Text style={{ color: 'black', fontSize: 12, fontWeight: '500' }}>
                                {service}
                            </Text>
                        </View>
                    ))}
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
                        <Text style={styles.titled}>Service Agent Directory</Text>
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

export default SDirectory;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 5 },
    topRow: { position: 'relative', width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', marginTop: '2%' },
    backIcon: { position: 'absolute', left: 16, zIndex: 1 },
    titled: { fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'center' },
    card: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', marginTop: '5%' },
    avatar: { width: '12%', height: '90%', borderRadius: 20, marginRight: 12 },
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
        color: '#7876e2',
        fontWeight: '600',
        fontSize: 14,

    },



});
