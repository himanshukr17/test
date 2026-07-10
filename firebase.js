
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Create a channel (one-time)
async function createNotificationChannel() {
    await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
    });
}

// Request permissions
export async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();

    const userID = await AsyncStorage.getItem('userId');

    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log(' Notification permission granted.');
        await messaging().getToken().then(async token => {
            console.log(' FCM Token:', token);

            try {
                await axios.post('http://172.16.16.215:5000/RWA/ServiceTransaction/token', {
                    userId: userID,   //  user ka actual ID
                    token: token
                });
                console.log(' Token sent to backend');
            } catch (error) {
                console.log(' Failed to send token:', error);
            }

        });
        await createNotificationChannel();
    }
}

// Listeners
export const notificationListeners = async () => {
    // Foreground notification
    messaging().onMessage(async remoteMessage => {
        console.log(' Foreground Message:', remoteMessage);

        await notifee.displayNotification({
            title: remoteMessage.notification?.title || 'Notification',
            body: remoteMessage.notification?.body || 'Message body',
            android: {
                channelId: 'default',
                smallIcon: 'ic_launcher',
                pressAction: {
                    id: 'default',
                },
            },
        });
    });

    // App opened from background
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(' Opened from background:', remoteMessage.notification);
    });

    // App opened from quit
    const initialMessage = await messaging().getInitialNotification();
    if (initialMessage) {
        console.log(' Opened from quit:', initialMessage.notification);
    }
};
