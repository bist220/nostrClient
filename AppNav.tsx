import * as React from 'react';
import { Button, Text, TextInput, View, FlatList, Pressable, Modal, StyleSheet, ScrollView, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
//import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientCrypto, { Bech32PrefixCode } from './ClientCrypto';
import { Cred } from './security/SecureKeychain';
import { RootStackParamList } from './NavStackParamTypes';
import { DetailScreen } from './screens/DetailScreen';
import { ModalMessageScreen } from './screens/ModalMessageScreen';
import { HomeScreen } from './HomeScreen';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Event } from './ClientWebSocket';
import { SplashScreen } from './SplashScreen';

interface  AuthContextType {
  signIn: (cred: Cred) => Promise<void>;
  signOut: () => void;
  signUp: (cred: Cred) => Promise<void>;
}

interface EventEmitDispatchType {
  id:string;
  type:string;
  event:Event;
}

//const AuthContext = React.createContext();
export const AuthContext = React.createContext<AuthContextType>({} as AuthContextType);
export const UserCredContext = React.createContext<Cred>({} as Cred);
export const EventEmitStateContext = React.createContext<Array<Event>>([]);
export const EventEmitDispatchContext = React.createContext(null);

export const NostrServerList:Array<string> = ["wss://relay.nostr.info","wss://relay.damus.io"]

/*
function HomeScreen() {
  const { signOut } = React.useContext(AuthContext);

  return (
    <View>
      <Text>Signed in!</Text>
      <Button title="Sign out" onPress={() => signOut()} />
    </View>
  );
}
*/

const secureStorage : ClientCrypto = new ClientCrypto();

function SignInScreen({ navigation }) {

  const { signIn } = React.useContext(AuthContext);

  const [credentials, setCredentials] = React.useState<Array<Cred>>([]);

  const [pubKey, setPubkey] = React.useState('');
  const [privKey, setPrivKey] = React.useState('');
  const [validPubKey, setValidPubKey] = React.useState(false);
  const [validPrivKey, setValidPrivKey] = React.useState(false);
  const [hidePrivKey, setHidePrivKey] = React.useState(true);
  
  const [userName, setUserName] = React.useState("");
  const [server, setServer] = React.useState("");
  const [serverList, setServerList] = React.useState<Array<string>>();
  
  const keySize : number = 64

  React.useEffect(()=>{
    setServerList(NostrServerList);
  },[]);

  const isValidPubKey = (key : string) => {
    setPubkey(key);
    (key.length===keySize) ? setValidPubKey(true) : setValidPubKey(false);
  }

  const isValidPrivKey = (key : string) => {
    setPrivKey(key);
    (key.length===keySize) ? setValidPrivKey(true) : setValidPrivKey(false);
  }

  React.useEffect(()=>{
    loadAllCreds();
  }, []);

  const loadAllCreds = async () => {
    let creds : Cred[];
    try {
      // Restore token stored in `SecureStore` or any other encrypted storage
      await secureStorage.getAllCredentialsFromStore()
        .then(tokens => {
          console.log(`[AppNav] :: [useEffect] :: token :: ${JSON.stringify(tokens)}`);
          if(tokens) {
            console.log(`[AppNav] :: [useEffect] :: token :: ${JSON.stringify(tokens)}`);
            creds = tokens;
          } else {
            console.log("[AppNav] :: [useEffect] :: No user found!");
            //throw new Error("No user found!");
          }
        })
        .catch(e => console.log("[AppNav] :: [useEffect] :: [catch] :: " + e));
    } catch (e) {
      // Restoring token failed
      //creds = secureStorage.generateCredentials("Demo User", "Demo Server");
      console.log("[SignInScreen] :: [loadAllCreds] :: " + e);
    }
    if(creds && creds.length>0) {
      setCredentials(creds);
      return creds;
    } else return false;
  }

  /*
  const renderItem = ({data}) => {
    return (
      <Text>{data.username}</Text>
    );
  }
  */

  const renderItem = ({item} : {item:Cred}) => {
    /*
      <Pressable onPress={() => signIn(item)}>
        <Text>{item.username}</Text>
      </Pressable>
    */
    return (
      <Pressable
        onPress={() => signIn(item)}
        style={({pressed}) => [
          {
            backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
          },
          styles.wrapperCustom,
        ]}>
        <Text>{item.username} :: {item.server}</Text>
      </Pressable>
    )
  }

  //<Text style={{fontSize:32}}> {`\uF341`} Show Private Key </Text>

  return (
    <View>
      <UserNameServer userName={userName} setUserName={setUserName} server={server} setServer={setServer}
        serverList={serverList} />
      
      
      <TextInput
        placeholder="Public Key"
        value={pubKey}
        onChangeText={isValidPubKey}
      />
      {
        !validPubKey &&
          <Text style={{fontSize:12}}>*key should be {keySize} characters in length</Text>
        
      }
      <TextInput
        placeholder="Private Key"
        value={privKey}
        onChangeText={isValidPrivKey}
        secureTextEntry={hidePrivKey}
      />
      <Pressable onPress={() => { setHidePrivKey(!hidePrivKey) } }
        style={({pressed}) => [
          {
            backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
          },
          styles.wrapperCustom,
        ]}>
        <Text style={{fontSize:20}}> {`\uF341`} Show Private Key </Text>
      </Pressable>

      {
        !validPrivKey &&
          <Text style={{fontSize:12}}>*key should be {keySize} characters in length</Text>
      }
      <Button title="Connect" disabled={(validPrivKey && validPubKey && server) ? false : true} onPress={() => signIn( createCredentialObj(privKey, pubKey, userName, server) )} />
      <Button title="Create account" onPress={() => navigation.navigate('SignUp') } />
      
      {
        credentials && credentials.length>0 && (
          <>
            <Text>Or select from below users</Text>
            <FlatList
            //style={{margin: 40}}
            data={credentials}
            renderItem={renderItem}
            keyExtractor={(cred) => cred.pubKey} />
            <>
              <DeleteUsers setCredentials={setCredentials}></DeleteUsers>
            </>
          </>
          
        )
      }      
      
    </View>
  );
}

const SelectServer = ({server, setServer, serverList}) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const setServerOnPress = (serverStr:string) => {
    setServer(serverStr);
    setModalVisible(!modalVisible);
  }
  
  const renderItem = ({item} : {item:string}) => {
    /*
      <Pressable onPress={() => signIn(item)}>
        <Text>{item.username}</Text>
      </Pressable>
    */
    return (
      <Pressable
        onPress={(e) => setServerOnPress(item)}
        style={({pressed}) => [
          {
            backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
          },
          styles.wrapperCustom,
        ]}>
        <Text>{item}</Text>
      </Pressable>
    )
  }

  return (
    <View style={stylesModal.centeredView}>
      
      <Modal
        style={stylesModal.modalCenteredView}
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          //Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={stylesModal.centeredView}>
          
          <View style={{maxHeight:500}}>
            <View style={stylesModal.modalView}>
              <Text style={stylesModal.modalText}>Select Server</Text>
              <FlatList
              style={{margin: 40 , maxHeight:300}}
              data={serverList}
              renderItem={renderItem}
              />
              <Pressable
                style={[stylesModal.button, stylesModal.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={stylesModal.textStyle}>Cancel</Text>
              </Pressable>
              
            </View>
          </View>
        </View>
      </Modal>
      
      <Pressable
        style={[stylesModal.button, stylesModal.buttonOpen, stylesModal.modalButton]}
        onPress={() => setModalVisible(true)}>
        <Text style={stylesModal.textStyle}>Select Server</Text>
      </Pressable>
    </View>
  );
};

const DeleteUsers = ({setCredentials}) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  return (
    <View style={stylesModal.centeredView}>
      <Modal
        style={stylesModal.modalCenteredView}
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          //Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={stylesModal.centeredView}>
          <View style={stylesModal.modalView}>
            <Text style={stylesModal.modalText}>Delete User?</Text>
            <Pressable
              style={[stylesModal.button, stylesModal.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={stylesModal.textStyle}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[stylesModal.button, stylesModal.buttonClose]}
              onPress={() => {
                  setModalVisible(!modalVisible);
                  deleteUsers();
                  setCredentials(null);
                }
              }>
              <Text style={stylesModal.textStyle}>Delete!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Pressable
        style={[stylesModal.button, stylesModal.buttonOpen, stylesModal.modalButton]}
        onPress={() => setModalVisible(true)}>
        <Text style={stylesModal.textStyle}>Delete All Account</Text>
      </Pressable>
    </View>
  );
};

/*
  {({pressed}) => (
    <Text style={styles.text}>{pressed ? 'Pressed!' : 'Press Me'}</Text>
  )}
*/
/*
function PressHighlight ({opPress, children}) {
  console.log("[PressHighlight] :: opPress :: " + JSON.stringify(opPress))
  console.log("[PressHighlight] :: children :: " + JSON.stringify(children))
  return (
    <Pressable
        onPress={opPress}
        style={({pressed}) => [
          {
            backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
          },
          styles.wrapperCustom,
        ]}>
        {children}
    </Pressable>
  )
}
*/


function deleteUsers() {
  secureStorage.resetUsers().then().catch(e=>{
    console.log("[AppNav] :: deleteUsers :: err " + e)
  });
}

function createCredentialObj(privKey: string, pubKey: string, userName: string, server: string) {
    let cred: Cred = {
      privKey: privKey,
      pubKey: pubKey,
      username: userName,
      server: server,
      lastUpdated: new Date(),
      bech32Pub : secureStorage.getBech32EncodedKeyFromHex(Bech32PrefixCode.npub, pubKey),
      bech32Priv : secureStorage.getBech32EncodedKeyFromHex(Bech32PrefixCode.nsec, privKey)
    };
    return cred;
}

function UserNameServer ({userName, setUserName, server, setServer, serverList}) {
  /*
    <TextInput
        placeholder="Server"
        value={server}
        onChangeText={setServer}
    />
  */
  return (
    <>
      <TextInput
          placeholder="User Name"
          value={userName}
          onChangeText={setUserName}
        />
      <Text>
        {server}
      </Text>
      <SelectServer server={server} setServer={setServer} serverList={serverList}></SelectServer>
    </>
  );
}

function SignUpScreen({ navigation }) {
  //const secureStorage : ClientCrypto = new ClientCrypto();
  const { signUp } = React.useContext(AuthContext);

  const [pubKey, setPubkey] = React.useState('');
  const [privKey, setPrivKey] = React.useState('');
  const [userName, setUserName] = React.useState('');
  const [server, setServer] = React.useState("");
  const [serverList, setServerList] = React.useState<Array<string>>();
  

  React.useEffect(()=>{
    setServerList(NostrServerList);
  },[]);

  const genKey = async () => {
    let privKeyVal : string = secureStorage.generatePrivateKey();
    console.log("[privKeyVal] :: " + privKeyVal);
    let pubKeyVal : string = secureStorage.getPublicKeyFromPrivKey(privKeyVal);
    console.log("[pubKeyVal] :: " + pubKeyVal);
    setPrivKey(privKeyVal);
    setPubkey(pubKeyVal);
  }
  //let userToken : Cred = secureStorage.generateCredentials("Demo User", "Demo Server");
  //let server = "default server"

  return (
    <View>
      <UserNameServer 
        userName={userName} 
        setUserName={setUserName} 
        server={server} 
        setServer={setServer} 
        serverList={serverList} />

      <Text selectable={true} selectionColor='grey'>
        pubKey : {pubKey}
      </Text>
      <Text selectable={true} selectionColor='grey'>
        privKey : {privKey}
      </Text>
      <Button title="Gen Key" onPress={genKey} />
      <Button title="Create Account" disabled={(pubKey && privKey && userName && server) ? false : true }  onPress={() => signUp( createCredentialObj(privKey, pubKey, userName, server) )} />
    </View>
  );
}





/*
  Main App
*/

//const Stack = createStackNavigator();
const Stack = createNativeStackNavigator();

export default function App({ navigation }) {
  //const secureStorage : ClientCrypto = new ClientCrypto();
  interface AuthScreenState {
    isLoading: boolean,
    isSignout: boolean,
    userToken: Cred,
  }

  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  const [eventEmitState, eventEmitDispatch] = React.useReducer(
    (events , action) => {
      switch (action.type) {
        case "add": {
          return [
            ...events,
            action.event
          ];
        };
        case "delete": {
          return events.filter(e => e.id!==action.id);
        };
      }
    },
    []
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;
      //new SecureKeychain().reset();
      try {
        // Restore token stored in `SecureStore` or any other encrypted storage
        // userToken = await SecureStore.getItemAsync('userToken');
        await secureStorage.getDefaultUserCredentialFromStore()
          .then(token => {
            console.log(`[AppNav] :: [useEffect] :: token :: ${JSON.stringify(token)}`);
            if(token) {
              console.log(`[AppNav] :: [useEffect] :: token :: ${JSON.stringify(token)}`);
              userToken = token;
              //userToken.server = "wss://relay.damus.io"
            } else {
              console.log("[AppNav] :: [useEffect] :: No user found!");
              //throw new Error("No user found!");
            }
          })
          .catch(e => console.log("[AppNav] :: [useEffect] :: [catch] :: " + e));
      } catch (e) {
        // Restoring token failed
        //userToken = secureStorage.generateCredentials("Demo User", "Demo Server");
      }

      // After restoring token, we may need to validate it in production apps

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };

    bootstrapAsync();
  }, []);

  //useMemo is a React Hook that lets you cache the result of a calculation between re-renders.
  //const cachedValue = useMemo(calculateValue, dependencies)
  const authContext = React.useMemo(
    () => ({
      signIn: async (cred : Cred ) => { //{ pubkey, privKey }) => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `SecureStore` or any other encrypted storage
        // In the example, we'll use a dummy token
        /*
        let cred : Cred = {
          privKey : privKey,
          pubKey : pubkey,
          username : "",
          server : "",
          lastUpdated : new Date()
        }
        */

        if(secureStorage.isValidCred(cred)) {
          dispatch({ type: 'SIGN_IN', token: cred });
        } else {
          Alert.alert("Status: Invalid credentials.");
          dispatch({ type: 'SIGN_OUT' });
        }
      },
      signOut: () => dispatch({ type: 'SIGN_OUT' }),
      signUp: async (cred : Cred ) => { //({userName, pubKey, privKey, server}) => {
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `SecureStore` or any other encrypted storage
        // In the example, we'll use a dummy token

        //{userName, pubKey, privKey, server}
        let userToken;

        try {
          // Restore token stored in `SecureStore` or any other encrypted storage
          // userToken = await SecureStore.getItemAsync('userToken');
          let token = await secureStorage.addNewCredentialsToStore(cred.username, cred.pubKey, cred.privKey, cred.server);
            
          console.log(`[AppNav] :: [signUp] :: token :: ${JSON.stringify(token)}`);
          if(token) {
            //console.log(`[AppNav] :: [useEffect] :: token :: ${JSON.stringify(token)}`);
            console.log(`[AppNav] :: [useEffect] :: token :: ${token}`);
            userToken = token;
          } else {
            console.log("[AppNav] :: [useEffect] :: unable to signUp");
            //throw new Error("No user found!");
          }
        } catch (e) {
          // Restoring token failed
          //userToken = secureStorage.generateCredentials("Demo User", "Demo Server");
          console.log(`[AppNav] :: [useEffect] :: :: [catch] :: something went wrong while signUp`);
          console.log(`[AppNav] :: [useEffect] :: :: [catch] :: err :: ${e}`);
        }

        dispatch({ type: 'SIGN_IN', token: userToken });
      },
    }),
    []
  );
  
  console.log("[AppNav] :: [AppNav] :: [state.userToken] :: [cred] :: " + JSON.stringify(state.userToken));

  const Stack = createNativeStackNavigator<RootStackParamList>();
  //const Stack = createStackNavigator<RootStackParamList>();
  
  return (
    <AuthContext.Provider value={authContext}>
      <UserCredContext.Provider value={state.userToken}>
        <EventEmitDispatchContext.Provider value={eventEmitDispatch}>
        <EventEmitStateContext.Provider value={eventEmitState}>
          <NavigationContainer>
            <Stack.Navigator>
              {state.isLoading ? (
                // We haven't finished checking for the token yet
                <Stack.Screen name="Loading" component={SplashScreen} />
              ) : state.userToken == null ? (
                // No token found, user isn't signed in
                <>
                  <Stack.Screen
                    name="SignIn"
                    component={SignInScreen}
                    options={{
                      title: 'Sign in',
                      // When logging out, a pop animation feels intuitive
                      animationTypeForReplace: state.isSignout ? 'pop' : 'push',
                    }}
                  />
                  <Stack.Screen
                    name="SignUp"
                    component={SignUpScreen}
                    options={{
                      title: 'Sign up',
                      // When logging out, a pop animation feels intuitive
                      animationTypeForReplace: state.isSignout ? 'pop' : 'push',
                    }}
                  />
                </>
              ) : (
                // User is signed in
                <>
                  <Stack.Group>
                      <Stack.Screen name="Home" component={HomeScreen} />
                      <Stack.Screen name="Details" component={DetailScreen} />
                      <Stack.Screen name="Message" component={ModalMessageScreen} />
                  </Stack.Group>
                  
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </EventEmitStateContext.Provider>
        </EventEmitDispatchContext.Provider>
      </UserCredContext.Provider>
    </AuthContext.Provider>
  );
}

/*
  <Stack.Group screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen name="Message" component={ModalMessageScreen} />
  </Stack.Group>
*/

const styles = StyleSheet.create({
  // pressable
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
  },
  wrapperCustom: {
    borderRadius: 8,
    padding: 6,
  },
  logBox: {
    padding: 20,
    margin: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
  },

});


const stylesModal = StyleSheet.create({
  // modal
  modalCenteredView: {
    //position:'absolute',
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  centeredView: {
    //position:'relative',
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    margin:10,
  },
  buttonOpen: {
    //backgroundColor: '#F194FF',
    backgroundColor: 'white'
  },
  buttonClose: {
    //backgroundColor: '#2196F3',
    backgroundColor: 'white'
  },
  textStyle: {
    //color: 'white',
    color:'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButton:{
    height:50,
    justifyContent: 'center',
    alignItems: 'center',
  }

});