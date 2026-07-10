// QrCodeScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';

const QrCodeScreen = ({ route, navigation }) => {
  const { qrData } = route.params;
  const { event } = route.params;

  useEffect(() => {
    console.log("Event Qr object:", event);
    console.log("Event Qr data:", qrData);
  }, []);


  { /* Function to format time to 12-hour format */ }
  const formatTimeTo12Hour = (timeString) => {
    const [hour, minute] = timeString.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };

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
          <Text style={styles.titled}>Event Booking Details</Text>
        </View>
      </View>
      </LinearGradient>


      <View>

        <View style={styles.cardContainer}>


          <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#dee6e7ff', borderTopLeftRadius: 15, borderTopRightRadius: 15 }} >
            <View>
              {event.poster ? (

                <Image
                  source={{ uri: `http://172.16.16.215:5000/${event.poster}` }}
                  style={{ width: 100, height: 100, resizeMode: 'cover', borderRadius: 10, marginBottom: 15, borderWidth: 0.5 }}
                />

              ) : (
                <Text style={{ color: 'gray' }}>No poster available</Text>
              )}
            </View>
            <View style={{ paddingLeft: 10 }}>
              <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold', marginBottom: 2, }}>{event.title}</Text>
              <Text style={{ color: 'black', fontSize: 12, marginBottom: 2, }}>
                <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }} >Venue: </Text>
                {event.subtitle}</Text>
              <Text style={{ color: 'black', fontSize: 12, marginBottom: 2, }}>
                <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }} >From: </Text>
                {new Date(event.from).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}</Text>

              <Text style={{ color: 'black', fontSize: 12, marginBottom: 2, }}>
                <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }} >Till: </Text>
                {new Date(event.till).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}</Text>

              <Text style={{ color: 'black', fontSize: 12, marginBottom: 2, }}>
                <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }} >Time: </Text>
                {formatTimeTo12Hour(event.time)}</Text>
            </View>
          </View>
          <View style={styles.cutLineContainer}>
            <View style={styles.dottedLine} />
            <Text style={styles.scissor}>✂</Text>
            <View style={styles.dottedLine} />
          </View>


          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={styles.text}>Your Event QR Code</Text>

            {/* QR Code Display */}
            <QRCode
              value={JSON.stringify(qrData)}
              size={250}
              backgroundColor="transparent"
              color="#000"
            />
          </View>

          <View style={styles.cutLineContainer}>
            <View style={styles.dottedLine} />
            <Text style={styles.scissor}>✂</Text>
            <View style={styles.dottedLine} />
          </View>

          <View >
            <Text style={{ marginBottom: 5, color: 'black', fontSize: 15, fontWeight: 'bold' }}>
              Note:
            </Text>
            <Text style={{ color: 'black', fontSize: 12, marginBottom: 3 }}>
              <Icons name="dot-circle" size={12} color="black" />
              <Text> This booking cannot be cancelled as per event policy.</Text>
            </Text>
            <Text style={{ color: 'black', fontSize: 12, marginBottom: 3 }}>
              <Icons name="dot-circle" size={12} color="black" /><Text>{" "}</Text>
              <Text style={{ marginLeft: 100 }}>Show this QR code at the entry gate for access.</Text>
            </Text>
          </View>


        </View>
      </View>



    </View>
  );
};


export default QrCodeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  textSmall: {
    marginTop: 20,
    color: 'gray'
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
  cutLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 10
  },
  dottedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'gray',
  },
  scissor: {
    paddingHorizontal: 8,
    fontSize: 16,
    color: 'gray',
  },
  cardContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 15,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    transform: [{ scale: 1 }],
  },

});
