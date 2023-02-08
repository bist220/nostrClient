import React, { useEffect, useReducer, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Image, StatusBar, SafeAreaView, Pressable, Platform } from "react-native";
import { AuthContext, EventEmitDispatchContext, EventEmitStateContext, UserCredContext } from './AppNav';
import { NostrServerList } from "./NostrServerList";
import ClientWebSocket, { ClientMessage, Event } from "./ClientWebSocket";
import { HomeScreenProps, GenericScreenNavigationProp } from './NavStackParamTypes';
import { Cred } from './security/SecureKeychain';

let profilePic = require('./asset/user.png')


let clientSocket : ClientWebSocket;
let crrMsgCount: number =0;
let data : Array<ClientMessage> = new Array();

export const HomeScreen = ({ navigation, route }: HomeScreenProps) => {

    const cred : Cred = React.useContext(UserCredContext);
    const { signOut } = React.useContext(AuthContext);

    const eventEmitStateContext : Event[] = React.useContext(EventEmitStateContext);
    const eventEmitDispatchContext = React.useContext(EventEmitDispatchContext);

    const serverList:Array<string> = NostrServerList;
    let defaultUrl : string = cred.server;
    if(!cred.server) {
        defaultUrl = serverList[0];    
    }

    type MsgActionType = {type:string, msg:ClientMessage};
    const msgReducer = (prevMsgs : ClientMessage[] , action : MsgActionType) => {
        switch (action.type) {
            case 'ADD' : {
                return [
                    ...prevMsgs,
                    action.msg,
                ];
            }
        }
        return prevMsgs;
    }
    const [msgs, setMsgs] = useReducer<typeof msgReducer , Array<ClientMessage>> (
        msgReducer, new Array<ClientMessage>(), arr => arr);

    type MetaMsgActionType = {type:string, msg:ClientMessage};
    const metaMsgsReducer = (prevMetaMsg: Map<string, ClientMessage>, action: MetaMsgActionType) => {
        switch (action.type) {
            case 'ADD' : {
                let newMetaMsgs = new Map(prevMetaMsg);
                newMetaMsgs.set(action.msg.fullEvent.pubkey, action.msg);
                //setMetaMsgs(newMetaMsgs);
                return newMetaMsgs;
            }
        }
        return prevMetaMsg;
    }
    const [metaMsgs, setMetaMsgs] = useReducer<typeof metaMsgsReducer , Map<string, ClientMessage>>(
        metaMsgsReducer, new Map<string, ClientMessage>(), arr => arr);

    type IdMsgsActionType = {type:string, msg:ClientMessage};
    const idMsgsReducer = (prevIdMsgMsg: Map<string, ClientMessage>, action: IdMsgsActionType) => {
        switch (action.type) {
            case 'ADD' : {
                let newMapIdMsgs = new Map(prevIdMsgMsg);
                newMapIdMsgs.set(action.msg.fullEvent.id, action.msg);
                return newMapIdMsgs;
            }
        }
        return prevIdMsgMsg;
    }
    const [mapIdMsgs, setMapIdMsgs] = useReducer<typeof idMsgsReducer , Map<string, ClientMessage>>(
        idMsgsReducer, new Map<string, ClientMessage>(), arr => arr);

    useEffect(() => {
        console.log("[HomeScreen] :: cred :: " + cred);
        console.log("[HomeScreen] :: cred.server :: " + cred.server);

        clientSocket = ClientWebSocket.getInstance();
        clientSocket.addDefaultRelayUrl(defaultUrl);
        console.log("[HomeScreen] :: server :: " + cred.server);

        clientSocket.addRemoteUrl(serverList);
        clientSocket.openConnections(msgHandler)
            .then((e)=>{console.log("[HomeScreen] :: [useEffect] :: [openConnections] :: done!")})
            .catch((e)=>{console.log("[HomeScreen] :: [useEffect] :: [openConnections] :: something went wrong, " + e)});

        console.log("[HomeScreen] :: [useEffect] :: Platform.OS " + Platform.OS);
        console.log("[HomeScreen] :: [useEffect] :: Platform.OS " + Platform.Version);
        return () => {
            sendCloseReqToSockets();
        };

    }, []);

    useEffect(()=>{
        console.log("[HomeScreen] :: [useEffect] :: event :: start");
        console.log("[HomeScreen] :: [useEffect] :: event :: start " + JSON.stringify(eventEmitStateContext));
        console.log("[HomeScreen] :: [useEffect] :: length :: " + JSON.stringify(eventEmitStateContext.length));
        if(eventEmitStateContext.length>0) {
            let event : Event = eventEmitStateContext[eventEmitStateContext.length -1]
            console.log("[HomeScreen] :: [useEffect] :: inside if event :: " + JSON.stringify(event));
            if(event) {
                console.log("[HomeScreen] :: [useEffect] :: event :: " + JSON.stringify(event));
                clientSocket.sendEvent(event);
                console.log("[HomeScreen] :: [useEffect] :: event :: " + JSON.stringify(event));
                console.log("[HomeScreen] :: [useEffect] :: deleting event :: " + JSON.stringify(event));
                if(eventEmitDispatchContext) {
                    eventEmitDispatchContext({
                        type: "delete",
                        id: event.id
                    })
                }
                console.log("[HomeScreen] :: [useEffect] :: after delete event length :: " + JSON.stringify(eventEmitStateContext.length));
            }            
        }
        console.log("[HomeScreen] :: [useEffect] :: event :: " + JSON.stringify(eventEmitStateContext));
        console.log("[HomeScreen] :: [useEffect] :: event :: end");
    },[eventEmitStateContext]);    

    useEffect(()=>{
        console.log("[HomeScreen] :: [useEffect] :: start");
        console.log("[HomeScreen] :: [useEffect] :: msgs.length-crrMsgCount == " + (msgs.length-crrMsgCount));
        if((msgs.length-crrMsgCount)>=10) {
            console.log("[HomeScreen] :: [useEffect] :: msgs.length-crrMsgCount>=20 :: closing sockets start");
            resetCount();
            console.log("[HomeScreen] :: [useEffect] :: crrMsgCount :: " + crrMsgCount);
            sendCloseReqToSockets();
            console.log("[HomeScreen] :: [useEffect] :: msgs.length-crrMsgCount>=20 :: closing sockets end");
            console.log("[HomeScreen] :: [useEffect] :: msgs.length == " + msgs.length);
            console.log("[HomeScreen] :: [useEffect] :: crrMsgCount == " + crrMsgCount);
            console.log("[HomeScreen] :: [useEffect] :: msgs.length-crrMsgCount == " + (msgs.length-crrMsgCount));
        }
    })

    const resetCount = () => {
        crrMsgCount = msgs.length;
    }

    const msgHandler = (msg: ClientMessage, kind: number) => {
        if (!mapIdMsgs.has(msg.id)) {
            console.log("[HomeScreen] :: [useEffect] :: [msgHandler] :: msg.id :: " + msg.id);
            console.log("[HomeScreen] :: [useEffect] :: [msgHandler] :: mapIdMsgs.has(msg.id) :: " + mapIdMsgs.has(msg.id));
            if (msg.kind == 0) {
                setMetaMsgs({
                    type: 'ADD',
                    msg: msg,
                });
            } else {
                setMsgs({
                    type: 'ADD',
                    msg: msg,
                });
            }
            setMapIdMsgs({
                type: 'ADD',
                msg: msg,
            });
        }
    };

    const signOutAndCloseSockets = () => {
        sendCloseReqToSockets();
        signOut();
    }

    const sendCloseReqToSockets = () => {
        console.log("closing connection...");
        clientSocket.closeConnection();
        console.log("connections closed!");
    };

    const renderItem = ({ item } : {item : ClientMessage}) => {
        let parentMsg = undefined;

        if (item && item.fullEvent) {
            let fullEvent = item.fullEvent;

            let tags: Array<Array<string>> = fullEvent.tags;
            if (tags && tags.length > 0) {
                let tag: string[] = tags.reduce((prevValue, currValue) => {
                    if (currValue[0] === "e") {
                        return currValue;
                    } else
                        return prevValue;
                });

                let eventId: string = tag[1];
                let referRemoteUrl = tag[2];
                if (mapIdMsgs.has(eventId)) {
                    parentMsg = mapIdMsgs.get(eventId);
                }
            }
        }
        const childData = { item: item, metaMsg: metaMsgs.get(item.fullEvent.pubkey) };
        if (parentMsg) {
            const parentData = { item: parentMsg, metaMsg: metaMsgs.get(parentMsg.fullEvent.pubkey) };
            return (
                <View style={styles.itemContainer}>
                    <View style={styles.childItem}>
                        <ViewPressableMessage navigation={navigation} data={childData} ></ViewPressableMessage>
                    </View>
                    <View style={styles.parentItem}>
                        <ViewPressableMessage navigation={navigation} data={parentData} ></ViewPressableMessage>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.itemContainer}>
                <View style={styles.childItem}>
                    <ViewPressableMessage navigation={navigation} data={childData} ></ViewPressableMessage>
                </View>
            </View>
        );
    };

    [refresh, setRefresh] = useState(false);

    const ITEM_HEIGHT : number = 300;
    
    if(data.length===0) {
        data = msgs.filter((m)=>m.kind!==0);
    }

    const refreshData = ()=>{
        setRefresh(true);
        getMessagesFromBuffer();
        setRefresh(false);
    }
    const getMessagesFromBuffer = () => {
        console.log("[HomeScreen] :: [getMessagesFromBuffer] :: start :: [data] " + JSON.stringify(data));
        if(data.length <= mapIdMsgs.size){
            let idMsgValuearr = Array.from(mapIdMsgs.values()).filter((m)=>m.kind!==0);
            let lastIndx = data.length;
            data.push(...idMsgValuearr.slice(lastIndx));
        }
        console.log("[HomeScreen] :: [getMessagesFromBuffer] :: end :: [data] " + JSON.stringify(data));
        console.log("[HomeScreen] :: [getMessagesFromBuffer] :: sendInitFiltersToOpenSockets start");
        clientSocket.sendInitFiltersToOpenSockets();
        console.log("[HomeScreen] :: [getMessagesFromBuffer] :: sendInitFiltersToOpenSockets end");
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{flexGrow : 2}}>
                <Button title="Sign out" onPress={() => signOutAndCloseSockets()} />
                <Button
                    onPress={() => navigation.navigate('Message')}
                    title="Write Message" />
            </View>
            <FlatList
                style={{flexGrow : 8}}
                //data={msgs}
                data={data}
                renderItem={renderItem}
                keyExtractor={(msg) => msg.id}
                getItemLayout={(data, index) => (
                    {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
                  )}
                onEndReached={(info: {distanceFromEnd: number}) => {
                    //clientSocket.sendInitFiltersToOpenSockets();
                    getMessagesFromBuffer();
                }}
                onRefresh={()=>{refreshData();}}
                refreshing={refresh}
                bounces={true}
            />
        </SafeAreaView>
    );
};

export type MsgMetaMsgType = { item: ClientMessage, metaMsg: ClientMessage};

function ViewPressableMessage({navigation, data} : {navigation: any, 
                            data : MsgMetaMsgType}) {
    let item = data.item;
    let metaMsg = data.metaMsg;
    return (
        <Pressable onPress={() => navigation.navigate('Details', data)}>
            <UserName data={data} navigation={navigation}></UserName>
            <Text selectable={true} selectionColor='grey' style={styles.msgText}>
                {item.msg.substring(0, 250)}
                {item.msg.length > 250 ? " ..." : ""}
            </Text>
            <Text>{new Date(item.fullEvent.created_at * 1000).toLocaleString()}</Text>
        </Pressable>
    );
}

export function ViewMessage(props: any) {
    let data : MsgMetaMsgType = {item:props.item, metaMsg: props.metaMsg}
    return (
        <View style={props.viewStyle}>
            <UserName data={data} navigation={props.navigation} ></UserName>
            <Text selectable={true} selectionColor='grey' style={styles.msgText}>{props.item.msg}</Text>
            <Text>{new Date(props.item.fullEvent.created_at * 1000).toLocaleString()}</Text>
        </View>
    );
}

export type UserNameType = {data: MsgMetaMsgType, navigation: GenericScreenNavigationProp}
export const UserName = (props: UserNameType) => {
    let item : ClientMessage = props.data.item;
    let metaMsg : ClientMessage = props.data.metaMsg;
    let navigation: GenericScreenNavigationProp = props.navigation;
    let userImg = "";
    let userName = "";

    if (item && item.fullEvent) {
        userImg = "";
        userName = item.fullEvent.pubkey.substring(0, 15) + "...";
        let clientMsg = metaMsg;
        if (clientMsg && clientMsg.msg) {
            const msgContentJson = JSON.parse(clientMsg.msg);
            userName = msgContentJson.name;
            userImg = msgContentJson.picture;
        }
    }

    if (userImg) {
        return (
            <Pressable onPress={() => navigation.navigate('UserDetail', props.data)}>
                <View>
                    <Image style={styles.tinyLogo} source={{ uri: userImg }}></Image>
                    <Text selectable={true} selectionColor='grey' style={styles.msgText}>{userName}</Text>
                </View>
            </Pressable>
        );
    } else {
        return (
            <Pressable onPress={() => navigation.navigate('UserDetail', props.data)}>
                <View>
                    <Image style={styles.tinyLogo} source={profilePic}></Image>
                    <Text selectable={true} selectionColor='grey' style={styles.msgText}>{userName}</Text>
                </View>
            </Pressable>
        );
    };
};



export const styles = StyleSheet.create({
    container: {
        //flex: 0,
        marginTop: StatusBar.currentHeight || 0,
        display:'flex',
        alignItems: 'stretch',
    },
    itemContainer: {
        backgroundColor: '#f5f5f7',
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    childItem: {
        backgroundColor: '#f5f5f7',
    },
    parentItem: {
        backgroundColor: '#f5f5ff',
        padding: 12,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 32,
    },
    tinyLogo: {
        width: 50,
        height: 50,
    },
    logo: {
        width: 66,
        height: 58,
    },
    msgText : {
        fontSize: 22,
        fontFamily:'sans-serif',
        //font-family: 'sans-serif',
        //'lucida grande', 
        //tahoma, verdana, arial, sans-serif,
        padding: 12,
        paddingTop:20,
        paddingBottom:20,
        textAlign: 'left' 
    },
});
