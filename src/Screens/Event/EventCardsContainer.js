import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import EventCard from '../Dashboard/EventCard';
import { useNavigation } from '@react-navigation/native';

const EventCardsContainer = () => {
    const navigation = useNavigation();
    const [eventData, setEventData] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get("http://172.16.16.215:5000/RWA/Event/all");
                setEventData(res.data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'flex-start', paddingBottom: 10,marginTop:10 }}
        >
            {eventData.slice(0, 2).map((event, index) => (
                <TouchableOpacity
                    key={index}
                    onPress={() =>
                        navigation.navigate('CurrentEvent', {
                            event: {
                                title: event.EVENT_TITLE,
                                subtitle: event.VENUE,
                                avatars: [
                                    `http://172.16.16.215:5000/${event.ORGANIZER_IMAGE?.replace(/\\/g, '/')}`,
                                    `http://172.16.16.215:5000/${event.CHAIRMAN_IMAGE?.replace(/\\/g, '/')}`,
                                ],
                                age: event.APPLICABLE_FOR_AGE?.toString() || '',
                                icon: 'calendar',
                                status: event.FLAG,
                                desc: event.EVENT_DESC,
                                type: event.EVENT_TYPE,
                                fees: event.EVENT_FEE,
                                from: event.VALID_FROM,
                                till: event.VALID_TILL,
                                organizer: event.ORGANIZER_NAME,
                                chairman: event.CHAIRMAN_NAME,
                                sponsors: event.EVENT_SPONSERS_DETAILS,
                                guest: event.EVENT_GUEST_DETAILS,
                                poster: event.EVENT_POSTER,
                                fee_type: event.EVENT_FEE_TYPE,
                                event_id: event.EVENT_ID,
                                people: 0,
                                time: event.TIME,
                                org_contact: event.ORGANIZER_NUMBER,
                                chairman_contact: event.CHAIRMAN_NUMBER,
                            }
                        })
                    }
                    activeOpacity={0.8}
                >
                    <EventCard
                        title={event.EVENT_TITLE}
                        subtitle={event.VENUE}
                        avatars={[
                            `http://172.16.16.215:5000/${event.ORGANIZER_IMAGE?.replace(/\\/g, '/')}`,
                            `http://172.16.16.215:5000/${event.CHAIRMAN_IMAGE?.replace(/\\/g, '/')}`,
                        ]}
                        age={event.APPLICABLE_FOR_AGE}
                        status={event.FLAG}
                    />
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

export default EventCardsContainer;
