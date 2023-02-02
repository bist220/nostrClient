import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';

import { DetailScreen } from './screens/DetailScreen';
import { ModalMessageScreen } from './screens/ModalMessageScreen';
import { RootStackParamList } from './NavStackParamTypes';
import UserService from "./UserService";
import { HomeScreen } from './HomeScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();
//const Stack = createStackNavigator<RootStackParamList>();

function App(): JSX.Element {
//const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Group>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Details" component={DetailScreen} />
                </Stack.Group>
                <Stack.Group screenOptions={{ presentation: 'modal' }}>
                    <Stack.Screen name="Message" component={ModalMessageScreen} />
                </Stack.Group>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;