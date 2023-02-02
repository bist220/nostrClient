import * as secp from '@noble/secp256k1';
import { bech32 } from 'bech32';
import { Buffer } from 'buffer';
import SecureKeychain, { Cred, StoreValue } from './security/SecureKeychain';

export enum Bech32PrefixCode {
    npub = "npub",
    nsec = "nsec",
    note = "note"
}

class ClientCrypto {
    //readonly publicKey : string = "";
    //readonly privKey : string = "";
    //readonly storeValue : StoreValue;
    className : string = "ClientCrypto";

    secureKeychain : SecureKeychain = new SecureKeychain();

    /*
    constructor () {
        
        this.secureKeychain = new SecureKeychain();
        
        //let result = this.getAllCredentialsFromStore();
        let result = this.getStoredValueFromStore()
        if(result) {
            this.storeValue = result;
        } else {
            //this.generateCredentials();
            //this.storeValue = 
        }
        
        
        // depricate
        if(keyAlias && this.isPrivKeyInStore(keyAlias)) {
            this.privKey = this.getPrivKeyFromStore(keyAlias);
            this.publicKey = this.getPublicKeyFromPrivKey(this.privKey);
        } 
        
        else {
            this.privKey = this.generatePrivateKey();
            //const isKeyStored : boolean = this.storePrivKey(keyAlias, this.privKey);
            this.publicKey = this.getPublicKeyFromPrivKey(this.privKey);
            let cred : Cred = {
                                privKey : this.privKey,
                                pubKey : this.publicKey,
                                lastUpdated : new Date(),
                                server : "",
                                username : 
                            };
            cred.privKey= this.privKey;

            this.storePrivKey(keyAlias, );
        }
        
    }
    */

    generatePrivateKey() : string {
        return secp.utils.bytesToHex(secp.utils.randomPrivateKey());
    }
    /*
    getPublicKey() : string {
        return this.getPublicKeyFromPrivKey(this.privKey);
    }
    */
    getPublicKeyFromPrivKey(privKey : string) : string {
        return secp.utils.bytesToHex(secp.schnorr.getPublicKey(privKey));
    }

    getBech32EncodedKeyFromHex(code:string, key:string) {
        let words = bech32.toWords(Buffer.from(key, 'hex'))
        return bech32.encode(code, words);
    }

    isValidCred(cred: Cred) {
        try {
            return cred.pubKey === this.getPublicKeyFromPrivKey(cred.privKey)
        } catch (e) {
            return false;
        }
    }

    storePrivKey(keyAlias : string, creds : Cred[]) : boolean {
        if(keyAlias && creds) {
            // TODO logic
            throw new Error("method not implemented!");
            //return true;
        }
        return false;
    }
    
    /*
    storePrivKey(keyAlias : string, privKey : string) : boolean{
        if(keyAlias && privKey) {

            // TODO logic
            throw new Error("method not implemented!");
        }
        return false;
    }

    isPrivKeyInStore(keyAlias : string) : boolean {
        if(keyAlias) {
            // TODO logic
            throw new Error("method not implemented!");
        }
        return false;
    }
    getPrivKeyFromStore(keyAlias : string) : string {
        let privKey : string;
        if(keyAlias) {
            
            //privKey = 
            this.getCredentials(keyAlias);
            throw new Error("method not implemented!");
        }
    }
    */

    // load creds for same username diff servers diff pub/priv key
    getCredentialsFromStore(userName : string) : Cred[] {
        let cred : Cred[] = [];
        if(userName) {
            this.secureKeychain.loadKey(userName)
                .then(c => {
                    if(c) {cred = c}
                })
                .catch(e => console.log("[ClientCrypto] :: getPrivKeyFromStore :: coould not get credentials"));
        }
        return cred;
    }

    async getAllCredentialsFromStore() {
        let creds : Cred[];
        await this.secureKeychain.load()
            .then(strVal => {
                if(strVal) {
                    creds = strVal.cred;
                } 
            })
            .catch(e=>{
                console.log("[ClientCrypto] :: getAllCredentials :: coould not get credentials");
            });
        if(creds) {
            return creds;
        } else {
            return false;
        }
    }

    async getDefaultUserCredentialFromStore() {
        console.log(`[${this.className}] :: [getDefaultUserCredentialFromStore] :: start`);

        let storeValue : StoreValue = await this.getStoredValueFromStore();
        console.log(`[${this.className}] :: [getDefaultUserCredentialFromStore] :: StoreValue :: ${JSON.stringify(storeValue)}`);
        if(storeValue) {
            let creds : Cred[] = storeValue.cred;
            console.log(`[${this.className}] :: [getDefaultUserCredentialFromStore] :: creds :: ${JSON.stringify(creds)}`);
            if(creds) {
                let arrCreds : Array<Cred> = creds.filter(c => c.username===storeValue.defaultUserName)
                console.log(`[${this.className}] :: [getDefaultUserCredentialFromStore] :: arrCreds :: ${JSON.stringify(arrCreds)}`);
                if(arrCreds.length>0) {
                    return arrCreds[0];
                }
                return false;
            }
        }
        
        console.log(`[${this.className}] :: [getDefaultUserCredentialFromStore] :: end`);
        return false;
    }

    async getStoredValueFromStore() {
        console.log(`[${this.className}] :: [getStoredValueFromStore] :: start`);
        let storeValue : StoreValue;
        await this.secureKeychain.load()
            .then(strVal => {
                console.log(`[${this.className}] :: [getStoredValueFromStore] :: strVal :: ${JSON.stringify(strVal)}`);
                if(strVal) {
                    storeValue = strVal;
                    //let storeValue : StoreValue = strVal;
                    //console.log(`[${this.className}] :: [getStoredValueFromStore] :: end`);
                    //return storeValue;
                } 
                /*
                else {
                    console.log(`[${this.className}] :: [getStoredValueFromStore] :: end`);
                    return false;
                }
                */
            })
            .catch(e=>{
                console.log("[ClientCrypto] :: getStoredValueFromStore :: could not get storeValue");
                //console.log(`[${this.className}] :: [getStoredValueFromStore] :: end`);
                //return false;
            });
        console.log(`[${this.className}] :: [getStoredValueFromStore] :: end`);
        
        if (storeValue) {
            return storeValue
        } else return false;

        //return storeValue;
    }

    async generateCredentials(username : string, server : string) {
        let privKey : string = this.generatePrivateKey();
        let pubKey : string = this.getPublicKeyFromPrivKey(privKey);
        let cred : Cred = {
            privKey : privKey,
            pubKey : pubKey,
            server : server,
            username : username,
            lastUpdated : new Date(),
            bech32Pub : this.getBech32EncodedKeyFromHex(Bech32PrefixCode.npub, pubKey),
            bech32Priv : this.getBech32EncodedKeyFromHex(Bech32PrefixCode.nsec, privKey)
        };
        let res = await this.addCredentialsToStore(cred);
        
        if (res) {
            return cred
        } else return false;
    }

    async addCredentialsToStore(cred : Cred) {
        console.log(`[${this.className}] :: [addCredentialsToStore] :: start`);        
        let storeValue : StoreValue = await this.getStoredValueFromStore();

        if(storeValue) {
            let creds : Cred[] = storeValue.cred;
            if(creds) {
                creds.push(cred);
            } else {
                creds = [cred];
            }
            storeValue.cred = creds;
            console.log("2[ClientCrypto] :: [addCredentialsToStore] :: defaultUserName :: " + storeValue.defaultUserName);
            console.log("2[ClientCrypto] :: [addCredentialsToStore] :: storeValue :: " + JSON.stringify(storeValue));
        } else {
            const strVal : StoreValue = {
                cred : [cred],
                defaultUserName : cred.username
            };
            console.log("2[ClientCrypto] :: [addCredentialsToStore] :: cred.username :: " + cred.username);
            strVal.defaultUserName = cred.username;
            storeValue = strVal;
            //storeValue.defaultUserName = cred.username;
            console.log("2[ClientCrypto] :: [addCredentialsToStore] :: defaultUserName :: " + storeValue.defaultUserName);
            console.log("2[ClientCrypto] :: [addCredentialsToStore] :: storeValue :: " + JSON.stringify(storeValue));
        }
        console.log("2[ClientCrypto] :: [addCredentialsToStore] :: defaultUserName :: " + storeValue.defaultUserName);
        console.log("2[ClientCrypto] :: [addCredentialsToStore] :: storeValue :: " + JSON.stringify(storeValue));
        
        let result = await this.secureKeychain.save(storeValue.defaultUserName, storeValue);
        console.log(`[${this.className}] :: [addCredentialsToStore] :: end`);
        
        if (result) {
            return cred
        } else return false;
    }

    async addNewCredentialsToStore(username : string, pubKey : string, privKey : string, server : string) {
        console.log(`[${this.className}] :: [addNewCredentialsToStore] :: start`);
        let cred : Cred = {
            privKey : privKey,
            pubKey : pubKey,
            server : server,
            username : username,
            lastUpdated : new Date(),
            bech32Pub : this.getBech32EncodedKeyFromHex(Bech32PrefixCode.npub, pubKey),
            bech32Priv : this.getBech32EncodedKeyFromHex(Bech32PrefixCode.nsec, privKey)
        };
        //console.log("[ClientCrypto] :: [addCredentialsToStore] :: defaultUserName :: " + storeValue.defaultUserName);
        console.log("[ClientCrypto] :: [addNewCredentialsToStore] :: cred :: " + JSON.stringify(cred));

        let res = await this.addCredentialsToStore(cred);
        console.log(`[${this.className}] :: [addNewCredentialsToStore] :: end`);
        if(res) {
            return cred;
        } else false;
        //return cred;
    }

    async resetUsers() {
        await this.secureKeychain.reset();
    }
}

export default ClientCrypto;