import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Modal, Image } from 'react-native';
import CustomHeader from '../../Component/CustomHeader';
import InputField from '../../Component/InputField';
import MiniCard from './MiniCard';
import { ScrollView } from 'react-native-gesture-handler';
import Category from './Category';
import EventCard from './EventCard';
import Actions from './Actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Advertisement from '../../Component/Advertisement';
import Icon from 'react-native-vector-icons/Ionicons';
import EventCardsContainer from '../Event/EventCardsContainer';
import axios from 'axios';
import Icons from 'react-native-vector-icons/MaterialIcons'
import { StyleSheet } from 'react-native/types_generated/index';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';


const Home = ({ navigation, props }) => {
  const handleBellPress = () => {
    // navigation.navigate('Notification');
    console.log('navigation');
  };

  const [modules, setModules] = useState([]);
  const [ads, setAds] = useState([]);


  // Fetch ads from API
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get(
          'http://172.16.16.215:5000/RWA/Advertisement/all',
          { params: { status: 1 } }

        );
        setAds(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAds();
  }, []);


  // Filter ads by position
  const topAds = ads.filter(ad => ad.NO_OF_COUNTER === 1);
  const midAds = ads.filter(ad => ad.NO_OF_COUNTER === 2);
  const bottomAds = ads.filter(ad => ad.NO_OF_COUNTER === 3);
  console.log("Top Ads:", topAds.length);


  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem('modules');
      if (stored) {
        const parsed = JSON.parse(stored);
        setModules(parsed);
        console.log("parsed:", parsed)
      }
      else {
        console.log("ni h kuch");
        setModules([]);
      }
    }
    load();
  }, [])



  const [user, setUser] = useState([])
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get('http://172.16.16.215:5000/RWA/User/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);

        console.log("userDate:", response.data.user)

      } catch (error) {
        console.error("Failed to load profile:", error);

      }
    };
    fetchUserProfile();
  }, [])
  console.log("typeofUser:", user.type)

  useEffect(() => {
    const getAllData = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const result = await AsyncStorage.multiGet(keys);
        console.log("All data in AsyncStorage:", result);
      } catch (error) {
        console.error(error);
      }
    };
    getAllData();
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchUnreadNotification();
    }, [])
  );

  const fetchUnreadNotification = async (req, res) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await axios.get(`http://172.16.16.215:5000/RWA/Notification/unreadCount/${userId}`);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: "#FFF", }} contentContainerStyle={{ paddingBottom: 50, }}>

        {/*Header*/}
        <LinearGradient
          colors={['#ccccf6ff', '#e1e1e5ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <CustomHeader
            navigation={navigation}
            title={user.first_name}
            showMenu={true}
            showTitle={true}
            showBell={modules.includes('Sos')}
            onBellPress={handleBellPress}
            backgroundColor="transparent"   // so gradient is visible
          />
        </LinearGradient>

        <LinearGradient
          colors={['#ccccf6ff', '#e1e1e5ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: user?.type === 4 ? '15%' : user?.type === 3 ? '12%' : '10%',

            // justifyContent: 'center',
            // paddingHorizontal: '10%',
            // paddingTop: '3%'
          }}
        >

          <Text
            style={{
              textAlign: 'center',
              fontSize: 20,
              fontWeight: '600',
              color: '#2c3e50',
            }}>

            {user.flat_no} - {user.floor}, Block {user.block_no}

          </Text>

          {/*Search Bar*/}
          <TextInput
            placeholder="        What are you looking for?"
            placeholderTextColor="#999"
            style={{
              marginTop: '4%',
              marginLeft: '10%',
              marginRight: '10%',
              backgroundColor: '#fff',
              borderRadius: 20,
              paddingHorizontal: 15,
              paddingVertical: 8,
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#ccc',
              

            }}
          />
        </LinearGradient>

        {/* Screen content */}
        <View
            style={{
              backgroundColor: 'white',
              marginTop: -20, // overlap upward
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              padding: 20,
              paddingTop: 0,
              zIndex: 0,

            }}>

            {/* Screen content */}
            <View style={{ paddingTop: 0 }} >

              {/* Top Advertisement */}
              {topAds.length > 0 && (
                <Advertisement
                  ads={topAds}
                  onPress={(ad) => navigation.navigate("AdvertisementDetails", { ad })}
                />
              )}

              {/* Directory */}
              <View style={{ paddingTop: topAds.length > 0 ? 0 : 20 }} >
                <Text style={{ color: '#2c3e50', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                  Directory
                </Text>
                {/* Scrollview in horizonatal direction */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'flex-start', marginTop: 5 }}>
                  {modules.includes("RDirectory") && (
                    <Category iconName="people" label="Resident" onPress={() => navigation.navigate("RDirectory")} />
                  )}

                  {modules.includes("GDirectory") && (
                    <Category iconName="people" label="Guard" onPress={() => navigation.navigate("GDirectory")} />
                  )}

                  {modules.includes("CDirectory") && (
                    <Category iconName="people" label="Committee" onPress={() => navigation.navigate("CDirectory")} />
                  )}

                  {modules.includes("SDirectory") && (
                    <Category iconName="people" label="Service Agent" onPress={() => navigation.navigate("SDirectory")} />
                  )}


                </ScrollView>
              </View>


              {/* Category */}
              <View style={{ marginTop: 10 }} >
                <Text style={{ color: '#2c3e50', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                  All Category
                </Text>
                {/* Scrollview in horizonatal direction */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'flex-start', marginTop: 5 }}>

                  {modules.includes("Attendance") && (
                    //  <Category iconName="calendar-number" label="Attendance" onPress={() => navigation.navigate("Attendance")} />
                    <Category
                      iconName="calendar-number"
                      label="Attendance"
                      onPress={() => {
                        console.log('Navigating to Attendance');
                        navigation.navigate("Attendance");
                      }}
                    />

                  )}
                  {modules.includes("AllServices") && (
                    <Category iconName="build-outline" label="Services" onPress={() => {
                      console.log('Navigating to my services');
                      navigation.navigate("AllServices");
                    }} />
                  )}
                  {modules.includes("QrScanner") && (
                    <Category iconName="scan" label="Event Scan" onPress={() => navigation.navigate("QrScanner")} />
                  )}
                  {modules.includes("ServicesRequest") && (
                    // <Category iconName="construct-outline" label="My Requests" onPress={() => navigation.navigate("ServicesRequest")} />
                    <Category
                      iconName="construct-outline"
                      label="My Requests"
                      onPress={() => {
                        console.log('Navigating to my requests');
                        navigation.navigate("ServicesRequest");
                      }}
                    />

                  )}



                  {modules.includes("AllCheckPoint") && (
                    <Category iconName="flag-checkered" label="Checkpoint" library="FontAwesome" onPress={() => navigation.navigate("AllCheckPoint")} />
                  )}

                  {modules.includes("Notifications") && (
                    <Category
                      iconName="notifications"
                      label="Notifications"
                      unreadCount={unreadCount}   // only here pass
                      onPress={() => navigation.navigate("Notifications")}
                    />
                  )}

                  {modules.includes("Scan") && (
                    <Category
                      iconName="car-sport"
                      label="Scan Vehicle"

                      onPress={() => navigation.navigate("Scan")}
                    />
                  )}


                  {modules.includes("EventFee") && (
                    <Category
                      iconName="qr-code-sharp"
                      label="Event Fee"

                      onPress={() => navigation.navigate("EventFee")}
                    />
                  )}

                  {modules.includes("UserEvents") && (
                    <Category
                      iconName="event"
                      label="User Events"
                      library='MaterialIcons'
                      onPress={() => navigation.navigate("UserEvents")}
                    />
                  )}

                  {modules.includes("UserComplaint") && (
                    <Category
                      iconName="alert-circle-outline"
                      label="Complaint"

                      onPress={() => navigation.navigate("UserComplaint")}
                    />
                  )}

                </ScrollView>
              </View>



              {/* Middle Advertisement */}
              {midAds.length > 0 && (
                <Advertisement
                  ads={midAds}
                  onPress={(ad) => navigation.navigate("AdvertisementDetails", { ad })}
                />
              )}


              {/* Vehicle */}

              {(modules.includes("Vechile") || modules.includes("QrScanVehicle") || modules.includes("VehicleQr")) && (
                <View style={{ marginTop: 10 }} >
                  <Text style={{ color: '#2c3e50', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                    Vehicle
                  </Text>
                  {/* Scrollview in horizonatal direction */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'flex-start', marginTop: 5 }}>



                    {modules.includes("Vechile") && (
                      <Category iconName="car" label="Add Vehicle" library="Fontisto" onPress={() => navigation.navigate("Vechile")} />
                    )}

                    {modules.includes("QrScanVehicle") && (
                      <Category
                        iconName="car-sport"
                        label="Scan Vehicle"

                        onPress={() => navigation.navigate("QrScanVehicle")}
                      />
                    )}


                    {modules.includes("VehicleQr") && (
                      <Category
                        iconName="qr-code-sharp"
                        label="Vehicle QR"

                        onPress={() => navigation.navigate("VehicleQr")}
                      />
                    )}


                  </ScrollView>
                </View>
              )}

              {/*  Events */}
              {modules.includes("AllEvent") && (
                <View style={{ marginTop: 20 }}>
                  {/* Header Row */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2c3e50' }}>Events</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("AllEvent")}>
                      <Text style={{ fontSize: 14, color: '#4a4aff' }} >See All</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Horizontal Scroll Cards */}
                  <EventCardsContainer />
                </View>
              )}




              {/* Products and scehemes */}

              {(modules.includes("Product") || modules.includes("UserProduct") || modules.includes("Scheme")) && (
                <View style={{ marginTop: 10 }} >
                  <Text style={{ color: '#2c3e50', fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 5 }}>
                    Products & Schemes/ Offers
                  </Text>
                  {/* Scrollview in horizonatal direction */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'flex-start', marginTop: 5 }}>

                    {modules.includes("UserProduct") && (
                      <Category
                        iconName="add-box"
                        label="Your Products"
                        library='MaterialIcons'
                        onPress={() => navigation.navigate("UserProduct")}
                      />
                    )}
                    {modules.includes("Product") && (
                      <Category
                        iconName="shopping-bag"
                        label="Product List"
                        library="Feather"
                        onPress={() => navigation.navigate("Product")}
                      />
                    )}

                    {modules.includes("Scheme") && (
                      <Category
                        iconName="document-text"
                        label="All Scheme"

                        onPress={() => navigation.navigate("Scheme")}
                      />
                    )}



                  </ScrollView>
                </View>
              )}





              {/* Bottom Advertisement */}
              {bottomAds.length > 0 && (
                <Advertisement
                  ads={bottomAds}
                  onPress={(ad) => navigation.navigate("AdvertisementDetails", { ad })}
                />
              )}




            </View>

          </View>

      </ScrollView>

    </>

  );
};

export default Home;

