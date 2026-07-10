import { StyleSheet, Text, ScrollView, RefreshControl } from 'react-native';
import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const Welcome = ({ navigation, setModules }) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://172.16.16.215:5000/RWA/User/modules', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const modules = response.data.modules ?? [];
      console.log('Modules:', modules);

      if (modules.length > 0) {
        await AsyncStorage.setItem('modules', JSON.stringify(modules));

        // Update Route.js state to re-render Home/Drawer
        if (setModules) setModules(modules);
      }
    } catch (error) {
      console.log('Error fetching modules:', error.message);
    } finally {
      setRefreshing(false);
    }
  }, [setModules]);


  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>
        Your account is active, but an admin has not assigned your role yet.
      </Text>
      <Text style={styles.info}>
        Pull down to refresh and check if your role has been assigned.
      </Text>
    </ScrollView>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f0f7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4a4aff',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 17,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  info: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
