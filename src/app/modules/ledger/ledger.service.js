import nem from "nem-sdk";
var request = require('request');
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

    createWallet(network) {
        return this.createAccount(network, 0, "Primary")
            .then((account) => ({
                "name": "LEDGER",
                "accounts": {
                    "0": account
                }
            }))
            .catch((err) => {
                throw err;
            });
    }

    bip44(network, index) {
        // recognize networkId by bip32Path;
        // "44'/43'/networkId'/walletIndex'/accountIndex'"
        const networkId = network == -104 ? 152 : 104;
        return (`44'/43'/${networkId}'/${index}'/0'`);
    }

    createAccount(network, index, label) {
        alert("Follow instructions on your device. Click OK to continue.");
        const hdKeypath = this.bip44(network, index);
        return this.getAccount(hdKeypath, network, label);
    }

    async getAccount(hdKeypath, network, label) {
        return new Promise((resolve, reject) => {
            var JSONObject = {
                "requestType": "getAddress",
                "hdKeypath": hdKeypath, "label": label, "network": network
            };
            let option = {
                url: "http://localhost:21335",
                method: "POST",
                json: true,
                body: JSONObject
            }
            request(option, function (error, response, body) {
                try {
                    if (error != null) {
                        reject("There is a problem with the ledger-bridge. Please install and check the ledger-bridge");
                    } else if (body.message != null) {
                        if(body.statusCode == '26368'){
                            reject('Please use the NEM app')
                        }
                        else{
                            reject(body.message);
                        }
                    }
                    resolve(body);
                } catch (error) {
                    reject('Cannot connect to ledger connection server.');
                }
            })
        })
    }

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
                "serializedTx": serializedTx, "hdKeypath": account.hdKeypath
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
