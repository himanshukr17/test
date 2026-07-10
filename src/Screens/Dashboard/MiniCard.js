import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';



const MiniCard = ({ date, title, amount, dueDate, image }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.date}>{date}</Text>


      <View style={styles.contentRow}>
        <Image source={{ uri: image }} style={styles.image} />

        <View style={styles.textColumn}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.amount}>{amount}</Text>
        </View>
      </View>

      <Text style={styles.dueDate}>Due: {dueDate}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    paddingVertical: 8,         // ⬇ reduce vertical padding
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 12,
    width: 200,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 4,
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 6,
    textAlign: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
  },
  textColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MiniCard;
