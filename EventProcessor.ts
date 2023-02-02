import { Event } from "./ClientWebSocket";
import * as secp from '@noble/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { Cred } from "./security/SecureKeychain";
//import { sha256 } from '@noble/hashes/sha256';
import { hmac } from '@noble/hashes/hmac';

secp.utils.hmacSha256Sync = (key, ...msgs) => hmac(sha256, key, secp.utils.concatBytes(...msgs))
secp.utils.sha256Sync = (...msgs) => sha256(secp.utils.concatBytes(...msgs))

/*
    [
        0,
        <pubkey, as a (lowercase) hex string>,
        <created_at, as a number>,
        <kind, as a number>,
        <tags, as an array of arrays of non-null strings>,
        <content, as a string>
    ]
*/
class EventProcessor {
    private static readonly className : string = "EventProcessor";
    
    private static logMessage(funcName : string, msg : string) {
        console.log(`[${this.className}] :: [${funcName}] :: ${msg}`);
    }

    private static log(start : boolean, funcName : string) {
        this.logMessage(funcName, start ? "start" : "end");
        //console.log(`[${this.className}] :: [${funcName}] :: ${start ? "start" : "end"}`);
    }

    static createEvent(value: string, kind : number, tags : Array<Array<string>>, cred: Cred): Event {
        this.log(true, "createEvent");
        let event : Event;
        try {
            event = new Event();
            event.content = value
            event.created_at = Math.floor(Date.now()/1000);
            event.kind = kind;
            event.pubkey = cred.pubKey;
            event.tags = tags;
            
            event = EventProcessor.signEvent(event, cred.privKey);

        } catch (e) {
            this.logMessage("createEvent", "something went wrong, " + e);
            this.log(false, "createEvent");
        }
        this.logMessage("createEvent", "event :: " + event);
        this.log(false, "createEvent");

        return event;
    }

    static generateEventId (event : Event) : string {
        this.log(true, "generateEventId");
        let eventId : string = "";
        try {            
            let eventDetailArray = [0, event.pubkey.toLowerCase(), event.created_at, event.kind, event.tags, event.content];
            eventId = secp.utils.bytesToHex(sha256(JSON.stringify(eventDetailArray)));
            //event.id = eventId;
        } catch (e) {
            this.logMessage("generateEventId", "something went wrong, " + e);
            this.log(false, "generateEventId");
        }
        this.logMessage("generateEventId", "eventId :: " + eventId);
        this.log(false, "generateEventId");
        return eventId;
    }

    static signMessage(msg : string, privKey : string) : string{
        this.log(true, "signMessage");
        let sign : string = "";
        try{
            sign = secp.utils.bytesToHex(secp.schnorr.signSync(msg, privKey));
        } catch (e) {
            this.logMessage("signMessage", "something went wrong, " + e);
        }
        this.logMessage("signMessage", "sign :: " + sign);
        this.log(false, "signMessage");
        return sign;
    }

    static signEvent (event : Event, privKey : string) : Event{
        this.log(true, "signEvent");
        let signedEvent : Event;
        try {
            let eventId : string = this.generateEventId(event);
            let sig = this.signMessage(eventId, privKey);
            if (eventId && sig) {
                signedEvent = event;
                signedEvent.id = eventId;
                signedEvent.sig = sig
            }
        } catch (e) {
            this.logMessage("signEvent", "something went wrong, " + e);
        }
        this.log(false, "signEvent");
        return signedEvent;
    }
}

export default EventProcessor;