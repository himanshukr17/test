import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const AllEventCard = ({ icon, title, subtitle, avatars, people, age, status, flag }) => {
  return (
    <View style={styles.card}>
      {/* Title Section */}
      <View style={styles.topRow}>
        <View style={styles.leftTop}>
          <Icon name={icon} size={20} color="#555" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        <View >
          <Image
            source={
              flag == '0'
                ? require('../../assets/images/coming_soon.png')
                : flag == '1'
                  ? require('../../assets/images/live.png')
                  : require('../../assets/images/expired.png') // flag == 2
            }

            style={styles.statusImage}
            resizeMode="contain"
          />
        </View>


      </View>


      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Section */}
      <View style={styles.bottomRow}>
        <View style={styles.avatarGroup}>
          {avatars.map((uri, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              style={[
                styles.avatar,
                { marginLeft: idx === 0 ? 0 : -10 },
              ]}
            />
          ))}
        </View>
        <View>
          <Text style={styles.people}>{people} registerations</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 3
  },
  statusImage: {
    width: 100,
    height: 50,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center'
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
  avatarGroup: {
    flexDirection: 'row'
  },
  avatar: {
    height: 30,
    width: 30,
    borderRadius: 20,
    borderColor: "#fff",
    borderWidth: 1
  },
  people: {
    fontSize: 13,
    color: '#444'
  },
  leftTop: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  // statusBadge: {
  //   paddingHorizontal: 10,
  //   paddingVertical: 4,
  //   borderRadius: 20,
  //   alignSelf: 'flex-start',

  // },
  // live: {
  //   backgroundColor: 'red'
  // },
  // comingSoon: {
  //   backgroundColor: '#ffc107'
  // },
  // statusText: {
  //   color: 'white',
  //   fontSize: 12,
  //   fontWeight: 'bold',
  // }


});

export default AllEventCard;
