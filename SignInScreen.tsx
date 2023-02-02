import * as React from 'react';
import {Button, Text, TextInput, View, FlatList, Pressable} from 'react-native';
import {Cred} from './security/SecureKeychain';
import {
  AuthContext,
  NostrServerList,
  secureStorage,
  styles,
  UserNameServer,
  createCredentialObj,
  DeleteUsers,
} from './AppNav';

export function SignInScreen({navigation}) {
  const {signIn} = React.useContext(AuthContext);

  const [credentials, setCredentials] = React.useState<Array<Cred>>([]);

  const [pubKey, setPubkey] = React.useState('');
  const [privKey, setPrivKey] = React.useState('');
  const [validPubKey, setValidPubKey] = React.useState(false);
  const [validPrivKey, setValidPrivKey] = React.useState(false);
  const [hidePrivKey, setHidePrivKey] = React.useState(true);

  const [userName, setUserName] = React.useState('');
  const [server, setServer] = React.useState('');
  const [serverList, setServerList] = React.useState<Array<string>>();

  const keySize: number = 64;

  React.useEffect(() => {
    setServerList(NostrServerList);
  }, []);

  const isValidPubKey = (key: string) => {
    setPubkey(key);
    key.length === keySize ? setValidPubKey(true) : setValidPubKey(false);
  };

  const isValidPrivKey = (key: string) => {
    setPrivKey(key);
    key.length === keySize ? setValidPrivKey(true) : setValidPrivKey(false);
  };

  React.useEffect(() => {
    loadAllCreds();
  }, []);

  const loadAllCreds = async () => {
    let creds: Cred[];
    try {
      // Restore token stored in `SecureStore` or any other encrypted storage
      await secureStorage
        .getAllCredentialsFromStore()
        .then(tokens => {
          console.log(
            `[AppNav] :: [useEffect] :: token :: ${JSON.stringify(tokens)}`,
          );
          if (tokens) {
            console.log(
              `[AppNav] :: [useEffect] :: token :: ${JSON.stringify(tokens)}`,
            );
            creds = tokens;
          } else {
            console.log('[AppNav] :: [useEffect] :: No user found!');
            //throw new Error("No user found!");
          }
        })
        .catch(e => console.log('[AppNav] :: [useEffect] :: [catch] :: ' + e));
    } catch (e) {
      // Restoring token failed
      //creds = secureStorage.generateCredentials("Demo User", "Demo Server");
      console.log('[SignInScreen] :: [loadAllCreds] :: ' + e);
    }
    if (creds && creds.length > 0) {
      setCredentials(creds);
      return creds;
    } else {
      return false;
    }
  };

  /*
  const renderItem = ({data}) => {
    return (
      <Text>{data.username}</Text>
    );
  }
  */
  const renderItem = ({item}: {item: Cred}) => {
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
        <Text>
          {item.username} :: {item.server}
        </Text>
      </Pressable>
    );
  };

  //<Text style={{fontSize:32}}> {`\uF341`} Show Private Key </Text>
  return (
    <View>
      <UserNameServer
        userName={userName}
        setUserName={setUserName}
        server={server}
        setServer={setServer}
        serverList={serverList}
      />

      <TextInput
        placeholder="Public Key"
        value={pubKey}
        onChangeText={isValidPubKey}
      />
      {!validPubKey && (
        <Text style={{fontSize: 12}}>
          *key should be {keySize} characters in length
        </Text>
      )}
      <TextInput
        placeholder="Private Key"
        value={privKey}
        onChangeText={isValidPrivKey}
        secureTextEntry={hidePrivKey}
      />
      <Pressable
        onPress={() => {
          setHidePrivKey(!hidePrivKey);
        }}
        style={({pressed}) => [
          {
            backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
          },
          styles.wrapperCustom,
        ]}>
        <Text style={{fontSize: 20}}> {'\uF341'} Show Private Key </Text>
      </Pressable>

      {!validPrivKey && (
        <Text style={{fontSize: 12}}>
          *key should be {keySize} characters in length
        </Text>
      )}
      <Button
        title="Connect"
        disabled={validPrivKey && validPubKey && server ? false : true}
        onPress={() =>
          signIn(createCredentialObj(privKey, pubKey, userName, server))
        }
      />
      <Button
        title="Create account"
        onPress={() => navigation.navigate('SignUp')}
      />

      {credentials && credentials.length > 0 && (
        <>
          <Text>Or select from below users</Text>
          <FlatList
            //style={{margin: 40}}
            data={credentials}
            renderItem={renderItem}
            keyExtractor={cred => cred.pubKey}
          />
          <>
            <DeleteUsers setCredentials={setCredentials} />
          </>
        </>
      )}
    </View>
  );
}
