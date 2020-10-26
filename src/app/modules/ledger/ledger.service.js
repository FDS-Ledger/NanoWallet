import nem from "nem-sdk";
import BIPPath from "bip32-path";
// import TransportNodeHid from "@ledgerhq/hw-transport-node-hid"; 
import TransportNodeHid from "@ledgerhq/hw-transport-webhid";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
// import TransportWebBLE from "@ledgerhq/hw-transport-web-ble";
// import TransportU2F from "@ledgerhq/hw-transport-u2f";

// var request = require('request');
const SUPPORT_VERSION = { LEDGER_MAJOR_VERSION: 0,
                        LEDGER_MINOR_VERSION: 0,
                        LEDGER_PATCH_VERSION: 2}
/** Service storing Ledger utility functions. */
class Ledger {

    /**
     * Initialize dependencies and properties
     *
     * @params {services} - Angular services to inject
     */
    constructor(Alert) {
        'ngInject';

        // Service dependencies region //
        this._Alert = Alert;

        // End dependencies region //

        // Service properties region //

        // End properties region //

        // Initialization
    }

    // Service methods region //

    async createWallet(network) {
        let checkVersion = true;
        // let checkVersion = await this.getAppVersion();
        if(!checkVersion){
            throw('Not using latest NEM BOLOS app');
        }
        else{
            return this.createAccount(network, 0, "Primary")
            .then((account) => ({
                "name": "LEDGER",
                "accounts": {
                    "0": account
                }
            }))
            .catch((err) => {
                console.log(err);
                throw err;
            });
        }
    }

    bip44(network, index) {
        // recognize networkId by bip32Path;
        // "44'/43'/networkId'/walletIndex'/accountIndex'"
        const networkId = network == -104 ? 152 : 104;
        return (`44'/43'/${networkId}'/${index}'/0'`);
    }

    async getAppVersion(){
        return new Promise(async (resolve) => {
            var JSONObject = {
                "requestType": "getAppVersion",
            };
            var option = {
                url: "http://localhost:21335",
                method: "POST",
                json: true,
                body: JSONObject
            }
            request(option, function (error, response, body) {
                try {
                    let appVersion = body;
                    if (appVersion.majorVersion < SUPPORT_VERSION.LEDGER_MAJOR_VERSION) {
                        resolve(false);
                    } else if (appVersion.minorVersion < SUPPORT_VERSION.LEDGER_MINOR_VERSION) {
                        resolve(false);
                    } else if (appVersion.patchVersion < SUPPORT_VERSION.LEDGER_PATCH_VERSION) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                } catch (error) {
                    resolve(error)
                }
            })
        })
    }

    createAccount(network, index, label) {
        alert("Follow instructions on your device. Click OK to continue.");
        const hdKeypath = this.bip44(network, index);
        return this.getAccount(hdKeypath, network, label);
    }

    showAccount(account) {
        alert("Follow instructions on your device. Click OK to continue.");
        return new Promise((resolve, reject) => {
            this.getAccount(account.hdKeypath, account.network, (result) => {
                if (result.success) {
                    resolve(result.address);
                } else {
                    reject(result.error);
                }
            });
        });
    }

    async getAccount(bipPath, network, label) {
        console.log("get account");
        // const transport = await TransportWebUSB.create();
        const transport = await TransportWebHID.create();
        console.log("transport: ", transport);
        // const nemH = new NemH(transport);
        return await this.getAddress(transport, path);
    }

    /**
     * get NEM address for a given BIP 32 path.
     *
     * @param path a path in BIP 32 format
     * @param display optionally enable or not the display
     * @param chainCode optionally enable or not the chainCode request
     * @param ed25519
     * @return an object with a publicKey, address and (optionally) chainCode
     * @example
     * const result = await nem.getAddress(bip32path);
     * const { publicKey, address } = result;
     */
    async getAddress(transport, path) {
        const GET_ADDRESS_INS_FIELD = 0x02
        const display = true;
        const chainCode = false;
        const ed25519 = true;

        const bipPath = BIPPath.fromString(path).toPathArray();
        const curveMask = ed25519 ? 0x80 : 0x40;

        // APDU fields configuration
        const apdu = {
            cla: CLA_FIELD,
            ins: GET_ADDRESS_INS_FIELD,
            p1: display ? 0x01 : 0x00,
            p2: curveMask | (chainCode ? 0x01 : 0x00),
            data: Buffer.alloc(1 + bipPath.length * 4),
        };

        apdu.data.writeInt8(bipPath.length, 0);
        bipPath.forEach((segment, index) => {
            apdu.data.writeUInt32BE(segment, 1 + index * 4);
        });

        // Response from Ledger
        const response = await transport.send(apdu.cla, apdu.ins, apdu.p1, apdu.p2, apdu.data);

        const result = {};
        const addressLength = response[0];
        const publicKeyLength = response[1 + addressLength];
        result.address = response.slice(1, 1 + addressLength).toString("ascii");
        result.publicKey = response.slice(1 + addressLength + 1, 1 + addressLength + 1 + publicKeyLength).toString("hex");
        result.path = path;
        return result;
    }

    // async getAccount(hdKeypath, network, label) {
    //     return new Promise((resolve, reject) => {
    //         var JSONObject = {
    //             "requestType": "getAddress",
    //             "hdKeypath": hdKeypath, "label": label, "network": network
    //         };
    //         let option = {
    //             url: "http://localhost:21335",
    //             method: "POST",
    //             json: true,
    //             body: JSONObject
    //         }
    //         request(option, function (error, response, body) {
    //             try {
    //                 if (error != null) {
    //                     reject("There is a problem with the ledger-bridge. Please install and check the ledger-bridge");
    //                 } else if (body.message != null) {
    //                     //Exporting the wallet was denied
    //                     if(body.statusCode == '26368' || body.statusCode == '27264') {
    //                         reject('Not using latest NEM BOLOS app');
    //                     } else {
    //                         reject(body.message);
    //                     }
    //                 }
    //                 resolve(body);
    //             } catch (error) {
    //                 if(error == null){
    //                     reject(body.message);
    //                 } else {
    //                     reject('Cannot connect to ledger connection server.');
    //                 }
    //             }
    //         })
    //     })
    // }

    serialize(transaction, account) {
        alert("Follow instructions on your device. Click OK to continue.");
        return new Promise(async (resolve, reject) => {
            //Transaction with testnet and mainnet
            //Correct the signer
            transaction.signer = account.publicKey;

            //If it is a MosaicDefinition Creation Transaction, then correct the creator
            if (transaction.type == 0x4001) {
                transaction.mosaicDefinition.creator = account.publicKey;
            }

            //Serialize the transaction
            let serializedTx = nem.utils.convert.ua2hex(nem.utils.serialization.serializeTransaction(transaction));
            let payload = await this.signTransaction(account, serializedTx);
            if (payload.signature) {
                resolve(payload);
            }
            else {
                if (payload.statusCode == '26368') {
                    this._Alert.transactionError('The transaction is too big');
                }
                else {
                    this._Alert.transactionError(payload.statusText);
                }
                reject(payload);
            }

        });
    }

    signTransaction(account, serializedTx) {
        return new Promise(async (resolve) => {
            var JSONObject = {
                "requestType": "signTransaction",
                "serializedTx": serializedTx,
                "hdKeypath": account.hdKeypath
            };
            var option = {
                url: "http://localhost:21335",
                method: "POST",
                json: true,
                body: JSONObject
            }
            request(option, function (error, response, body) {
                try {
                    if (body.statusCode) {
                        resolve(body)
                    }
                    else {
                        let payload = {
                            data: serializedTx,
                            signature: body
                        }
                        resolve(payload);
                    }
                } catch (error) {
                    resolve(error)
                }
            })
        })
    }
}

// End methods region //

export default Ledger;
