import React, { useReducer } from 'react';
import { View, FlatList, Text, SafeAreaView } from 'react-native'
import { UserCredContext } from '../AppNav';
import { ClientMessage, Event, Filter, MessageType, RequestId } from '../ClientWebSocket';
import { MsgMetaMsgType, styles, UserName } from '../HomeScreen';
import { UserDetailScreenProps } from '../NavStackParamTypes';
import { Cred } from '../security/SecureKeychain';

export function UserDetailScreen ({ navigation, route }: UserDetailScreenProps) {
    console.log("[UserDetailScreen] :: start ");
    const cred : Cred = React.useContext(UserCredContext);

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

    let data: MsgMetaMsgType = {item: route.params.item, metaMsg: route.params.metaMsg};
    React.useEffect(()=>{
        let socket: WebSocket;
        console.log("[UserDetailScreen] :: [useEffect] :: " + JSON.stringify(data));
        let url: string = data.item.remoteUrl;
        let filter: Filter = new Filter();
        filter.authors = [data.item.fullEvent.pubkey];
        filter.limit = 20;
        socket = new WebSocket(url);
        if(socket) {
            socket.onopen = ()=>{
                socket.send(JSON.stringify([MessageType.REQ, RequestId.EVENTREQ, filter]));
            }
            socket.onmessage = (event : WebSocketMessageEvent) => {
                onMsgEvent(event, socket);
            }
        }
        
        return ()=>{
            console.log("[UserDetailScreen] :: [useEffect-return] :: closing socket");
            socket.send(JSON.stringify([MessageType.CLOSE, RequestId.EVENTREQ]));
            socket.close();
            console.log("[UserDetailScreen] :: [useEffect-return] :: sockets closed");
        }
    }, []);

    function onMsgEvent(event: WebSocketMessageEvent, socket: WebSocket) {
        const data = JSON.parse(event.data);
        const eventType = data[0];
        if (eventType === MessageType.EVENT) {
            const eventMsg: Event = data[2];
            const msgId = eventMsg.id;
            const msgValue = eventMsg.content;
            const kind: number = eventMsg.kind;
            const msg: ClientMessage = { "id": msgId, "msg": msgValue, "fullEvent": eventMsg, "kind": kind, "remoteUrl": socket.url };
            setMsgs({type:'ADD', msg:msg});
        }
    }

    const renderItem = ({item} : {item : ClientMessage}) => {
        return (
            <View style={styles.itemContainer}>
                <View style={styles.childItem}>
                    <Text selectable={true} style={styles.msgText}>{item.id}</Text>
                    <Text selectable={true} style={styles.msgText}>Msg Type : {item.kind}</Text>
                    <Text selectable={true} style={styles.msgText}>{item.msg}</Text>
                    <Text selectable={true} >{new Date(item.fullEvent.created_at * 1000).toLocaleString()}</Text>
                </View>
            </View>
        );
    };

    console.log("[UserDetailScreen] :: [msgs] :: msgs.length " + JSON.stringify(msgs?.length));
    console.log("[UserDetailScreen] :: [msgs] :: " + JSON.stringify(msgs));
    return (
        <SafeAreaView style={styles.container}>
            {cred && cred.pubKey===data.item.fullEvent.pubkey &&
                <>
                    <Text selectable={true} selectionColor='grey' style={{fontSize:20}}>{cred.username}</Text>
                    <Text selectable={true} selectionColor='grey' style={{fontSize:20}}>{cred.bech32Pub}</Text>
                    <Text selectable={true} selectionColor='grey' style={{fontSize:20}}>primary server :: {cred.server}</Text>
                </>
            }
            <View style={{flexGrow:2, marginBottom:12}}>
                <UserName data={data} navigation={navigation} ></UserName>
                <Text selectable={true} style={{fontSize:18}}>{data.item.fullEvent.pubkey}</Text>
            </View>
            {msgs && msgs.length<=0 &&
                <View>
                    <Text style={styles.msgText}>
                        Loading msgs...
                    </Text>
                </View>
            }
            {msgs && msgs.length>0 &&
                <FlatList
                    style={{flexGrow : 8}}
                    data={msgs}
                    renderItem={renderItem}
                    keyExtractor={(msg) => msg.id} 
                    ItemSeparatorComponent={()=>{return(<View style={{backgroundColor:'grey'}}></View>)}}
                />
            }
        </SafeAreaView>
    );
}


