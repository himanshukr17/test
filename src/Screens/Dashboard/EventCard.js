import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const EventCard = ({ icon, title, subtitle, avatars, people, age, status }) => {
  return (
    <View style={styles.card}>
      {/* Top Section */}
      <View style={styles.topRow}>
        <View style={styles.leftTop}>
          <Icon name='calendar' size={20} color="#555" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        <View >
          <Image
           source={
              status == '0'
                ? require('../../assets/images/coming_soon.png')
                : status == '1'
                  ? require('../../assets/images/live.png')
                  : require('../../assets/images/expired.png') // flag == 2
            }
            style={styles.statusImage}
            resizeMode="contain"
          />
        </View>


      </View>

      {/* Light Divider Line */}
      <View style={styles.separator} />

      {/* Bottom Section */}
      <View style={styles.bottomRow}>
        <View style={{ flexDirection: 'row' }}>
          {avatars.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={[styles.avatar, { marginLeft: index === 0 ? 0 : -10 }]}
            />
          ))}
        </View>
        {/* <Text style={styles.time}>{people}</Text> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
    // width: 230,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  statusImage: {
    width: 80,
    height: 50,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#fff',
  },
  time: {
    fontSize: 12,
    color: 'black',
  },
  leftTop: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding:10
  },
});

export default EventCard;
