import ClientWebSocket, { Filter, MessageType, ClientMessage } from "./ClientWebSocket";

//ClientWebSocket
class UserService {
    clientWebSocket : ClientWebSocket;
    //msgHandler : (msg: any , kind: number) => any;
    //constructor(clientWebSocket : ClientWebSocket, msgHandler : (msg: any , kind: number) => any) {
    constructor(clientWebSocket : ClientWebSocket) {
        this.clientWebSocket = clientWebSocket;
        //this.msgHandler = msgHandler;
    }
    /*
    [
        "REQ","cn",
        {"limit":2,"authors":"npub1sg6plzptd64u62a878hep2kev88swjh3tw00gjsfl8f237lmu63q0uf63m", "kinds":[0]}
    ]
    */
    getUserDetails(author : string) {
        console.log("[getUserDetails] :: author :: " + author)
        let clientMsg = this.clientWebSocket.metaMessages.find((msg)=>{
            msg.fullEvent.pubkey===author && msg.fullEvent.kind===0
        })
        if(clientMsg){
            return clientMsg;
        } else {
            let filter = new Filter();
            filter.limit = 2;
            filter.kinds = [0];
            filter.authors = [author];
                    
            //this.clientWebSocket.sendMessage(MessageType.REQ, author, undefined, [filter]);
            this.clientWebSocket.sendReq(author, [filter]);

            clientMsg = this.clientWebSocket.metaMessages.find((msg)=>{
                msg.fullEvent.pubkey===author && msg.fullEvent.kind===0
            })
        }
        return clientMsg;

        /*
        let promise = new Promise((resolve, reject) => {
            let clientMsg = this.clientWebSocket.metaMessages.find((msg)=>{
                msg.fullEvent.pubkey===author && msg.fullEvent.kind===0
            })

            if(clientMsg) {
                resolve(clientMsg);
            } else {
                reject("details not found");
            }
        });

        promise.then(value => {
                return value;
            }
        ).catch( rej => {});
        */
        
        
        
    }

    /*
        ["REQ","cn",{"ids":["78384accb8c39eaa05641803336813f698d11692a87b30c07d1ebfc6f6bf7aa1"]}]
    */
    getMsgFromEventId(eventId : string, remoteUrl? : string, msgHandler? : (msg: any , kind: number) => any) {
        console.log("[UserService] :: [getMsgFromEventId] ::");
        console.log("[UserService] :: [getMsgFromEventId] :: remoteUrl :: " + remoteUrl);
        console.log("[UserService] :: [getMsgFromEventId] :: msgHandler " + msgHandler);
        if(remoteUrl && msgHandler) {
            console.log("[UserService] :: [getMsgFromEventId] :: creating new socket to url :: " + remoteUrl);
            this.clientWebSocket.addRemoteUrl(remoteUrl);
            this.clientWebSocket.openConnections(msgHandler);
        }
        let filter = new Filter()
        filter.ids = [eventId];
        console.log("[UserService] :: [getMsgFromEventId] :: sending request to :: " + remoteUrl);
        this.clientWebSocket.sendReq(ClientWebSocket.eventReqId, [filter]);        
    }
}

export default UserService