import * as React from 'react';
import {Button, Text, View} from 'react-native';
import {
  AuthContext,
  NostrServerList,
  secureStorage,
  UserNameServer,
  createCredentialObj,
} from './AppNav';

export function SignUpScreen({navigation}) {
  //const secureStorage : ClientCrypto = new ClientCrypto();
  const {signUp} = React.useContext(AuthContext);

  const [pubKey, setPubkey] = React.useState('');
  const [privKey, setPrivKey] = React.useState('');
  const [userName, setUserName] = React.useState('');
  const [server, setServer] = React.useState('');
  const [serverList, setServerList] = React.useState<Array<string>>();

  React.useEffect(() => {
    setServerList(NostrServerList);
  }, []);

  const genKey = async () => {
    let privKeyVal: string = secureStorage.generatePrivateKey();
    console.log('[privKeyVal] :: ' + privKeyVal);
    let pubKeyVal: string = secureStorage.getPublicKeyFromPrivKey(privKeyVal);
    console.log('[pubKeyVal] :: ' + pubKeyVal);
    setPrivKey(privKeyVal);
    setPubkey(pubKeyVal);
  };
  //let userToken : Cred = secureStorage.generateCredentials("Demo User", "Demo Server");
  //let server = "default server"
  return (
    <View>
      <UserNameServer
        userName={userName}
        setUserName={setUserName}
        server={server}
        setServer={setServer}
        serverList={serverList}
      />

      <Text selectable={true} selectionColor="grey">
        pubKey : {pubKey}
      </Text>
      <Text selectable={true} selectionColor="grey">
        privKey : {privKey}
      </Text>
      <Button title="Gen Key" onPress={genKey} />
      <Button
        title="Create Account"
        disabled={pubKey && privKey && userName && server ? false : true}
        onPress={() =>
          signUp(createCredentialObj(privKey, pubKey, userName, server))
        }
      />
    </View>
  );
}
