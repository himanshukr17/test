import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Modal, RefreshControl } from 'react-native';
import AllEventCard from './AllEventCard';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Iconn from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';




const AllEvent = ({ navigation }) => {
    const [events, setEvents] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredEvents, setFilteredEvents] = useState(events);
    const [selectedAges, setSelectedAges] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [minAge, setMinAge] = useState(0);
    const [maxAge, setMaxAge] = useState(100);
    const [selectedGender, setSelectedGender] = useState([]);
    const [selectedPricing, setSelectedPricing] = useState([]);
    const [selectedEventType, setSelectedEventType] = useState([]);
    const [showClearModal, setShowClearModal] = useState(false);
    const [selectedFilterCategory, setSelectedFilterCategory] = useState('Age');
    const [eventType, setEventType] = useState('');



    //reset all the data when we exit from the page
    useFocusEffect(
        React.useCallback(() => {
            setShowFilter(false);
            setSelectedAges('');
            setSearchText('');

        }, [])
    );


    // Fetch events from the API
    const fetchEvents = async () => {
        console.log("fetchEvents triggered");
        try {
            setRefreshing(true); //  Start refreshing
            const response = await axios.get("http://172.16.16.215:5000/RWA/Event/all");

            console.log("API Raw Response:", response.data);

            const countsResponse = await axios.get("http://172.16.16.215:5000/RWA/EventTransaction/count");

            const countMap = {};
            countsResponse.data.data.forEach(item => {
                countMap[item.EVENT_ID] = item.count;
            });

            const mapped = response.data.map(item => ({
                title: item.EVENT_TITLE,
                subtitle: item.VENUE,
                avatars: [
                    `http://172.16.16.215:5000/${item.ORGANIZER_IMAGE?.replace(/\\/g, '/')}`,
                    `http://172.16.16.215:5000/${item.CHAIRMAN_IMAGE?.replace(/\\/g, '/')}`,
                ],
                age: item.APPLICABLE_FOR_AGE?.toString() || '',
                icon: 'calendar',
                status: item.FLAG,
                desc: item.EVENT_DESC,
                type: item.EVENT_TYPE,
                fees: item.EVENT_FEE,
                from: item.VALID_FROM,
                till: item.VALID_TILL,
                organizer: item.ORGANIZER_NAME,
                chairman: item.CHAIRMAN_NAME,
                sponsors: item.EVENT_SPONSERS_DETAILS,
                guest: item.EVENT_GUEST_DETAILS,
                poster: item.EVENT_POSTER,
                fee_type: item.EVENT_FEE_TYPE,
                event_id: item.EVENT_ID,
                people: countMap[item.EVENT_ID] || 0,
                time: item.TIME,
                org_contact: item.ORGANIZER_NUMBER,
                chairman_contact: item.CHAIRMAN_NUMBER,
                gender: item.APPLICABLE_FOR_GENDER,
                gallery: item.EVENT_GALLERY,
                flag: item.FLAG
            }));

            setEvents(mapped);
            setRefreshing(false); //  Stop refreshing
        } catch (error) {
            console.error("Error fetching events:", error);
            setRefreshing(false); //  Stop on error 
        }
    };


    //fetch event type
    const fetchEventType = async () => {
        try {
            const res = await axios.get("http://172.16.16.215:5000/RWA/EventCategories/all",{ params: { status: 1 } });
            if (res.status === 200) {
                setEventType(res.data);
                console.log("categories:", res.data);
            }

        } catch (error) {
            console.error(error);
        }


    }


    useEffect(() => {
        fetchEvents();
        fetchEventType();
    }, []);


    // Filter events based on search text and selected filters
    useEffect(() => {
        const filtered = events.filter(event => {
            const matchesTitle = event.title.toLowerCase().includes(searchText.toLowerCase());

            const age = parseInt(event.age);
            const matchesAge = (!isNaN(age) && age >= minAge && age <= maxAge);

            const matchesGender = selectedGender.length === 0 || selectedGender.includes(event.gender);
            const matchesPricing =
                selectedPricing.length === 0 ||
                selectedPricing.map(p => p.toLowerCase()).includes(event.fee_type?.toLowerCase());

            const matchesType =
                selectedEventType.length === 0 ||
                selectedEventType.map(t => t.toLowerCase()).includes(event.type?.toLowerCase());


            return matchesTitle && matchesAge && matchesGender && matchesPricing && matchesType;
        });

        setFilteredEvents(filtered);
    }, [searchText, events, minAge, maxAge, selectedGender, selectedPricing, selectedEventType]);


    // Render checkbox for filter options
    // This function creates a checkbox with a label
    const renderCheckbox = (label, selectedArray, setSelectedArray) => {
        const isSelected = selectedArray.includes(label);

        const toggleSelection = () => {
            if (isSelected) {
                setSelectedArray(selectedArray.filter(item => item !== label));
            } else {
                setSelectedArray([...selectedArray, label]);
            }
        };

        return (
            <TouchableOpacity
                key={label}
                style={styles.checkboxContainer}
                onPress={toggleSelection}
            >
                <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
                    {isSelected && (
                        <Icon name="check" size={12} color="white" />
                    )}
                </View>
                <Text style={styles.checkboxLabel}>{label}</Text>
            </TouchableOpacity>
        );
    };




    return (
        <>
            {/** Clear Filters Modal **/}
            <Modal
                visible={showClearModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowClearModal(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <View style={{ width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: 'black' }}>
                            Clear Filters
                        </Text>
                        <Text style={{ fontSize: 14, marginBottom: 20, color: '#444' }}>
                            Are you sure you want to clear all filters?
                        </Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <TouchableOpacity
                                onPress={() => setShowClearModal(false)}
                                style={{ marginRight: 15 }}
                            >
                                <Text style={{ color: '#888', fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    setMinAge(0);
                                    setMaxAge(100);
                                    setSelectedGender([]);
                                    setSelectedPricing([]);
                                    setSelectedEventType([]);
                                    setShowClearModal(false);
                                    setShowFilter(false);
                                }}
                            >
                                <Text style={{ color: 'red', fontWeight: 'bold' }}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/*Title*/}
            <LinearGradient
                colors={['#ccccf6ff', '#e1e1e5ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <View style={styles.header}>
                    <View style={styles.topRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                            <Iconn name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.titled}>All Events</Text>

                    </View>
                </View>
            </LinearGradient>
            <View style={styles.container}>



                {/*Search bar*/}
                <View style={styles.searchFilterRow}>
                    <View style={styles.searchInputContainer}>
                        <TextInput
                            placeholder="Search event..."
                            placeholderTextColor="black"
                            style={styles.searchInput}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {/*Cross Icon*/}
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearIcon}>
                                <Icon name="times-circle" size={18} color="#888" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/*Filter Button*/}
                    <TouchableOpacity onPress={() => setShowFilter(!showFilter)}>
                        <Icon name="filter" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                {/*Modal to select filter*/}
                <Modal
                    visible={showFilter}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowFilter(false)}
                >
                    <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', flex: 1 }}>

                        <View style={{ width: '90%', borderRadius: 20, paddingTop: 20, paddingBottom: 20, backgroundColor: '#fff', marginTop: '50%', alignSelf: 'center' }}>
                            <View style={{ flexDirection: 'row', alignSelf: 'center', }}>


                                {/* Left Side Menu */}
                                <View style={{ width: '30%', backgroundColor: '#fff', paddingVertical: 20 }}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 30, paddingLeft: 16, color: 'black' }}>Filters</Text>
                                    {['Age', 'Gender', 'Pricing', 'Event Type'].map((category) => (
                                        <TouchableOpacity
                                            key={category}
                                            onPress={() => setSelectedFilterCategory(category)}
                                            style={{
                                                paddingVertical: 11,
                                                paddingHorizontal: 16,
                                                backgroundColor: selectedFilterCategory === category ? '#eee' : 'white',
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#ddd',
                                            }}
                                        >
                                            <Text style={{ color: 'black', fontWeight: selectedFilterCategory === category ? 'bold' : 'normal' }}>
                                                {category}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}

                                    {/* Clear Filters Button */}


                                </View>


                                {/* Right Side Content */}
                                <View style={{ width: '65%', backgroundColor: '#fff', padding: 16, flex: 1 }}>
                                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                                        <View style={{ paddingRight: 10 }}>
                                            {selectedFilterCategory === 'Age' && (
                                                <>
                                                    <Text style={styles.dropdownHeading}>Select Age Range ({minAge} - {maxAge})</Text>
                                                    <View style={{ width: 80, height: 30 }}>
                                                        <MultiSlider
                                                            values={[minAge, maxAge]}
                                                            min={0}
                                                            max={100}
                                                            step={1}
                                                            allowOverlap={false}
                                                            snapped
                                                            onValuesChange={(values) => {
                                                                setMinAge(values[0]);
                                                                setMaxAge(values[1]);
                                                            }}
                                                            selectedStyle={{
                                                                backgroundColor: '#4a90e2',
                                                            }}
                                                            unselectedStyle={{
                                                                backgroundColor: '#d3d3d3',
                                                            }}
                                                            markerStyle={{
                                                                backgroundColor: '#4a90e2',
                                                            }}
                                                            // containerStyle={{width: '100%', marginTop: 10,backgroundColor:'green'}}
                                                            sliderLength={180}
                                                        />
                                                    </View>

                                                    <Text style={{ fontSize: 14, color: '#555', textAlign: 'center', marginTop: 8 }}>
                                                        Age Range: <Text style={{ fontWeight: 'bold' }}>{minAge} - {maxAge}</Text>
                                                    </Text>
                                                </>
                                            )}


                                            {selectedFilterCategory === 'Gender' && (
                                                <>
                                                    <Text style={styles.dropdownHeading}>Gender</Text>
                                                    {['Men', 'Women'].map((g) => renderCheckbox(g, selectedGender, setSelectedGender))}
                                                </>
                                            )}

                                            {selectedFilterCategory === 'Pricing' && (
                                                <>
                                                    <Text style={styles.dropdownHeading}>Pricing</Text>
                                                    {['Free', 'Paid'].map((type) => renderCheckbox(type, selectedPricing, setSelectedPricing))}
                                                </>
                                            )}

                                            {selectedFilterCategory === 'Event Type' && (
                                                <>
                                                    <Text style={styles.dropdownHeading}>Event Type</Text>
                                                    {eventType.map((category) =>
                                                        renderCheckbox(category.EVENT_CATEGORY_NAME, selectedEventType, setSelectedEventType)
                                                    )}
                                                </>
                                            )}

                                        </View>

                                        {/* Fixed Bottom Apply Button */}


                                    </View>
                                </View>



                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 10 }}>
                                <TouchableOpacity
                                    style={{

                                        backgroundColor: '#ef9393ff',
                                        paddingVertical: 10,
                                        paddingHorizontal: 20,
                                        borderRadius: 8,

                                    }}
                                    onPress={() => setShowClearModal(true)}

                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Clear All</Text>

                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setShowFilter(false)}
                                    style={{

                                        backgroundColor: '#85b3e7ff',
                                        paddingVertical: 10,
                                        paddingHorizontal: 20,
                                        borderRadius: 8,

                                    }}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
                                </TouchableOpacity>
                            </View>

                        </View>




                    </View>

                </Modal>




                {/* List of Events */}
                {/* <ScrollView contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={fetchEvents}

                        />
                    }
                >

                    {filteredEvents.map((event, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => navigation.navigate("CurrentEvent", { event })}
                            activeOpacity={0.9}
                            style={{ width: '100%' }}>

                            <AllEventCard
                                key={index}
                                icon={event.icon}
                                title={event.title}
                                subtitle={event.subtitle}
                                avatars={event.avatars}
                                people={event.people}
                                age={event.age}
                                status={event.status}
                                flag={event.flag}
                            />
                        </TouchableOpacity>

                    ))}
                </ScrollView> */}


                <FlatList
                    data={filteredEvents}
                    keyExtractor={(item, index) => item.event_id?.toString() || index.toString()}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={fetchEvents}
                        />
                    }
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => navigation.navigate("CurrentEvent", { event: item })}
                            activeOpacity={0.9}
                            style={{ width: '100%' }}
                        >
                            <AllEventCard
                                icon={item.icon}
                                title={item.title}
                                subtitle={item.subtitle}
                                avatars={item.avatars}
                                people={item.people}
                                age={item.age}
                                status={item.status}
                                flag={item.flag}
                            />
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingBottom: 40, margin: 5 }}
                />
            </View>
        </>

    );
};

export default AllEvent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f8fc',
        padding: 16,
    },
    headingContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    ageInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        minWidth: 60,
        backgroundColor: '#fff',
        color: 'black',
        marginRight: 8
    },

    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,

    },
    searchInput: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        fontSize: 16,
        marginBottom: 12,
    },
    filterNote: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    scrollContent: {
        paddingBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10
    },
    searchFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    searchInputContainer: {
        position: 'relative',
        flex: 1,
        marginRight: 10,
    },

    searchInput: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderColor: '#ccc',
        borderWidth: 1,
        fontSize: 16,
        paddingRight: 30, // leave space for the cross
        color: 'black'
    },

    clearIcon: {
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: [{ translateY: -10 }],
    },
    dropdown: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
    },

    dropdownHeading: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textDecorationLine: 'underline',

    },

    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    checkbox: {
        width: 15,
        height: 15,
        borderWidth: 1,
        borderColor: '#555',
        borderRadius: 4,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        color: 'blue'
    },


    checkedBox: {
        backgroundColor: '#4a90e2', // Blue background when selected
        borderColor: '#4a90e2',
    },

    checkboxLabel: {
        fontSize: 14,
        color: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // dark background
        // marginTop: '35%',
        padding: 20
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
