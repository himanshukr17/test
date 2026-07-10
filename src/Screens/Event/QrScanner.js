// import React, { useEffect, useState } from 'react';
// import {
//     View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, PermissionsAndroid,
//     Platform,
// } from 'react-native';
// import QRCodeScanner from 'react-native-qrcode-scanner';
// import axios from 'axios';
// import { RNCamera } from 'react-native-camera';

// const QrScanner = () => {
//     const [scannedData, setScannedData] = useState(null);
//     const [loading, setLoading] = useState(false); //  Add loading state

//     const requestCameraPermission = async () => {
//         if (Platform.OS === 'android') {
//             try {
//                 const granted = await PermissionsAndroid.request(
//                     PermissionsAndroid.PERMISSIONS.CAMERA,
//                     {
//                         title: "Camera Permission",
//                         message: "App needs access to your camera to scan QR codes.",
//                         buttonNeutral: "Ask Me Later",
//                         buttonNegative: "Cancel",
//                         buttonPositive: "OK"
//                     }
//                 );
//                 if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//                     console.log("✅ Camera permission granted");
//                 } else {
//                     console.log("❌ Camera permission denied");
//                 }
//             } catch (err) {
//                 console.warn("Permission error:", err);
//             }
//         }
//     };

//     // Run once on component mount
//     useEffect(() => {
//         requestCameraPermission();
//     }, []);


//     const onSuccess = async (e) => {
//         try {
//             setLoading(true); // 👈 Start loading
//             const data = JSON.parse(e.data);
//             const { transactionId } = data;

//             if (!transactionId) {
//                 setLoading(false);
//                 Alert.alert("Invalid QR", "Transaction ID missing in QR.");
//                 return;
//             }

//             const res = await axios.get(`http://172.16.16.215:5000/RWA/EventTransaction/transaction`, {
//                 params: { TRANSACTION_ID: transactionId }
//             });

//             const txn = res.data.data;

//             if (txn.FLAG === 1) {
//                 setLoading(false);
//                 Alert.alert("Already Scanned", "This transaction has already been approved.");
//             } else {
//                 setScannedData({ ...data, FLAG: txn.FLAG });
//                 setLoading(false);
//             }

//         } catch (error) {
//             console.error("QR Scan Error:", error);
//             setLoading(false);
//             Alert.alert("Error", "Invalid or corrupted QR code.");
//         }
//     };

//     const handleApprove = async () => {
//         try {
//             setLoading(true); // 👈 Start loading
//             await axios.put(`http://172.16.16.215:5000/RWA/EventTransaction/approve`, {
//                 TRANSACTION_ID: scannedData.transactionId
//             });

//             setLoading(false);
//             Alert.alert("Approved", "Transaction approved successfully.");
//             setScannedData(null);
//         } catch (error) {
//             setLoading(false);
//             console.error("Approve Error:", error);
//             Alert.alert("Error", "Failed to approve transaction.");
//         }
//     };

//     const handleRescan = () => {
//         setScannedData(null);
//     };

//     return (
//         <View style={styles.container}>
//             {loading ? ( // 👈 Show loader when loading is true
//                 <View style={styles.loadingBox}>
//                     <ActivityIndicator size="large" color="#007AFF" />
//                     <Text style={{ marginTop: 10, color: 'black' }}>Processing...</Text>
//                 </View>
//             ) : !scannedData ? (
//                 <QRCodeScanner
//                     onRead={onSuccess}
//                     flashMode={RNCamera.Constants.FlashMode.off}
//                     showMarker={true}
//                     reactivate={true}
//                     reactivateTimeout={5000}
//                     cameraStyle={{ height: 400 }}
//                 />

//             ) : (
//                 <View style={styles.resultBox}>
//                     <Text style={styles.dataText}>Name: {scannedData.name}</Text>
//                     <Text style={styles.dataText}>Event: {scannedData.event}</Text>
//                     <Text style={styles.dataText}>Amount: ₹{scannedData.amount}</Text>

//                     <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
//                         <Text style={styles.approveText}>Approve</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity style={styles.cancelButton} onPress={handleRescan}>
//                         <Text style={styles.cancelText}>Scan Again</Text>
//                     </TouchableOpacity>
//                 </View>
//             )}
//         </View>
//     )
// }

// export default QrScanner;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#fff',
//     },
//     centerText: {
//         fontSize: 18,
//         padding: 20,
//         color: '#000',
//         textAlign: 'center',
//     },
//     resultBox: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingHorizontal: 20,
//     },
//     dataText: {
//         fontSize: 16,
//         marginBottom: 10,
//         color: 'black',
//         textAlign: 'center',
//     },
//     approveButton: {
//         backgroundColor: 'green',
//         padding: 12,
//         borderRadius: 10,
//         marginTop: 20,
//         width: '60%',
//         alignItems: 'center'
//     },
//     approveText: {
//         color: 'white',
//         fontWeight: 'bold'
//     },
//     cancelButton: {
//         marginTop: 15,
//         padding: 10,
//     },
//     cancelText: {
//         color: 'red',
//         fontWeight: 'bold'
//     },
//     loadingBox: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     }
// });


// import React, { useEffect, useState } from 'react';
// import { PermissionsAndroid, Platform, Text, TouchableOpacity, StyleSheet, Linking, View } from 'react-native';
// import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
// import { RNCamera } from 'react-native-camera';
// import QRCodeScanner from 'react-native-qrcode-scanner';

// const QrScanner = () => {
//     const [hasPermission, setHasPermission] = useState(false);

//     useEffect(() => {
//         const requestCameraPermission = async () => {
//             let permission = Platform.select({
//                 android: PERMISSIONS.ANDROID.CAMERA,
//                 ios: PERMISSIONS.IOS.CAMERA,
//             });

//             const result = await check(permission);
//             if (result === RESULTS.GRANTED) {
//                 setHasPermission(true);
//             } else {
//                 const reqResult = await request(permission);
//                 setHasPermission(reqResult === RESULTS.GRANTED);
//             }
//         };

//         requestCameraPermission();
//     }, []);

//     const onSuccess = e => {
//         Linking.openURL(e.data).catch(err =>
//             console.error('An error occurred', err)
//         );
//     };

//     if (!hasPermission) {
//         return <Text style={{ textAlign: 'center', marginTop: 40 }}>Requesting camera permission...</Text>;
//     }

//     return (
//         <QRCodeScanner
//             onRead={onSuccess}
//             flashMode={RNCamera.Constants.FlashMode.off}
//             topContent={
//                 <Text style={styles.centerText}>
//                     Scan any valid QR code to continue.
//                 </Text>
//             }
//             bottomContent={
//                 <TouchableOpacity style={styles.buttonTouchable}>
//                     <Text style={styles.buttonText}>OK. Got it!</Text>
//                 </TouchableOpacity>
//             }
//         />
//     );
// };

// const styles = StyleSheet.create({
//     centerText: {
//         flex: 1,
//         fontSize: 18,
//         padding: 32,
//         color: '#777',
//     },
//     buttonText: {
//         fontSize: 21,
//         color: 'rgb(0,122,255)',
//     },
//     buttonTouchable: {
//         padding: 16,
//     },
// });

// export default QrScanner;





// import React, { useState, useEffect, useCallback } from 'react';
// import { StyleSheet, Text, View, Alert, Linking, AppState, Dimensions, Vibration } from 'react-native';
// import { useCameraDevice, Camera, useCodeScanner } from 'react-native-vision-camera'
// import { useIsFocused } from '@react-navigation/native'; // Make sure you have @react-navigation/native installed

// // Get screen dimensions for responsive design
// const { width } = Dimensions.get('window');
// const SCAN_AREA_SIZE = width * 0.7; // 70% of screen width

// const QrScanner = () => {
//     // Use the back camera device
//     const device = useCameraDevice('back');
//     // Check if the screen is currently focused in React Navigation
//     const isFocused = useIsFocused();

//     // State for camera permission
//     const [hasPermission, setHasPermission] = useState(false);
//     // State to store the transaction ID once scanned
//     const [scannedTransactionId, setScannedTransactionId] = useState(null);
//     // State to control whether the scanner is actively looking for codes
//     const [isScanning, setIsScanning] = useState(true);

//     // Request camera permission on component mount and handle app state changes
//     useEffect(() => {
//         const getPermission = async () => {
//             const status = await Camera.requestCameraPermission();
//             console.log('Camera permission status:', status);
//             setHasPermission(status === 'granted');

//         };

//         getPermission();

//         // Listener for app state changes (e.g., app goes to background and comes back)
//         const appStateListener = AppState.addEventListener('change', (nextAppState) => {
//             if (nextAppState === 'active') {
//                 // Re-check permission and potentially re-enable scanner when app becomes active
//                 getPermission();
//                 // If we want to automatically resume scanning when app comes back to foreground
//                 if (!isScanning) {
//                     setIsScanning(true);
//                     setScannedTransactionId(null);
//                 }
//             }
//         });

//         // Cleanup listener on component unmount
//         return () => {
//             appStateListener.remove();
//         };
//     }, [isScanning]); // Re-run effect if isScanning changes to adjust AppState listener logic

//     // Callback for when a QR code is scanned
//     const onCodeScanned = useCallback((codes) => {
//         // Only process if scanning is active and a code was actually detected
//         if (isScanning && codes.length > 0) {
//             const rawScannedString = codes[0].value;
//             console.log('Raw Scanned QR Code String:', rawScannedString);

//             try {
//                 const parsedJson = JSON.parse(rawScannedString);

//                 // Check if the parsed JSON has the 'transactionId' property
//                 if (parsedJson && parsedJson.transactionId) {
//                     const transactionId = parsedJson.transactionId;
//                     setScannedTransactionId(transactionId); // Store the transaction ID
//                     setIsScanning(false); // Stop scanning after finding the transactionId
//                     Vibration.vibrate(200); // Provide haptic feedback

//                     Alert.alert(
//                         'QR Code Scanned Successfully!',
//                         `Transaction ID: ${transactionId}\n\nWhat would you like to do next?`,
//                         [
//                             {
//                                 text: 'Scan Again',
//                                 onPress: () => {
//                                     setIsScanning(true); // Re-enable scanning
//                                     setScannedTransactionId(null); // Clear previous data
//                                 },
//                             },
//                             {
//                                 text: 'OK', // Or "Verify Ticket", "Proceed", etc.
//                                 onPress: () => {
//                                     // TODO: Implement your logic here, e.g.,
//                                     // 1. Navigate to a confirmation screen using `transactionId`
//                                     // navigation.navigate('TicketVerification', { transactionId });
//                                     // 2. Make an API call to verify the transactionId on your backend
//                                     // verifyTransaction(transactionId);
//                                     console.log(`Verifying transaction ID: ${transactionId}`);
//                                     setIsScanning(false); // Keep scanner paused after OK, unless "Scan Again" is pressed
//                                 }
//                             }
//                         ]
//                     );

//                 } else {
//                     // If it's valid JSON but doesn't have the expected 'transactionId'
//                     Alert.alert(
//                         'Invalid QR Content',
//                         'The scanned QR code does not contain a valid transaction ID.',
//                         [{ text: 'OK', onPress: () => setIsScanning(true) }] // Re-enable scanning
//                     );
//                 }
//             } catch (error) {
//                 // If the scanned string is not valid JSON
//                 console.error('Failed to parse QR code as JSON:', error);
//                 Alert.alert(
//                     'Invalid QR Code Format',
//                     'The scanned QR code does not contain valid JSON data. Please scan a valid event QR code.',
//                     [{ text: 'OK', onPress: () => setIsScanning(true) }] // Re-enable scanning
//                 );
//             }
//         }
//     }, [isScanning]); // Ensure useCallback updates if isScanning state changes

//     // Configure the useCodeScanner hook with our callback
//     const codeScanner = useCodeScanner({
//         codeTypes: ['qr'], // We are specifically interested in QR codes
//         onCodeScanned: onCodeScanned,
//     });

//     // Render different states based on permissions and camera device availability
//     if (!hasPermission) {
//         return (
//             <View style={styles.permissionContainer}>
//                 <Text style={styles.permissionText}>
//                     No camera access. Please enable camera permission in your phone's settings to scan QR codes.
//                 </Text>
//             </View>
//         );
//     }

//     if (device == null) {
//         return (
//             <View style={styles.permissionContainer}>
//                 <Text style={styles.permissionText}>
//                     No camera device found on this device. QR scanning is not possible.
//                 </Text>
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             {/* The Camera component will only be active when the screen is focused,
//           has permission, and our 'isScanning' state is true. */}
//             <Camera
//                 style={StyleSheet.absoluteFill}
//                 device={device}
//                 isActive={isFocused && hasPermission && isScanning}
//                 codeScanner={codeScanner}
//                 // This is important for a smooth preview experience
//                 photo={true} // Enable photo capture mode if you might take pictures later
//                 video={true} // Enable video capture mode if you might record videos later
//             />

//             {/* Overlay for scan area and instructions */}
//             <View style={styles.overlay}>
//                 <View style={styles.scanAreaBorder} />
//                 <Text style={styles.instructionText}>
//                     {isScanning ? 'Point camera at the QR code' : 'Scanned! Tap "Scan Again" or "OK"'}
//                 </Text>

//                 {/* Display the last scanned Transaction ID if available */}
//                 {scannedTransactionId && (
//                     <View style={styles.scannedIdContainer}>
//                         <Text style={styles.scannedIdLabel}>Last Scanned ID:</Text>
//                         <Text style={styles.scannedIdText}>{scannedTransactionId}</Text>
//                     </View>
//                 )}
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: 'black',
//     },
//     permissionContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#f0f0f0',
//         padding: 20,
//     },
//     permissionText: {
//         fontSize: 18,
//         color: 'gray',
//         textAlign: 'center',
//         lineHeight: 24,
//     },
//     overlay: {
//         ...StyleSheet.absoluteFillObject,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly darkened overlay
//     },
//     scanAreaBorder: {
//         width: SCAN_AREA_SIZE,
//         height: SCAN_AREA_SIZE,
//         borderWidth: 3,
//         borderColor: '#00f0f0', // Bright cyan border for the scan area
//         borderRadius: 15, // Slightly rounded corners
//         backgroundColor: 'transparent', // Make the center transparent for camera feed
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     instructionText: {
//         marginTop: 30,
//         color: 'white',
//         fontSize: 22,
//         fontWeight: 'bold',
//         textAlign: 'center',
//         textShadowColor: 'rgba(0, 0, 0, 0.75)', // Add a subtle shadow for readability
//         textShadowOffset: { width: -1, height: 1 },
//         textShadowRadius: 10,
//     },
//     scannedIdContainer: {
//         marginTop: 25,
//         padding: 15,
//         backgroundColor: 'rgba(0, 128, 0, 0.8)', // Dark green background for scanned ID
//         borderRadius: 10,
//         alignItems: 'center',
//         maxWidth: '80%', // Limit width for long IDs
//     },
//     scannedIdLabel: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: 'bold',
//         marginBottom: 5,
//     },
//     scannedIdText: {
//         color: 'white',
//         fontSize: 18,
//         fontFamily: 'monospace', // Good for displaying IDs
//         textAlign: 'center',
//     },
// });

// export default QrScanner;




// import React, { useEffect, useState } from 'react';
// import { SafeAreaView, StyleSheet, Text, View, Alert } from 'react-native';
// import { Camera, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';

// const QrScanner = () => {
//   const [hasPermission, setHasPermission] = useState(false);
//   const [isScanning, setIsScanning] = useState(true);

//   const devices = useCameraDevices();
//   const device = devices.back;

//   // Request camera permission
//   useEffect(() => {
//     const requestPermission = async () => {
//       const permission = await Camera.requestCameraPermission();
//       setHasPermission(permission === 'granted');
//     };
//     requestPermission();
//   }, []);

//   // QR code scanner setup
//   const codeScanner = useCodeScanner({
//     codeTypes: ['qr', 'ean-13'], // You can add more types as needed
//     onCodeScanned: (codes) => {
//       if (isScanning) {
//         setIsScanning(false);
//         const scannedValue = codes[0]?.value || 'Unknown';
//         console.log('Scanned code:', scannedValue);
//         Alert.alert('Code Scanned', scannedValue, [
//           {
//             text: 'OK',
//             onPress: () => setIsScanning(true),
//           },
//         ]);
//       }
//     },
//   });

//   if (!device) return <Text style={styles.message}>Loading camera...</Text>;
//   if (!hasPermission) return <Text style={styles.message}>No camera permission</Text>;

//   return (
//     <SafeAreaView style={styles.container}>
//       <Camera
//         style={StyleSheet.absoluteFill}
//         device={device}
//         isActive={true}
//         codeScanner={isScanning ? codeScanner : undefined}
//         frameProcessorFps={5}
//       />
//       <View style={styles.overlay}>
//         <Text style={styles.overlayText}>Point the camera at a QR/Barcode</Text>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   overlay: {
//     position: 'absolute',
//     bottom: 50,
//     alignSelf: 'center',
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   overlayText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   message: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     textAlign: 'center',
//     fontSize: 18,
//   },
// });

// export default QrScanner;



import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet, Text, View, Alert, Dimensions, Vibration,
    TouchableOpacity, ActivityIndicator, AppState,
    Modal
} from 'react-native';
import { useCameraDevice, Camera, useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import AwesomeAlert from 'react-native-awesome-alerts';
import Icon from 'react-native-vector-icons/Ionicons';



const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

const QrScanner = ({navigation}) => {
    const device = useCameraDevice('back');
    const isFocused = useIsFocused();

    const [hasPermission, setHasPermission] = useState(false);
    const [isScanning, setIsScanning] = useState(true);
    const [scannedData, setScannedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [modalVisible, setModalVisible] = useState(false);



    useEffect(() => {
        console.log(scannedData)
        const getPermission = async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'granted');
        };

        getPermission();

        const appStateListener = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                getPermission();
                if (!isScanning) {
                    setIsScanning(true);
                    setScannedData(null);
                }
            }
        });

        return () => {
            appStateListener.remove();
        };
    }, []);

    const onCodeScanned = useCallback(async (codes) => {
        if (isScanning && codes.length > 0) {
            const rawData = codes[0].value;
            console.log("Scanned QR:", rawData);

            try {
                setLoading(true);
                const parsed = JSON.parse(rawData);

               
                const { transaction_id } = parsed;

                const res = await axios.get(`http://172.16.16.215:5000/RWA/EventTransaction/transaction`, {
                    params: { TRANSACTION_ID: transaction_id }
                });

                const txn = res.data.data;

                if (txn.FLAG == 1) {
                    setLoading(false);
                    showAlert("Already Scanned", "This QR has already been approved.");
                } else {
                    setScannedData({ ...parsed, FLAG: txn.FLAG });
                    setIsScanning(false);
                    setLoading(false);
                    setModalVisible(true);
                    Vibration.vibrate(200);
                }

            } catch (err) {
                console.error("Error parsing or fetching:", err);
                setLoading(false);
                showAlert("Invalid QR Code", "The QR data is not valid or server error occurred.");
            }
        }
    }, [isScanning]);


    const showAlert = (title, message) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };


    const handleApprove = async () => {
        try {
            setLoading(true);
            await axios.put(`http://172.16.16.215:5000/RWA/EventTransaction/approve`, {
                TRANSACTION_ID: scannedData.transaction_id
            });
            setLoading(false);
            showAlert("Approved", "Transaction approved successfully.");
            setScannedData(null);
            setIsScanning(true);
        } catch (err) {
            console.error("Approve error:", err);
            setLoading(false);
            showAlert("Error", "Approval failed.");
        }
    };

    const handleRescan = () => {
        setScannedData(null);
        setIsScanning(true);
    };

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned,
    });

    if (!hasPermission) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>No camera access. Enable it in settings.</Text>
            </View>
        );
    }

    if (device == null) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>No camera device found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.topRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                        <Icon name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.titled}>Qr Scanner</Text>
                </View>
            </View>
            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={{ marginTop: 10, color: 'black' }}>Processing...</Text>
                </View>
            ) : !scannedData ? (
                <>
                    <Camera
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={isFocused && hasPermission && isScanning}
                        codeScanner={codeScanner}
                        photo={false}
                        video={false}
                    />
                    <View style={styles.overlay}>
                        <View style={styles.scanAreaBorder} />
                        <Text style={styles.instructionText}>Point camera at QR code</Text>
                    </View>
                </>
            ) : (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>Do you want to Approve this User?</Text>
                            
                            <Text style={styles.modalTitlee}><Text style={{ fontWeight: 'bold' }}> Event:</Text>{scannedData.event}</Text>
                            <Text style={styles.modalTitlee}><Text style={{ fontWeight: 'bold' }}> User:</Text>{scannedData.name}</Text>
                            <View style={{ flexDirection: "row", justifyContent: 'space-evenly' }}>
                                <TouchableOpacity style={styles.modalButton1} onPress={handleApprove}>
                                    <Text style={{ color: 'white' }}>Yes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalButton2} onPress={handleRescan}>
                                    <Text style={{ color: 'white' }}>Rescan</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                </Modal>
            )}
            <AwesomeAlert
                show={alertVisible}
                showProgress={false}
                title={alertTitle}
                message={alertMessage}
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={true}
                showConfirmButton={true}
                confirmText="OKAY"
                confirmButtonColor="#007AFF"
                onConfirmPressed={() => setAlertVisible(false)}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    permissionContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#f0f0f0', padding: 20
    },
    permissionText: {
        fontSize: 18, color: 'gray', textAlign: 'center', lineHeight: 24,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    scanAreaBorder: {
        width: SCAN_AREA_SIZE,
        height: SCAN_AREA_SIZE,
        borderWidth: 3,
        borderColor: '#00f0f0',
        borderRadius: 15,
        backgroundColor: 'transparent',
    },
    instructionText: {
        marginTop: 30,
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    resultBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff'
    },
    dataText: {
        fontSize: 16,
        marginBottom: 10,
        color: 'black',
        textAlign: 'center',
    },
    approveButton: {
        backgroundColor: 'green',
        padding: 12,
        borderRadius: 10,
        marginTop: 20,
        width: '60%',
        alignItems: 'center'
    },
    approveText: {
        color: 'white',
        fontWeight: 'bold'
    },
    cancelButton: {
        marginTop: 15,
        padding: 10,
    },
    cancelText: {
        color: 'red',
        fontWeight: 'bold'
    },
    loadingBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalBox: {
        backgroundColor: '#fff',
        width: '85%',
        borderRadius: 20,
        padding: 20,
        paddingTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        position: 'relative',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalTitlee: {
        fontSize: 14,
        // fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalButton1: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        borderRadius: 12,
        marginVertical: 8,
        alignItems: 'center',
        width: 80
    },
    modalButton2: {
        backgroundColor: 'red',
        paddingVertical: 12,
        borderRadius: 12,
        marginVertical: 8,
        alignItems: 'center',
        width: 80
    },
    header: {
        backgroundColor: '#fff',
        height: 60,
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        zIndex: 2,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
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

export default QrScanner;
