/**
 * @format
 */

import 'react-native-get-random-values';
import 'text-encoding-polyfill';

import {AppRegistry} from 'react-native';
//import App from './App';
import App from './AppNav';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
