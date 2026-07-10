import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import Home from './Screens/Dashboard/Home';
import Login from './Screens/Onboarding/Login';
import Forgotpassword from './Screens/Onboarding/Forgotpassword';
import Verification from './Screens/Onboarding/Verification';
import NewPassword from './Screens/Onboarding/NewPassword';
import Profile from './Screens/Profile/Profile';
import CompleteProfile from './Screens/Profile/CompleteProfile';
import Directory from './Screens/Directory/Directory';
import Attendance from './Screens/Attendance/Attendance';
import AllEvent from './Screens/Event/AllEvent';
import CreateService from './Screens/Services/CreateService';
import AllServices from './Screens/Services/AllServices';
import Timeline from './Screens/Services/Timeline';
import ServicesRequest from './Screens/ResponsibleUser/ServicesRequest';
import AdvertisementDetails from './Screens/Advertisement/AdvertisementDetails';
import CurrentEvent from './Screens/Event/CurrentEvent';
import Payment from './Screens/Event/Payment';
import QrCodeScreen from './Screens/Event/QrCodeScreen';
import QrScanner from './Screens/Event/QrScanner';
import Welcome from './Screens/Welcome/Welcome';
import Vechile from './Screens/Vechile/Vechile';
import QrScanVehicle from './Screens/VehicleScan/QrScanVehicle';
import Sos from './Screens/Sos/Sos';
import RDirectory from './Screens/Directory/RDirectory';
import CheckPoint from './Screens/Checkpoint/CheckPoint';
import AllCheckPoint from './Screens/Checkpoint/AllCheckPoint';

// Drawer
import CustomDrawer from './Component/CustomDrawer';
import CDirectory from './Screens/Directory/CDirectory';
import GDirectory from './Screens/Directory/GDirectory';
import SDirectory from './Screens/Directory/SDirectory';
import Notifications from './Screens/Notifications/Notifications';
import Scan from './Screens/VehicleScan/Scan';
import VehicleQr from './Screens/Vechile/VehicleQr';
import Maid from './Screens/Maid/Maid';
import MaidDashboard from './Screens/Maid/MaidDashboard';
import EventFee from './Screens/Event/EventFee';
import TextScanner from './Screens/Event/TextScanner';
import CreateEvent from './Screens/Event/CreateEvent';
import UserEvents from './Screens/Event/UserEvents';
import Complaint from './Screens/Complaint/Complaint';
import CreateProduct from './Screens/Product/CreateProduct';
import Product from './Screens/Product/Product';
import Scheme from './Screens/Scheme/Scheme';
import RegVerification from './Screens/Onboarding/RegVerification';
import SignUp from './Screens/Onboarding/SignUp';
import UserProduct from './Screens/Product/UserProduct';
import UserComplaint from './Screens/Complaint/UserComplaint';


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const MainStack = createNativeStackNavigator();

const DrawerNavigator = ({ setIsAuth, modules }) => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawer {...props} setIsAuth={setIsAuth} />}
    screenOptions={{ headerShown: false }}
  >
    {console.log('DrawerNavigator modules:', modules)}
    {modules.includes("Home") && <Drawer.Screen name="Home" component={Home} />}
    {modules.includes("Profile") && <Drawer.Screen name="Profile" component={Profile} />}
    {modules.includes("MaidDashboard") && <Drawer.Screen name="MaidDashboard" component={MaidDashboard} />}
    {modules.includes("Maid") && <Drawer.Screen name="Maid" component={Maid} />}
    {modules.includes("CompleteProfile") && <Drawer.Screen name="CompleteProfile" component={CompleteProfile} />}

  </Drawer.Navigator>
);

const MainStackNavigator = ({ setIsAuth, modules }) => (
  <MainStack.Navigator screenOptions={{ headerShown: false }}>
    <MainStack.Screen name="DrawerNavigator">
      {(props) => <DrawerNavigator {...props} setIsAuth={setIsAuth} modules={modules} />}
    </MainStack.Screen>

    {modules.includes("Directory") && <MainStack.Screen name="Directory" component={Directory} />}
    {modules.includes("Attendance") && <MainStack.Screen name="Attendance" component={Attendance} />}
    {modules.includes("AllEvent") && <MainStack.Screen name="AllEvent" component={AllEvent} />}
    {modules.includes("CreateService") && <MainStack.Screen name="CreateService" component={CreateService} />}
    {modules.includes("AllServices") && <MainStack.Screen name="AllServices" component={AllServices} />}
    {modules.includes("Timeline") && <MainStack.Screen name="Timeline" component={Timeline} />}
    {modules.includes("ServicesRequest") && <MainStack.Screen name="ServicesRequest" component={ServicesRequest} />}
    {modules.includes("CurrentEvent") && <MainStack.Screen name="CurrentEvent" component={CurrentEvent} />}
    {modules.includes("Payment") && <MainStack.Screen name="Payment" component={Payment} />}
    {modules.includes("QrCodeScreen") && <MainStack.Screen name="QrCodeScreen" component={QrCodeScreen} />}
    {modules.includes("QrScanner") && <MainStack.Screen name="QrScanner" component={QrScanner} />}
    {modules.includes("Vechile") && <MainStack.Screen name="Vechile" component={Vechile} />}
    {modules.includes("QrScanVehicle") && <MainStack.Screen name="QrScanVehicle" component={QrScanVehicle} />}
    {modules.includes("Sos") && <MainStack.Screen name="Sos" component={Sos} />}
    {modules.includes("RDirectory") && <MainStack.Screen name="RDirectory" component={RDirectory} />}
    {modules.includes("CheckPoint") && <MainStack.Screen name="CheckPoint" component={CheckPoint} />}
    {modules.includes("AllCheckPoint") && <MainStack.Screen name="AllCheckPoint" component={AllCheckPoint} />}
    {modules.includes("AdvertisementDetails") && <MainStack.Screen name="AdvertisementDetails" component={AdvertisementDetails} />}
    {modules.includes("CDirectory") && <MainStack.Screen name="CDirectory" component={CDirectory} />}
    {modules.includes("GDirectory") && <MainStack.Screen name="GDirectory" component={GDirectory} />}
    {modules.includes("SDirectory") && <MainStack.Screen name="SDirectory" component={SDirectory} />}
    {modules.includes("Notifications") && <MainStack.Screen name="Notifications" component={Notifications} />}
    {modules.includes("Scan") && <MainStack.Screen name="Scan" component={Scan} />}
    {modules.includes("VehicleQr") && <MainStack.Screen name="VehicleQr" component={VehicleQr} />}
    {modules.includes("EventFee") && <MainStack.Screen name="EventFee" component={EventFee} />}
    {modules.includes("TextScanner") && <MainStack.Screen name="TextScanner" component={TextScanner} />}
    {modules.includes("CreateEvent") && <MainStack.Screen name="CreateEvent" component={CreateEvent} />}
    {modules.includes("UserEvents") && <MainStack.Screen name="UserEvents" component={UserEvents} />}
    {modules.includes("Complaint") && <MainStack.Screen name="Complaint" component={Complaint} />}
    {modules.includes("CreateProduct") && <MainStack.Screen name="CreateProduct" component={CreateProduct} />}
    {modules.includes("Product") && <MainStack.Screen name="Product" component={Product} />}
    {modules.includes("Scheme") && <MainStack.Screen name="Scheme" component={Scheme} />}
    {modules.includes("UserProduct") && <MainStack.Screen name="UserProduct" component={UserProduct} />}
    {modules.includes("UserComplaint") && <MainStack.Screen name="UserComplaint" component={UserComplaint} />}
    

  </MainStack.Navigator>
);

const Route = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [modules, setModules] = useState(null);

  const loadModules = async () => {
    const token = await AsyncStorage.getItem('token');
    const storedModules = await AsyncStorage.getItem('modules');
    console.log('Route.js - Raw stored modules:', storedModules);
    const parsedModules = storedModules ? JSON.parse(storedModules) : [];
    console.log('Route.js - Parsed modules:', parsedModules);
    setIsAuth(!!token);
    setModules(parsedModules);
  };

  useEffect(() => {
    loadModules();
    // logoutt();
  }, []);

  // Refresh modules when isAuth changes (after login)
  useEffect(() => {
    if (isAuth) {
      loadModules();

    }
  }, [isAuth]);

  const logoutt = async () => {
    try {
      await AsyncStorage.clear();
      console.log(' AsyncStorage cleared');
    } catch (storageErr) {
      console.log(' Failed to clear AsyncStorage:', storageErr.message);
    }
  };

  if (!isAuth) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login">
              {(props) => <Login {...props} setIsAuth={setIsAuth} />}
            </Stack.Screen>
            <Stack.Screen name="Forgotpassword" component={Forgotpassword} options={{ headerShown: true }} />
            <Stack.Screen name="Verification" component={Verification} options={{ headerShown: true }} />
            <Stack.Screen name="NewPassword" component={NewPassword} options={{ headerShown: true }} />
            <Stack.Screen name="RegVerification" component={RegVerification} options={{ headerShown: true }} />
            <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: true }} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    );
  }

  // if (modules === null || modules.length === 0) {
  //   return (
  //     <GestureHandlerRootView style={{ flex: 1 }}>
  //       <NavigationContainer>
  //         <Stack.Navigator screenOptions={{ headerShown: false }}>
  //           <Stack.Screen name="Welcome" component={Welcome} />
  //         </Stack.Navigator>
  //       </NavigationContainer>
  //     </GestureHandlerRootView>
  //   );
  // }

  if (modules === null || modules.length === 0) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome">
              {(props) => <Welcome {...props} setModules={setModules} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    );
  }


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <MainStackNavigator setIsAuth={setIsAuth} modules={modules} />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default Route;