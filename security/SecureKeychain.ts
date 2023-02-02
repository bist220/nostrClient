import React, { Component } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from 'react-native';
//import SegmentedControlTab from 'react-native-segmented-control-tab';
import * as Keychain from 'react-native-keychain';

/*

const ACCESS_CONTROL_OPTIONS = ['None', 'Passcode', 'Password'];
const ACCESS_CONTROL_OPTIONS_ANDROID = ['None'];
const ACCESS_CONTROL_MAP = [
  null,
  Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
  Keychain.ACCESS_CONTROL.APPLICATION_PASSWORD,
  Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
];
const ACCESS_CONTROL_MAP_ANDROID = [
  null,
  Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
];
const SECURITY_LEVEL_OPTIONS = ['Any', 'Software', 'Hardware'];
const SECURITY_LEVEL_MAP = [
  Keychain.SECURITY_LEVEL.ANY,
  Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
  Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
];

const SECURITY_STORAGE_OPTIONS = ['Best', 'FB', 'AES', 'RSA'];
const SECURITY_STORAGE_MAP = [
  null,
  Keychain.STORAGE_TYPE.FB,
  Keychain.STORAGE_TYPE.AES,
  Keychain.STORAGE_TYPE.RSA,
];

*/

// store all accounts on all servers
export interface StoreValue {
  // default username
  defaultUserName : string;
  // creds for all usernames on all servers
  cred : Array<Cred>;
}

export interface Cred {
  pubKey : string;
  privKey : string;
  username : string;
  server : string;
  lastUpdated : Date;
  bech32Pub : string;
  bech32Priv : string;
}

export default class SecureKeychain {
  readonly className : string = "SecureKeychain";
  /*
  options : Keychain.Options  = {};
  
  constructor() {
    this.options = this.getOptions();
  }
  */

  getOptions() : Keychain.Options {
    const serviceName : string = "com.screenlay.client";
    let options : Keychain.Options = {service : serviceName};
    
    console.log("[getOptions] :: [getSupportedBiometryType] start")

    if (Platform.OS === 'ios') {
      options.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE;
      options.accessible = Keychain.ACCESSIBLE.WHEN_UNLOCKED;
      options.authenticationType = Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS;
    }

    else if (Platform.OS === 'android') {
      // Keychain.BIOMETRY_TYPE
      let bioType : Keychain.BIOMETRY_TYPE;

      Keychain.getSupportedBiometryType(options).then((biometryType) => {if(biometryType) {bioType = biometryType} });

      //bioType = Keychain.BIOMETRY_TYPE.FINGERPRINT;
      console.log("[SecureKeychain] :: [getSupportedBiometryType] start")
      if(bioType && bioType === Keychain.BIOMETRY_TYPE.FINGERPRINT) {
        console.log("[SecureKeychain] :: [getSupportedBiometryType] biometryType :: " + bioType);
        options.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE;
        options.storage = Keychain.STORAGE_TYPE.RSA;
        options.securityLevel = Keychain.SECURITY_LEVEL.SECURE_HARDWARE;
      } else {
        console.log("[SecureKeychain] :: [getSupportedBiometryType] biometryType :: " + bioType);
        //options.accessControl = Keychain.ACCESS_CONTROL.DEVICE_PASSCODE;
        
        // null for best - as per example
        //options.storage = Keychain.STORAGE_TYPE.AES;
        options.storage = Keychain.STORAGE_TYPE.FB;


        // TODO test
        /*
          Rule 1: Automatic Security Level
          As a rule the library will try to apply the best possible encryption for storing secrets. 
          Once the secret is stored however its does not try to upgrade it unless FacebookConseal was used 
          and the option 'SECURITY_RULES' is set to 'AUTOMATIC_UPGRADE'
        */
        options.rules = Keychain.SECURITY_RULES.AUTOMATIC_UPGRADE;
        //options.securityLevel = Keychain.SECURITY_LEVEL.SECURE_HARDWARE;
      }
      console.log("[SecureKeychain] :: [getSupportedBiometryType] end");
      

      /*
      Keychain.getSupportedBiometryType(options).then((biometryType) => {
        console.log("[SecureKeychain] :: [getSupportedBiometryType] start")
        if(biometryType === Keychain.BIOMETRY_TYPE.FINGERPRINT) {
          console.log("[SecureKeychain] :: [getSupportedBiometryType] biometryType :: " + biometryType);
          options.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE;
          options.storage = Keychain.STORAGE_TYPE.RSA;
        } else {
          console.log("[SecureKeychain] :: [getSupportedBiometryType] biometryType :: " + biometryType);
          options.accessControl = Keychain.ACCESS_CONTROL.DEVICE_PASSCODE;
          
          // null for best - as per example
          //options.storage = Keychain.STORAGE_TYPE.AES;
          //options.storage = Keychain.STORAGE_TYPE.FB;


          // TODO test
          options.rules = Keychain.SECURITY_RULES.AUTOMATIC_UPGRADE;
          options.securityLevel = Keychain.SECURITY_LEVEL.SECURE_HARDWARE;
        }
        console.log("[SecureKeychain] :: [getSupportedBiometryType] end");
      });
      */
    }
    console.log("[getOptions] :: [getSupportedBiometryType] options :: " + JSON.stringify(options));
    console.log("[getOptions] :: [getSupportedBiometryType] end");
    return options;
  }

  async save(key : string, storeValue : StoreValue) {
    try {
      let start = new Date();
      const options : Keychain.Options = this.getOptions();
      console.log(`[${this.className}] :: save :: options :: ${JSON.stringify(options)}`);
      let result = await Keychain.setGenericPassword(
        key,
        JSON.stringify(storeValue),
        options,
      );

      let end = new Date();
      console.log(`[${this.className}] :: save :: Credentials saved! takes: ${
          end.getTime() - start.getTime()
        } millis`
      );
      
      return result;
    } catch (err) {
      console.log(`[${this.className}] :: save :: status :: Could not save credentials, ${err}` );
      return false;
    }
    return false;
  }

  async loadKey(username : string) {
     let storeValue = await this.load();
     if (storeValue && username) {
      return storeValue.cred.filter(v => v.username === username);
     } else {
      return false;
     }
  }

  async load() {
    try {
      let op : Keychain.Options = this.getOptions();
      const options : Keychain.Options = {
        authenticationPrompt: {
          title: 'Authentication needed',
          subtitle: 'Please Authenticate',
          description: 'Need authentication to access credentials or create a new account. ',
          cancel: 'Cancel',
        },
        service : op.service,
        accessControl : op.accessControl,
        storage : op.storage,
        securityLevel : op.securityLevel,
        accessGroup : op.accessGroup,
        rules : op.rules
      };
      console.log(`[${this.className}] :: load :: options :: ${JSON.stringify(options)}`);
      let credentials : Keychain.UserCredentials;
      await Keychain.getGenericPassword(options)
              .then(cred => {
                if(cred) {
                  credentials = cred;
                  console.log(`[${this.className}] :: load :: getGenericPassword :: cred :: ${JSON.stringify(cred)}`);
                }
              })
              .catch(e => console.log("Status: No credentials stored. " + e));
      if (credentials) {
        console.log("Status: Credentials loaded!");
        //Alert.alert("Status: Credentials loaded!");
        let val : StoreValue = JSON.parse(credentials.password);
        console.log(`[${this.className}] :: load :: getGenericPassword :: val :: ${JSON.stringify(val)}`);
        return val;
      } else {
        console.log("Status: No credentials stored.");
        //Alert.alert("Status: No credentials stored.");
        return false;
      }
    } catch (err) {
      console.log("Status: Could not load credentials. " + err );
      //Alert.alert("Status: Could not load credentials.");
      return false;
    }
  }

  async reset() {
    try {
      const op : Keychain.Options = this.getOptions();
      await Keychain.resetGenericPassword({service : op.service});
      console.log("Status: Credentials Reset!");
      //Alert.alert("Status: Credentials Reset!");
    } catch (err) {
      console.log("status: Could not reset credentials, " + err );
      //Alert.alert("status: Could not reset credentials.");
    }
  }

  /*
  async getAll() {
    try {
      const result = await Keychain.getAllGenericPasswordServices();
      this.setState({
        status: `All keys successfully fetched! Found: ${result.length} keys.`,
      });
    } catch (err) {
      this.setState({ status: 'Could not get all keys. ' + err });
    }
  }
  */

  /*
  async ios_specifics() {
    try {
      const reply = await Keychain.setSharedWebCredentials(
        'server',
        'username',
        'password'
      );
      console.log(`setSharedWebCredentials: ${JSON.stringify(reply)}`);
    } catch (err) {
      Alert.alert('setSharedWebCredentials error', err.message);
    }

    try {
      const reply = await Keychain.requestSharedWebCredentials();
      console.log(`requestSharedWebCredentials: ${JSON.stringify(reply)}`);
    } catch (err) {
      Alert.alert('requestSharedWebCredentials error', err.message);
    }
  }
  */
}


/*
  init() {
    const serviceName : string = "com.screenlay.client";
    let options : Keychain.Options = {service : serviceName};
    
    if (Platform.OS === 'ios') {
      options.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE;
      options.accessible = Keychain.ACCESSIBLE.WHEN_UNLOCKED;
      options.authenticationType = Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS;
    }

    else if (Platform.OS === 'android') {
      // Keychain.BIOMETRY_TYPE
      Keychain.getSupportedBiometryType({}).then((biometryType) => {
        if(biometryType === Keychain.BIOMETRY_TYPE.FINGERPRINT) {
          options.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE;
          options.storage = Keychain.STORAGE_TYPE.RSA;
        } else {
          options.accessControl = Keychain.ACCESS_CONTROL.DEVICE_PASSCODE;
          
          // null for best - as per example
          //options.storage = Keychain.STORAGE_TYPE.AES;
          //options.storage = Keychain.STORAGE_TYPE.FB;


          // TODO test
          
          //  Rule 1: Automatic Security Level
          //  As a rule the library will try to apply the best possible encryption for storing secrets. 
          //  Once the secret is stored however its does not try to upgrade it unless FacebookConseal was used 
          //  and the option 'SECURITY_RULES' is set to 'AUTOMATIC_UPGRADE'
          
            options.rules = Keychain.SECURITY_RULES.AUTOMATIC_UPGRADE;
            options.securityLevel = Keychain.SECURITY_LEVEL.SECURE_HARDWARE;
          }
        });
      }
    }
*/