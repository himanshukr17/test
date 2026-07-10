import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Text, Button, TouchableOpacity, Alert, Pressable, ScrollView, Image, FlatList, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';

import { Provider } from 'react-redux';
import { store } from './src/redux/store/store';

import Route from './src/Route';
import { notificationListeners, requestUserPermission } from './firebase';
import { ToastProvider } from 'react-native-toast-notifications';


enableScreens();

function App() {

  useEffect(() => {
    requestUserPermission();     // Ask notification permission
    notificationListeners();     // Listen for notifications
  }, []);

  return (
    <Provider store={storee}>
      <ToastProvider>
        <Route />
      </ToastProvider>


    </Provider>

  );
}



export default App;
