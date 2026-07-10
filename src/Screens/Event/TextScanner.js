import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity,
    ActivityIndicator, Modal, Alert,
    ScrollView
} from 'react-native';
import { useCameraDevice, Camera } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import Clipboard from '@react-native-clipboard/clipboard';

const TextScanner = ({ navigation, onTextDetected }) => {
    const device = useCameraDevice('back');
    const cameraRef = useRef(null);

    const [hasPermission, setHasPermission] = useState(false);
    const [loading, setLoading] = useState(false);
    const [detectedText, setDetectedText] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Ask for permission
    useEffect(() => {
        const getPermission = async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'granted');
        };
        getPermission();
    }, []);

    const handleCapture = async () => {
        try {
            setLoading(true);
            const photo = await cameraRef.current.takePhoto();
            const result = await TextRecognition.recognize(`file://${photo.path}`);

            if (result.blocks && result.blocks.length > 0) {
                setDetectedText(result.blocks);
                setModalVisible(true);
            } else {
                Alert.alert("No text detected");
            }
        } catch (err) {
            console.error("OCR Error:", err);
            Alert.alert("Error while scanning text");
        } finally {
            setLoading(false);
        }
    };

    if (!hasPermission) {
        return (
            <View style={styles.center}>
                <Text style={{ color: 'black' }}>Camera permission not granted</Text>
            </View>
        );
    }

    if (device == null) {
        return (
            <View style={styles.center}>
                <Text style={{ color: 'black' }}>No camera device found</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photo={true}
            />

            {/* Capture Button */}
            <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCapture}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Icon name="camera" size={28} color="#fff" />
                )}
            </TouchableOpacity>

            {/* Modal showing detected text */}
            <Modal
                transparent
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Detected Text</Text>

                        {/* Scrollable text */}
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            showsVerticalScrollIndicator={true}
                        >
                            {detectedText && detectedText.map((block, idx) => (
                                <View key={idx} style={{ marginBottom: 10 }}>
                                    {block.lines.map((line, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            onPress={() => {
                                                Clipboard.setString(line.text);
                                                Alert.alert("Copied!", line.text);
                                            }}
                                            style={{
                                                paddingVertical: 8,
                                                paddingHorizontal: 10,
                                                backgroundColor: '#f5f5f5',
                                                borderRadius: 6,
                                                marginBottom: 6,
                                            }}
                                        >
                                            <Text style={{ color: 'black', fontSize: 15 }}>{line.text}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ))}
                        </ScrollView>

                        {/* Close button */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default TextScanner;

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    captureButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: '#007AFF',
        padding: 20,
        borderRadius: 40,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: '90%',
        height: '70%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        flexDirection: 'column',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'black',
        alignSelf: 'center',
    },
    scrollView: {
        flex: 1, // Takes available space but respects other elements
        width: '100%',
        marginBottom: 10, // Add margin to prevent overlap with Close button
    },
    closeButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignSelf: 'center',
    },
});