import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useContext, useEffect } from 'react';
import { View, Text, TextInput, Button, 
    KeyboardAvoidingView,
    StyleSheet,
    Platform,
    TouchableWithoutFeedback,
    Keyboard} from "react-native";
import { UserCredContext, EventEmitStateContext, EventEmitDispatchContext } from '../AppNav';
import ClientWebSocket, { Event, MessageType } from '../ClientWebSocket';
import EventProcessor from '../EventProcessor';
//import { ClientSocketContext } from '../HomeScreen';
import { MessageScreenProps } from "../NavStackParamTypes";
import { Cred } from '../security/SecureKeychain';


export function ModalMessageScreen({ navigation, route }: MessageScreenProps) {
    const cred : Cred = React.useContext(UserCredContext);
    //const eventEmitStateContext : Event[] = React.useContext(EventEmitStateContext);
    const eventEmitDispatchContext = React.useContext(EventEmitDispatchContext);
    //let clientSocket : ClientWebSocket= JSON.parse(React.useContext(ClientSocketContext));
    
    
    
    const [value, onChangeText] = React.useState('');
    //const [keyBoardVisible, setKeyBoardVisible] = React.useState(false);

    
    //let flex = StyleSheet.flatten({flex: 0.9});

    // If you type something in the text box that is a color, the background will change to that
    // color.
    /*
        <View style={{ 
                alignItems: 'center', 
                justifyContent: 'center',
                flexGrow: 0,
                flexShrink: 0, }}>
                <Text>
                    Message
                </Text>
        </View>
    */
    
    //setKeyBoardVisible(Keyboard.isVisible());
    let flex = Keyboard.isVisible() ? StyleSheet.flatten({flex: 0.6}) : StyleSheet.flatten({flex: 0.8});

    function sendMessage(value: string){
        console.log(`[ModalMessageScreen] :: [sendMessage] :: start`);
        console.log(`[ModalMessageScreen] :: [sendMessage] :: msg :: ${value}`);
        //console.log(`[ModalMessageScreen] :: [sendMessage] :: clientSocket :: ${JSON.stringify(clientSocket)}`);
        let e : string = "";
        try{
            if(value && cred) {
                //const sendToSocketFunc : (event: object | undefined, url?: string | undefined) => void = route.params.sendToSocketFunc;
                //console.log(`[ModalMessageScreen] :: [sendMessage] :: clientSocket :: ${JSON.stringify(clientSocket)}`);
                //kind : number, tags : [string[]],
                // text note
                let kind : number = 1;
                // no tag 
                let tags : Array<Array<string>> = [];
                let event : Event = EventProcessor.createEvent(value, kind, tags, cred);
                if (event) {
                    //clientSocket.sendEvent(event);
                    //e = JSON.stringify(event);
                    //sendToSocketFunc(event);
                    //emitEvent = event;
                    eventEmitDispatchContext({
                        type: "add",
                        event: event
                    })
                    console.log(`[ModalMessageScreen] :: [sendMessage] :: message sent :: e :: ` + e);
                    //navigation.navigate('Home', {event : e});
                } else {
                    console.log(`[ModalMessageScreen] :: [sendMessage] ::  message not sent, no event :: event :: ${event}`);
                }
                console.log(`[ModalMessageScreen] :: [sendMessage] :: end`);
                //navigation.navigate('Home', {event : e});
            } else {
                console.log(`[ModalMessageScreen] :: [sendMessage] ::  message not sent as msg or cred are undefined`);
                console.log(`[ModalMessageScreen] :: [sendMessage] :: msg :: ${value}`);
                console.log(`[ModalMessageScreen] :: [sendMessage] :: cred :: ${cred}`);
            }
            //navigation.navigate('Home');
        } catch (e) {
            console.log(`[ModalMessageScreen] :: [sendMessage] :: something went wrong, message not sent, ${e}`);
            //navigation.navigate('Home');
        }
        console.log(`[ModalMessageScreen] :: [sendMessage] :: end`);
        navigation.navigate('Home');
    }

    return (

        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={flex}
                >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View >
                        <TextInput
                            editable
                            multiline
                            //numberOfLines={10}
                            //maxLength={40}
                            onChangeText={text => onChangeText(text)}
                            value={value}
                            placeholder="Write Message..."
                            style={{padding: 10}}
                        />
                        
                    </View>
                    
                </TouchableWithoutFeedback>
                
                <View 
                    style={{
                        //flex:0.1,
                        //flexGrow:0,
                        //flexShrink:0,
                        //position:'absolute',
                        //display:'none',
                        marginBottom:'0%'
                        //bottom:'0%',
                        //width:'100%',
                        
                    }}>
                    <Button
                        //onPress={() => navigation.navigate('Home')}
                        onPress={()=>{sendMessage(value)}}
                        title="Send Message"
                        disabled = {value && value.trim() ? false : true}
                    />
                </View>

            </KeyboardAvoidingView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    inner: {
      padding: 24,
      flex: 1,
      justifyContent: 'space-around',
    },
    header: {
      fontSize: 36,
      marginBottom: 48,
    },
    textInput: {
      height: 40,
      borderColor: '#000000',
      borderBottomWidth: 1,
      marginBottom: 36,
    },
    btnContainer: {
      backgroundColor: 'white',
      marginTop: 12,
    },
});



/*
            
            
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.header}>Header</Text>
          <TextInput placeholder="Username" style={styles.textInput} />
          <View style={styles.btnContainer}>
            <Button title="Submit" onPress={() => null} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>

*/

/*
        <View style={{
                minHeight:'100%',
                flexDirection: 'column',
            }}>

                    <View
                        >
                        <TextInput
                            editable
                            multiline
                            //numberOfLines={4}
                            //maxLength={40}
                            onChangeText={text => onChangeText(text)}
                            value={value}
                            placeholder="Write Message..."
                            style={{padding: 10}}
                        />
                    </View>

            
            <View 
                style={{
                    //flexGrow:0,
                    //flexShrink:0,
                    position:'absolute',
                    //display:'none',
                    //marginBottom:'0%'
                    bottom:'0%',
                    width:'100%',
                    
                }}>
                <Button
                    onPress={() => navigation.navigate('Home')}
                    title="Send Message"
                />
            </View>
        </View>
*/