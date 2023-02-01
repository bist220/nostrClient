import * as Keychain from 'react-native-keychain';

export const secure = async () => {
  const username = 'zuck';
  const password = 'poniesRgr8';
  const serviceName = "com.screenlay.client";
  // Store the credentials
  let op : Keychain.Options = {
                                accessControl : Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
                                storage : Keychain.STORAGE_TYPE.AES,
                                securityLevel : Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
                                service : serviceName
                            }
  await Keychain.setGenericPassword(username, password, op).then(r => console.log("[set pass] :: success :: " + JSON.stringify(r))).catch(e=>console.log("[set pass] :: catch :: " + JSON.stringify(e)));

  await Keychain.setGenericPassword(username, "password", op).then(r => console.log("[set pass] :: success :: " + JSON.stringify(r))).catch(e=>console.log("[set pass] :: catch :: " + JSON.stringify(e)));

  try {
    // Retrieve the credentials
    //const all = await Keychain.getAllGenericPasswordServices();
    const credentials = await Keychain.getGenericPassword({service : serviceName});
    if (credentials) {
      console.log(
        'Credentials successfully loaded for user ' + credentials.username
      );
      console.log(
        'Credentials successfully loaded for user :: password ' + credentials.password
      );
      console.log(
        'Credentials successfully loaded for user :: service ' + credentials.service
      );
      console.log(
        'Credentials successfully loaded for user :: storage ' + credentials.storage
      );
    } else {
      console.log('No credentials stored');
    }
  } catch (error) {
    console.log("Keychain couldn't be accessed!", error);
  }
  await Keychain.resetGenericPassword();
};