import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Image, StatusBar, SafeAreaView, Pressable, Platform } from "react-native";
import { AuthContext, EventEmitDispatchContext, EventEmitStateContext, NostrServerList, UserCredContext } from './AppNav';
import ClientWebSocket, { ClientMessage, Event } from "./ClientWebSocket";
import { HomeScreenProps } from './NavStackParamTypes';
import { Cred } from './security/SecureKeychain';
//import { secure } from './security/SecureTest';


//export const ClientSocketContext = React.createContext<string>("");
let clientSocket : ClientWebSocket;

export const HomeScreen = ({ navigation, route }: HomeScreenProps) => {

    const cred : Cred = React.useContext(UserCredContext);
    const { signOut } = React.useContext(AuthContext);

    const eventEmitStateContext : Event[] = React.useContext(EventEmitStateContext);
    const eventEmitDispatchContext = React.useContext(EventEmitDispatchContext);

    /*
    console.log("[HomeScreen] :: cred :: " + cred);
    console.log("[HomeScreen] :: cred.server :: " + cred.server);


    const serverList:Array<string> = NostrServerList;
    //let defaultUrl = "wss://relay.damus.io";
    //let defaultUrl = "wss://relay.nostr.info"
    let defaultUrl : string = cred.server;
    if(!cred.server) {
        defaultUrl = serverList[0];    
    }
    
    let clientSocket : ClientWebSocket = new ClientWebSocket(defaultUrl);
    console.log("[HomeScreen] :: server :: " + cred.server);
    */

    const serverList:Array<string> = NostrServerList;
    //let defaultUrl = "wss://relay.damus.io";
    //let defaultUrl = "wss://relay.nostr.info"
    let defaultUrl : string = cred.server;
    if(!cred.server) {
        defaultUrl = serverList[0];    
    }
    
    
    /*
    if(!cred.server) {
        //console.log("[HomeScreen] :: server is empty.. signingout");
        //signOut();
        console.log("[HomeScreen] :: server url is empty, using default url :: " + defaultUrl);
        clientSocket = new ClientWebSocket(defaultUrl);
    } else {
        try{
            //const clientSocket = new ClientWebSocket("wss://relay.damus.io");
            clientSocket = new ClientWebSocket(cred.server);
            console.log("[HomeScreen] :: server :: " + cred.server);
            //const userService = new UserService(clientSocket);
        } catch (e) {
            console.log("[HomeScreen] :: unable to init ClientWebSocket!");
            signOut();
        }
    }
    */

    //function HomeScreen ({ navigation } : HomeScreenProps) {
    [msgs, setMsgs] = useState<Array<ClientMessage>>([]);
    [metaMsgs, setMetaMsgs] = useState<Map<string, ClientMessage>>(new Map());
    [mapIdMsgs, setMapIdMsgs] = useState<Map<string, ClientMessage>>(new Map());


    useEffect(() => {
        console.log("[HomeScreen] :: cred :: " + cred);
        console.log("[HomeScreen] :: cred.server :: " + cred.server);
        
        clientSocket = new ClientWebSocket(defaultUrl);
        console.log("[HomeScreen] :: server :: " + cred.server);



        //clientSocket.addRemoteUrl("wss://relay.damus.io/");
        clientSocket.addRemoteUrl(serverList);
        clientSocket.openConnections(msgHandler);
        /*
        let s = secure()
            .then(() => console.log("[useEffect] :: secure call done!"))
            .catch(error => console.log("[useEffect] :: something went wrong with secure call" + error));
        */
        console.log("[HomeScreen] :: [useEffect] :: Platform.OS " + Platform.OS);
        console.log("[HomeScreen] :: [useEffect] :: Platform.OS " + Platform.Version);
        return () => {
            console.log("closing connection...");
            clientSocket.closeConnection();
            console.log("connections closed!");
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
                eventEmitDispatchContext({
                    type: "delete",
                    id: event.id
                })
                console.log("[HomeScreen] :: [useEffect] :: after delete event length :: " + JSON.stringify(eventEmitStateContext.length));
            }            
        }
        console.log("[HomeScreen] :: [useEffect] :: event :: " + JSON.stringify(eventEmitStateContext));
        console.log("[HomeScreen] :: [useEffect] :: event :: end");
    },[eventEmitStateContext]);

    // when new event(msg) is sent through MessageScreen
    /*
    useEffect(()=>{
        route
    });

    if(route.params) {
        if(route.params.event) {
            let event : Event = JSON.parse(route.params.event)
            console.log("[HomeScreen] :: event :: " + route.params.event);
            console.log("[HomeScreen] :: event :: " + JSON.stringify(event));
            clientSocket.sendEvent(event);
            console.log("[HomeScreen] :: sent event :: " + route.params.event);
        } else {
            console.log("[HomeScreen] :: no event to send");
        }
    }
    */
    

    const msgHandler = (msg: ClientMessage, kind: number) => {
        if (msg.kind == 0) {
            if (!mapIdMsgs.has(msg.id)) {
                let newMetaMsgs = new Map(metaMsgs);
                newMetaMsgs.set(msg.fullEvent.pubkey, msg);
                setMetaMsgs(newMetaMsgs);
            }
        } else {
            if (!mapIdMsgs.has(msg.id)) {
                /*
                let newMsgs = msgs.slice();
                newMsgs.push(msg);
                setMsgs(newMsgs);
                */
                setMsgs([...msgs, msg,]);
            }
        }
        let newMapIdMsgs = new Map(mapIdMsgs);
        newMapIdMsgs.set(msg.id, msg);
        setMapIdMsgs(newMapIdMsgs);
    };

    const signOutAndCloseSockets = () => {
        console.log("closing connection...");
        clientSocket.closeConnection();
        console.log("connections closed!");
        signOut();
    }

    const closeAppSocket = () => {
        console.log("closing connection...");
        clientSocket.closeConnection();
        console.log("connections closed!");
    };

    const renderItem = ({ item }) => {
        let parentMsg = undefined;

        if (item && item.fullEvent) {
            let fullEvent = item.fullEvent;

            let tags: [[]] = fullEvent.tags;
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
        const childData = { item: item, metaMsgs: metaMsgs };
        if (parentMsg) {
            const parentData = { item: parentMsg, metaMsgs: metaMsgs };
            return (
                /*
                <View style={styles.itemContainer}>
                    <View style={styles.childItem}>
                        <UserName msg={item}></UserName>
                        <Text style={{fontSize:24, padding:20}}>{item.msg}</Text>
                    </View>
                    <View style={styles.parentItem}>
                        <UserName msg={parentMsg}></UserName>
                        <Text style={{fontSize:24, padding:20}}>{parentMsg.msg}</Text>
                    </View>
                </View>
                */
                /*
                <View style={styles.itemContainer}>
                    <ViewPressableMessageDetails viewStyle={styles.childItem} item={item} metaMsgs={metaMsgs} ></ViewPressableMessageDetails>
                    <ViewPressableMessageDetails viewStyle={styles.parentItem} item={parentMsg} metaMsgs={metaMsgs} ></ViewPressableMessageDetails>
                </View>
                */
                <View style={styles.itemContainer}>
                    <Pressable onPress={() => navigation.navigate('Details', childData)}>
                        <View style={styles.childItem}>
                            <UserName msg={item} metaMsgs={metaMsgs}></UserName>
                            <Text selectable={true} selectionColor='grey' style={{ fontSize: 24, padding: 20 }}>
                                {item.msg.substring(0, 250)}
                                {item.msg.length>250 ? " ..." : ""}
                            </Text>
                        </View>
                    </Pressable>

                    <Pressable onPress={() => navigation.navigate('Details', parentData)}>
                        <View style={styles.parentItem}>
                            <UserName msg={parentMsg} metaMsgs={metaMsgs}></UserName>
                            <Text selectable={true} selectionColor='grey' style={{ fontSize: 24, padding: 20 }}>
                                {parentMsg.msg.substring(0, 250)}
                                {parentMsg.msg.length>250 ? " ..." : ""}
                            </Text>
                        </View>
                    </Pressable>
                </View>

            );
        }

        return (
            <View style={styles.itemContainer}>
                <Pressable onPress={() => navigation.navigate('Details', childData)}>
                    <View style={styles.childItem}>
                        <UserName msg={item} metaMsgs={metaMsgs}></UserName>
                        <Text selectable={true} selectionColor='grey' style={{ fontSize: 24, padding: 20 }}>
                            {item.msg.substring(0, 250)}
                            {item.msg.length>250 ? " ..." : ""}
                        </Text>
                    </View>
                </Pressable>
            </View>
            //<ViewPressableMessageDetails viewStyle={styles.itemContainer} item={item} metaMsgs={metaMsgs} ></ViewPressableMessageDetails>
            /*
            <Pressable onPress={onPressFunction}>
                <ViewMessage viewStyle={styles.itemContainer} msg={item} ></ViewMessage>
                <View style={styles.itemContainer}>
                    <UserName msg={item}></UserName>
                    <Text style={{fontSize:24, padding:20}}>{item.msg}</Text>
                </View>
            </Pressable>
            */
        );
    };

    /*
    type HomeScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Home'
    >;
    type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
    */
    /*
    function ViewPressableMessageDetails (props : any) {
        //let navigation : HomeScreenNavigationProp = props.navigation;
        const item : ClientMessage = props.item;
        const metaMsgs : Map<string, ClientMessage> = props.metaMsgs;
        const data = {item : item, metaMsgs : metaMsgs};
        return (
            <Pressable onPress={() => navigation.navigate('Details', data) }>
                <ViewMessage viewStyle={props.viewStyle} item={props.item} metaMsgs={props.metaMsgs}></ViewMessage>
            </Pressable>
        );
    }
    */
    /*
        <Text>This is a test App!</Text>
        <Button
            onPress={closeAppSocket}
            title="Close!"
        />
    */
    console.log("[HomeScreen] :: [HomeScreen] :: [cred] " + JSON.stringify(cred));
    //const msgScreenParams = {clientSocket : clientSocket};
    return (
        

        <SafeAreaView style={styles.container}>
            {cred && 
                <>
                    <Text selectable={true} selectionColor='grey' style={{fontSize:20}}>{cred.username}</Text>
                    <Text selectable={true} selectionColor='grey' style={{fontSize:20}}>{cred.bech32Pub}</Text>
                    <Text selectable={true} selectionColor='grey' style={{fontSize:20}}>primary server :: {cred.server}</Text>
                </>
            }
            <Button title="Sign out" onPress={() => signOutAndCloseSockets()} />
            <FlatList
                data={msgs}
                renderItem={renderItem}
                keyExtractor={(msg) => msg.id} />
            <Button
                onPress={() => navigation.navigate('Message')}
                //onPress={() => navigation.navigate('Message', msgScreenParams)}
                //onPress={() => navigation.navigate('Message')}
                title="Write Message" />
        </SafeAreaView>

        
    );

};

export function ViewMessage(props: any) {
    return (
        <View style={props.viewStyle}>
            <UserName msg={props.item} metaMsgs={props.metaMsgs}></UserName>
            <Text style={{ fontSize: 24, padding: 20 }}>{props.item.msg}</Text>
        </View>
    );
}
const UserName = (props: any) => {
    let item = props.msg;
    let metaMsgs = props.metaMsgs;
    let userImg = "";
    let userName = "";

    if (item && item.fullEvent) {
        userImg = "";
        userName = item.fullEvent.pubkey.substring(0, 15) + "...";

        let clientMsg = metaMsgs.get(item.fullEvent.pubkey);
        if (clientMsg) {
            const msgContentJson = JSON.parse(clientMsg.msg);
            userName = msgContentJson.name;
            userImg = msgContentJson.picture;
        }
    }

    if (userImg) {
        return (
            //<View style={styles.item}>
            <View>
                <Image style={styles.tinyLogo} source={{ uri: userImg }}></Image>
                <Text selectable={true} selectionColor='grey' style={{ fontSize: 24, padding: 20, textAlign: 'left' }}>{userName}</Text>
            </View>
        );
    } else {
        return (
            //<View style={styles.item}>
            <View>
                <Text selectable={true} selectionColor='grey' style={{ fontSize: 24, padding: 20, textAlign: 'left' }}>{userName}</Text>
            </View>
        );
    };
};



export const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: StatusBar.currentHeight || 0,
    },
    itemContainer: {
        backgroundColor: '#f5f5f7',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    childItem: {
        backgroundColor: '#f5f5f7',
    },
    parentItem: {
        backgroundColor: '#f5f5ff',
        padding: 20,
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
});
