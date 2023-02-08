export interface ClientMessage {
    id :string ;
    msg : string;
    fullEvent : Event
    kind : number
    remoteUrl : string
}

export enum MessageType {
    EVENT = "EVENT",
    REQ = "REQ",
    CLOSE = "CLOSE",
    NOTICE = "NOTICE"
};

export class Event {
    "id": string;            //<32-bytes sha256 of the the serialized event data>
    "pubkey": string;        //<32-bytes hex-encoded public key of the event creator>,
    "created_at": number;    //<unix timestamp in seconds>,
    "kind": number;          //<integer>,
    "tags": Array<Array<string>>;
    /*
    [
        ["e", <32-bytes hex of the id of another event>, <recommended relay URL>],
        ["p", <32-bytes hex of the key>, <recommended relay URL>],
        ... // other kinds of tags may be included later
    ],
    */
    "content": string;      //<arbitrary string>,
    "sig": string;          //<64-bytes signature of the sha256 hash of the serialized event data, which is the same as the "id" field>
}

/*
    {
    "ids": <a list of event ids or prefixes>,
    "authors": <a list of pubkeys or prefixes, the pubkey of an event must be one of these>,
    "kinds": <a list of a kind numbers>,
    "#e": <a list of event ids that are referenced in an "e" tag>,
    "#p": <a list of pubkeys that are referenced in a "p" tag>,
    "since": <an integer unix timestamp, events must be newer than this to pass>,
    "until": <an integer unix timestamp, events must be older than this to pass>,
    "limit": <maximum number of events to be returned in the initial query>
    }
*/

export class Filter {
    "ids": string[]     //<a list of event ids or prefixes>,
    "authors": string[] //<a list of pubkeys or prefixes, the pubkey of an event must be one of these>,
    "kinds": number[]   //<a list of a kind numbers>,
    "#e": string[]      //<a list of event ids that are referenced in an "e" tag>,
    "#p": string[]      //<a list of pubkeys that are referenced in a "p" tag>,
    "since": number     //<an integer unix timestamp, events must be newer than this to pass>,
    "until": number     //<an integer unix timestamp, events must be older than this to pass>,
    "limit": number     //<maximum number of events to be returned in the initial query>
}

export enum RequestId {
    EVENT = "cn",
    METADATA = "req_cn",
    EVENTREQ = "event_req_cn",
}

type EventReqType = [
        messageType : MessageType.EVENT,
        event : Event
    ];

enum TotalSeconds {
    SECOND = 1,
    MINUTE = 60 * SECOND,
    HOUR = 60 * MINUTE,
    DAY = 24 * HOUR,
}

class ClientWebSocket {
    urlSocketMap : Map<string, WebSocket> = new Map<string, WebSocket>();
    sockets : WebSocket[] = [];
    //remoteUrls : string[] = [];
    remoteUrls : Set<string> = new Set();
    connectedUrls : string[] = [];
    metaMessages : ClientMessage[] = [];
    queuedEventsToPublish : Set<EventReqType> = new Set();

    //static readonly defaultRelayUrl : string = "wss://relay.damus.io";
    defaultRelayUrl : string = "";
    //crypto : ClientCrypto = new ClientCrypto("");
    static clientWebSocket : ClientWebSocket;

    /*
    constructor(defaultUrl : string) {
        if (!defaultUrl) {
            console.log("[ClientWebSocket] :: [constructor] :: defaultUrl is null");
            throw new Error("[ClientWebSocket] :: [constructor] :: defaultUrl is null");
        }
        this.defaultRelayUrl = defaultUrl;
        console.log("[ClientWebSocket] :: [constructor] :: defaultUrl :: " + defaultUrl);
        this.addRemoteUrl([this.defaultRelayUrl]);
        ClientWebSocket.clientWebSocket = this;
    }
    */
   private constructor(){}

    static getInstance() : ClientWebSocket {
        if(!this.clientWebSocket) {
            this.clientWebSocket = new ClientWebSocket();
        }
        return this.clientWebSocket;
    }
    
    addDefaultRelayUrl(defaultUrl : string) {
        this.defaultRelayUrl = defaultUrl;
        console.log("[ClientWebSocket] :: [constructor] :: defaultUrl :: " + defaultUrl);
        this.addRemoteUrl([this.defaultRelayUrl]);
    }

    addRemoteUrl(urls: string[]) {
        //console.log("[addRemoteUrl] :: publicKey :: " + this.crypto.publicKey);

        urls.forEach(url => {
            if(!this.connectedUrls.includes(url) && !this.remoteUrls.has(url)) {
                console.log("[ClientWebSocket] :: [addRemoteUrl] :: adding url :: " + urls);
                //this.remoteUrls.push(url);
                this.remoteUrls.add(url);
            }
        });
    }

    async openConnections(msgHandler : (msg: any , kind: number) => any, 
            onOpenReq? : (subId: String | undefined, filters?: Filter[], url?: string)=>any,
            reqId?:string, filters? : Filter[]) {
        if(this.remoteUrls.size===0) throw new Error("Add atleast one relay url");
        this.createConnection(msgHandler, onOpenReq, reqId, filters);
    }

    async createConnection(msgHandler : (msg: any , kind: number) => any, 
            onOpenReq? : (subId: String | undefined, filters?: Filter[], url?: string)=>any, 
            reqId?:string, eventReqfilters? : Filter[]) {
        console.log("[ClientWebSocket] :: [createConnection] :: creating connections...");
        for (const url of this.remoteUrls) {
            if(!url.trim() || this.connectedUrls.includes(url)) {continue;}
            const socket = new WebSocket(url);
            socket.onopen = () => {
                this.sockets.push(socket);
                this.urlSocketMap.set(url, socket);
                console.log("[ClientWebSocket] :: [createConnection] :: socket added :: " + JSON.stringify(socket));
                this.connectedUrls.push(url);
                console.log("[ClientWebSocket] :: [createConnection] :: url added to connectedUrls :: " + JSON.stringify(url));

                this.sendInitFilters(url);
                
                // queued events
                if(this.queuedEventsToPublish){
                    console.log("[ClientWebSocket] :: [createConnection] :: queuedEventsToPublish.size :: " + this.queuedEventsToPublish.size);
                    this.queuedEventsToPublish.forEach(req => {
                        console.log("[ClientWebSocket] :: [createConnection] :: sending queued event to sendToSocket ");
                        this.sendToSocket(req);
                    });
                }

                // process adding new account to server
                // get details if exists or create one
                // OR
                // update profile via different userDetail screen
                

                // call from handle message
                // when flow is from handle message
                if(onOpenReq && reqId) {
                    console.log("[createConnection] :: new websocket connection :: referRemoteUrl :: " + url);
                    onOpenReq(reqId, eventReqfilters, url);
                    console.log("[createConnection] :: new websocket connection :: sendReq complete :: " + url);
                }
            }

            socket.onmessage = (event : WebSocketMessageEvent) => {
                const data = JSON.parse(event.data);
                const eventType = data[0];
                if (eventType===MessageType.EVENT) {
                    const eventMsg : Event = data[2];
                    const msgId = eventMsg.id;
                    const msgValue = eventMsg.content;
                    const kind : number = eventMsg.kind;
                    console.log("eventMsg:: " + msgId + " : kind [" +  kind + "]");
                    // metadata | user details
                    console.log("[onMessage] :: fullEvent :: " + JSON.stringify(eventMsg));
                    //this.handleReplyMention(eventMsg, msgHandler);
                    if(kind===0) {
                        const msg : ClientMessage = {"id" : msgId , "msg" : msgValue, "fullEvent": eventMsg, "kind" : kind , "remoteUrl" : socket.url};
                        console.log("eventMsg:: pubkey :: " + eventMsg.pubkey);
                        console.log("eventMsg:: msgValue :: " + msgValue + " : kind [" +  kind + "]");
                        console.log("eventMsg:: " + msgId + " : kind [" +  kind + "]");
                        msgHandler(msg, kind);
                        this.metaMessages.push(msg);
                    } else {
                        const msg : ClientMessage = {"id" : msgId , "msg" : msgValue, "fullEvent": eventMsg, "kind" : kind , "remoteUrl" : socket.url};
                        msgHandler(msg, kind);
                        this.handleReplyMention(msg, msgHandler).catch((e)=>console.log("[error] :: [ClientWebSocket] :: [onMessage] :: [handleReplyMention] :: something went wrong, " + e));
                        this.getUserDetails(RequestId.METADATA /*ClientWebSocket.metaReqId*/, eventMsg.pubkey, socket.url).catch((e)=>console.log("[error] :: [ClientWebSocket] :: [onMessage] :: [getUserDetails] :: something went wrong, " + e));
                        console.log("eventMsg:: " + msgId + " : ");
                        //msgHandler(msg, kind);
                    }
                }
                if (eventType===MessageType.NOTICE) {
                    console.log("[notice] :: url :: " + socket.url);
                    console.log(data);
                }
            }
        }
    }

    sendInitFilters(url: string) {
        const initfilters: Filter[] = [];
        for (let i = 0; i < 3; i++) {
            let filter = new Filter();
            filter.limit = 5;
            filter.kinds = [i];
            //filter.since = Math.floor(Date.now()/1000) - TotalSeconds.DAY;
            filter.since = Math.floor(Date.now()/1000);
            initfilters.push(filter);
        }
        console.log("[ClientWebSocket] :: [createConnection] :: initfilters :: " + initfilters);
        this.sendReq(RequestId.EVENT /*ClientWebSocket.subId*/, initfilters, url);
    }

    async sendInitFiltersToOpenSockets() {
        //this.connectedUrls
        this.sockets.forEach((socket)=>{
            this.sendInitFilters(socket.url);
        });
    }

    async handleReplyMention(msg: ClientMessage, msgHandler: (msg: any, kind: number) => any) {
        let eventMsg : Event = msg.fullEvent;
        if(eventMsg) {
            let tags:Array<Array<string>> = eventMsg.tags;
            console.log("[handleReplyMention] tags :: " + JSON.stringify(tags));
            console.log("[handleReplyMention] tags [raw]:: " + tags);
            console.log("[handleReplyMention] tags [raw]:: " + (tags instanceof Array));
            if(tags && tags.length>0) {
                // get last "e" and "p" values
                console.log("[handleReplyMention] inside if block [reduce tags] :: ");

                let tag : string[] = [];
                console.log("[handleReplyMention] tag before :: " + tag);
                for (let index = 0; index < tags.length; index++) {
                    const t:string[] = tags[index];
                    if(t[0]==="e") {
                        tag = t;
                    }
                }

                console.log("[handleReplyMention] tag after :: " + tag);
                console.log("[handleReplyMention] tag :: " + JSON.stringify(tag));
                //get event form tag array
                if(tag) {
                    let eventId = tag[1];
                    let referRemoteUrl : string = "";
                    if(tag.length>2) {
                        referRemoteUrl= tag[2];
                    }
                    
                    console.log("[handleReplyMention] eventId :: " + JSON.stringify(eventId));
                    
                    if(eventId) {
                        // will be updated on next msg
                        let filter = new Filter()
                        filter.ids = [eventId];
                        let referRemoteUrlConnected = false;
                        if(referRemoteUrl) {
                            let filteredUrls = this.connectedUrls.filter(url=> {
                                return url.includes(referRemoteUrl)
                            })
                            if(filteredUrls.length > 0) {
                                referRemoteUrlConnected = true;
                            }
                        }

                        if(!referRemoteUrl) {
                            console.log("[handleReplyMention] sending eventId req to already existing referRemoteUrl :: " + referRemoteUrl);
                            this.sendReq(RequestId.EVENTREQ /*ClientWebSocket.eventReqId*/, [filter], msg.remoteUrl);
                        }
                        //if(referRemoteUrl && this.connectedUrls.includes(referRemoteUrl)) {
                        if(referRemoteUrlConnected) {
                            console.log("[handleReplyMention] sending eventId req to already existing referRemoteUrl :: " + referRemoteUrl);
                            this.sendReq(RequestId.EVENTREQ /*ClientWebSocket.eventReqId*/, [filter], referRemoteUrl);
                        }
                        //if(referRemoteUrl && !this.connectedUrls.includes(referRemoteUrl)) {
                        if(referRemoteUrl && !referRemoteUrlConnected) {
                            console.log("[handleReplyMention] :: adding new socket url :: " + referRemoteUrl);
                            this.addRemoteUrl([referRemoteUrl]);
                            console.log("[handleReplyMention] :: opening new socket to url :: " + referRemoteUrl);
                            this.openConnections(msgHandler, this.sendReq, RequestId.EVENTREQ /*ClientWebSocket.eventReqId*/, [filter]);
                            console.log("[handleReplyMention] :: open new socket connection and event req complete :: url :: " + referRemoteUrl);
                        }                        
                    }
                }
            }
        }
    }

    async sendMessage(type:MessageType ,url? : string, subId?:String, event?:object, filters?: Filter[]) {
        switch (type) {
            case MessageType.EVENT: {
                this.sendEvent(event, url);
                break;
            }
            case MessageType.REQ: {
                console.log("[sendMessage] :: filters :: " + filters);
                this.sendReq(subId, filters);
                break;
            }
            case MessageType.CLOSE: {
                this.sendClose(subId);
                break;
            }
        }
    }

    async sendEvent(event: object | undefined, url?: string) {
        const req = [MessageType.EVENT, event];
        this.sendToSocket(req, url);
    }
    async sendReq(subId: String | undefined, filters?: Filter[], url?: string) {
        const req : any = [MessageType.REQ, subId];
        console.log("[sendReq] :: filters " + filters);
        if(filters) {
            filters.forEach(filter => {
                console.log("[sendReq] filter :: " + filter);
                req.push(filter);
            });
        }
        console.log("[sendReq] req :: " + JSON.stringify(req));
        console.log("[sendReq] req url :: " + url);
        if(url) {
            console.log("[sendReq] calling sendToSocket :: " + url);
            this.sendToSocket(req, url)
        } else {
            console.log("[sendReq] calling sendToAllSockets :: " + url);
            this.sendToAllSockets(req);
        }
    }
    async sendClose(subId: String | undefined) {
        console.log("[sendClose] :: subId :: " + subId);
        const req = [MessageType.CLOSE, subId];
        this.sendToAllSockets(req);
    }

    // to send events on default or registered server
    sendToSocket(req : any, url? : string){
        const reqJ = JSON.stringify(req);
        console.log(reqJ);
        console.log("[sendToSocket] :: reqJ :: " + reqJ)
        try{
            this.asyncSendToSocket(url, reqJ)
                .then(()=>{
                        console.log("[sendToSocket] :: [asyncSendToSocket] :: [then] :: req event sent :: reqJ :: " + JSON.stringify(reqJ));
                    }
                )
                .catch(e=>{
                    console.log("[sendToSocket] :: [asyncSendToSocket] :: unable to send event reqJ :: " + reqJ);
                    console.log("[sendToSocket] :: [asyncSendToSocket] :: err :: " + e);
                    this.queuedEventsToPublish.add(req)
                    console.log("[sendToSocket] :: [asyncSendToSocket] :: [queuedEventsToPublish] event queued :: " + reqJ);
                });
        } catch(e) {
            console.log("[sendToSocket] :: while asyncSendToSocket :: something went wrong, " + e);
        }
    }

    // to send failed events on default or registered server
    // or add to queued events list
    async asyncSendToSocket(url: string | undefined, reqJ: string) {
        console.log("[asyncSendToSocket] :: start :: ");
        console.log("[asyncSendToSocket] :: url :: " + url);
        if(!url) {
            url = this.defaultRelayUrl;
        }
        console.log("[asyncSendToSocket] :: url :: " + url);
        //console.log("[asyncSendToSocket] :: outside if condition :: sockets :: " + JSON.stringify(this.sockets));
        
        if(this.urlSocketMap.size>0 && this.urlSocketMap.has(url)) {
            console.log("[asyncSendToSocket] :: inside if condition :: ");
            //console.log("[asyncSendToSocket] :: inside if condition :: sockets :: " + JSON.stringify(this.sockets));
            try {
                this.urlSocketMap.get(url)?.send(reqJ);
                console.log("[asyncSendToSocket] :: reqJ :: " + reqJ);
            } catch (error) {
                console.log("[asyncSendToSocket] :: error :: " + error);
                throw error;//(error);
            }
        }

        else {
            console.log("[asyncSendToSocket] :: sockets not initialized, throwing error :: " + reqJ);
            throw new Error("Waiting for sockets to initialize...");
        }
        
    }

    //sendToAllSockets(req: (String | MessageType | object | undefined)[]) {
    async sendToAllSockets(req: any) {
        const reqJ = JSON.stringify(req);
        console.log("[sendToAllSockets] :: sending to all sockets reqJ :: " + reqJ);
        this.sockets.forEach(socket => {
            socket.send(reqJ);
            console.log("[sendToAllSockets] :: socket.url :: " + socket.url);
            console.log("[sendToAllSockets] :: reqJ :: " + reqJ);
        });
    }

    closeConnection() {
        this.sendClose(RequestId.EVENT);
        this.sendClose(RequestId.EVENTREQ);
        this.sendClose(RequestId.METADATA);
    }

    async reqEventByEventId (eventId:string) {
        console.log("[ClientWebSocket] :: [reqEventByEventId] :: start");
        console.log("[ClientWebSocket] :: [reqEventByEventId] :: eventId :: " + eventId);
        let filter : Filter = new Filter();
        filter.ids = [eventId];
        this.sendReq(RequestId.EVENTREQ /*ClientWebSocket.eventReqId*/, [filter], this.defaultRelayUrl);
        console.log("[ClientWebSocket] :: [reqEventByEventId] :: end");
    }

    async getUserDetails(subId: string, pubkey: string, url? : string) {
        const filters: Filter[] = []
        let filter = new Filter();
        filter.limit = 2;
        filter.kinds = [0];
        filter.authors = [pubkey];
        filters.push(filter);
        if(url) {
            console.log("[ClientWebSocket] :: [getUserDetails] :: url :: " + url);
            this.sendReq(subId, filters, url);
        }
    }
}

export default ClientWebSocket;


