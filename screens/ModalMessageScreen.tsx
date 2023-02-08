import React from 'react';
import { View, TextInput, Button, 
    KeyboardAvoidingView,
    StyleSheet,
    Platform,
    TouchableWithoutFeedback,
    Keyboard} from "react-native";
import { UserCredContext, EventEmitDispatchContext } from '../AppNav';
import { Event } from '../ClientWebSocket';
import EventProcessor from '../EventProcessor';
import { MessageScreenProps } from "../NavStackParamTypes";
import { Cred } from '../security/SecureKeychain';


export function ModalMessageScreen({ navigation, route }: MessageScreenProps) {
    const cred : Cred = React.useContext(UserCredContext);
    const eventEmitDispatchContext = React.useContext(EventEmitDispatchContext);
    const [value, onChangeText] = React.useState('');

    // If you type something in the text box that is a color, the background will change to that
    // color.
    
    let flex = Keyboard.isVisible() ? StyleSheet.flatten({flex: 0.6}) : StyleSheet.flatten({flex: 0.8});

    function sendMessage(value: string){
        console.log(`[ModalMessageScreen] :: [sendMessage] :: start`);
        console.log(`[ModalMessageScreen] :: [sendMessage] :: msg :: ${value}`);
        let e : string = "";
        try{
            if(value && cred) {
                // text note
                let kind : number = 1;
                // no tag 
                let tags : Array<Array<string>> = [];
                let event : Event = EventProcessor.createEvent(value, kind, tags, cred);
                if (event) {
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
                        marginBottom:'0%'                        
                    }}>
                    <Button
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