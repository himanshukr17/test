import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

const Vehicle = ({ navigation }) => {

  const [formData, setFormData] = useState({ Vehicle: '' });
  const [vehicleType, setVehicleType] = useState('');
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [otherBrand, setOtherBrand] = useState('');
  const [otherModel, setOtherModel] = useState('');
  const [errors, setErrors] = useState({});
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  useEffect(() => {
    if (vehicleType) {
      axios.get('http://172.16.16.215:5000/RWA/VehicleInfo/all', {
        params: { vehicleType }
      })
        .then(res => setBrands(res.data.data))
        .catch(err => console.log(err));
    } else {
      setBrands([]);
      setSelectedBrand('');
      setModels([]);
      setSelectedModel('');
    }
    setOtherBrand('');
    setOtherModel('');
  }, [vehicleType]);

  const handleBrandChange = (brandName) => {
    setSelectedBrand(brandName);
    setOtherBrand('');
    setOtherModel('');
    if (brandName === 'Other') {
      setModels([]);
      setSelectedModel('');
    } else {
      const brand = brands.find(b => b.name === brandName);
      setModels(brand ? brand.models : []);
      setSelectedModel('');
    }
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!formData.Vehicle.trim()) newErrors.Vehicle = true;
    if (!vehicleType) newErrors.vehicleType = true;

    if (!selectedBrand) newErrors.selectedBrand = true;
    if (selectedBrand === 'Other') {
      if (!otherBrand.trim()) newErrors.otherBrand = true;
      if (!otherModel.trim()) newErrors.otherModel = true;
    } else {
      if (!selectedModel) newErrors.selectedModel = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setErrorModalVisible(true);
      return;
    }

    try {
      const user = await AsyncStorage.getItem('userId');
      const payload = {
        USER_ID: user,
        VECHILE_NO: formData.Vehicle,
        TYPE: vehicleType,
        BRAND: selectedBrand === 'Other' ? otherBrand : selectedBrand,
        MAKE: selectedBrand === 'Other' ? otherModel : selectedModel,
      };
      console.log('Vehicle added successfully', payload);
      await axios.post('http://172.16.16.215:5000/RWA/Vechile/create', payload);

      setSuccessModalVisible(true);

      // Reset form
      setFormData({ Vehicle: '' });
      setVehicleType('');
      setSelectedBrand('');
      setSelectedModel('');
      setOtherBrand('');
      setOtherModel('');
      setBrands([]);
      setModels([]);
      setErrors({});
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to add vehicle');
    }
  };

  return (
    <>
      {/* Success Modal */}
      <Modal
        transparent
        visible={successModalVisible}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successBox}>
            <Text style={styles.modalText}>Vehicle Added Successfully</Text>
            <TouchableOpacity onPress={() => setSuccessModalVisible(false)}>
              <Text style={styles.modalButton}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        transparent
        visible={errorModalVisible}
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorBox}>
            <Text style={styles.modalText}>Please fill all fields</Text>
            <TouchableOpacity onPress={() => setErrorModalVisible(false)}>
              <Text style={styles.modalButton}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              <Text style={styles.titled}>Vehicle Information</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ padding: 10, marginTop: 20 }}>



          {/* Vehicle Type */}
          <Text style={styles.label}>Vehicle Type:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={vehicleType}
              onValueChange={setVehicleType}

              style={styles.pickerInner}
            >
              <Picker.Item label="Select Vehicle Type" value="" />
              <Picker.Item label="Two Wheeler" value="Two Wheeler" />
              <Picker.Item label="Four Wheeler" value="Four Wheeler" />
            </Picker>
          </View>
          {errors.vehicleType && <Text style={styles.errorText}>Vehicle Type is required</Text>}

          {/* Brand */}
          {vehicleType && (
            <>
              <Text style={styles.label}>Brand:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedBrand}
                  onValueChange={handleBrandChange}
                  style={styles.pickerInner}
                >
                  <Picker.Item label="Select Brand" value="" />
                  <Picker.Item label="Other" value="Other" />
                  {brands.map(b => (
                    <Picker.Item key={b._id} label={b.name} value={b.name} />
                  ))}
                </Picker>
              </View>
              {errors.selectedBrand && <Text style={styles.errorText}>Brand is required</Text>}

              {selectedBrand === 'Other' && (
                <>
                  <Text style={styles.label}>Enter Brand:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Brand"
                    placeholderTextColor="#888"
                    value={otherBrand}
                    onChangeText={setOtherBrand}
                  />
                  {errors.otherBrand && <Text style={styles.errorText}>Brand is required</Text>}

                  <Text style={styles.label}>Enter Model:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Model"
                    placeholderTextColor="#888"
                    value={otherModel}
                    onChangeText={setOtherModel}
                  />
                  {errors.otherModel && <Text style={styles.errorText}>Model is required</Text>}
                </>
              )}

              {selectedBrand && selectedBrand !== 'Other' && models.length > 0 && (
                <>
                  <Text style={styles.label}>Model:</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedModel}
                      onValueChange={setSelectedModel}
                      style={styles.pickerInner}
                    >
                      <Picker.Item label="Select Model" value="" />
                      {models.map((m, idx) => (
                        <Picker.Item key={idx} label={m} value={m} />
                      ))}
                    </Picker>
                  </View>
                  {errors.selectedModel && <Text style={styles.errorText}>Model is required</Text>}
                </>
              )}
            </>
          )}

          {/* Vehicle Number */}
          <Text style={styles.label}>Vehicle Number:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Vehicle Number"
            placeholderTextColor="#888"
            value={formData.Vehicle}
            onChangeText={(val) => {
              handleChange('Vehicle', val);
              if (errors.Vehicle && val.trim()) setErrors(prev => ({ ...prev, Vehicle: false }));
            }}
          />
          {errors.Vehicle && <Text style={styles.errorText}>Vehicle number is required</Text>}

          <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "50%", marginTop: '10%' }}>
            <TouchableOpacity onPress={handleSubmit}>
              <LinearGradient
                useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                colors={['#ceceddff', '#60498fff', '#441678ff']}   // left dark → right light
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ padding: 10, borderRadius: 10 }}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </LinearGradient>

            </TouchableOpacity>
          </View>


        </View>
        <LottieView
          source={require('../../assets/Lotties/car.json')}
          autoPlay
          loop
          style={{ width: 300, height: 220, alignSelf: 'center' }}
        />
      </View>
    </>
  );
};

export default Vehicle;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 10 },
  topRow: { position: 'relative', height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  backIcon: { position: 'absolute', left: 16, zIndex: 1 },
  titled: { fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'center' },
  label: { fontSize: 16, marginVertical: 5, color: '#333', fontWeight: '500' },
  picker: { color: 'black', marginBottom: 5, borderWidth: 1, borderColor: '#fb3e3eff', borderRadius: 18, backgroundColor: '#ddddefff', borderWidth: 1 },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 10, backgroundColor: '#fff', color: 'black' },
  button: { backgroundColor: '#89788a', height: 45, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 20, alignSelf: 'center', width: 100 },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  errorText: { color: 'red', fontSize: 12, marginBottom: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  successBox: { borderLeftWidth: 6, borderLeftColor: '#4BB543', width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center', elevation: 10 },
  errorBox: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center', elevation: 10, borderLeftWidth: 6, borderLeftColor: '#D0342C' },
  modalText: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 12 },
  modalButton: { fontSize: 14, color: '#4B7BEC', fontWeight: 'bold' },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 5,
    overflow: 'hidden',
    height: 43,
    justifyContent: 'center',
  },

  pickerInner: {
    color: 'black', // text color

    width: '100%',
  },

});
