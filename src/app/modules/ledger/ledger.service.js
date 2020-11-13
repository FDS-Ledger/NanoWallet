import nem from "nem-sdk";
var request = require('request');
const SUPPORT_VERSION = {
    LEDGER_MAJOR_VERSION: 0,
    LEDGER_MINOR_VERSION: 0,
    LEDGER_PATCH_VERSION: 2
}
let message;

/** Service storing Ledger utility functions. */
class Ledger {

    /**
     * Initialize dependencies and properties
     *
     * @params {services} - Angular services to inject
     */
    constructor(Alert, $timeout) {
        'ngInject';

        // Service dependencies region //
        this._Alert = Alert;
        this._$timeout = $timeout;

        // End dependencies region //

        // Service properties region //

        // End properties region //

        // Initialization
    }

    // Service methods region //

    async createWallet(network) {
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
        const hdKeypath = this.bip44(network, index);
        return this.getAccount(hdKeypath, network, label);
    }

    showAccount(account) {
        this._Alert.ledgerFollowInstruction();
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
                    if (body.statusCode != null) {
                        //Exporting the wallet was denied
                        reject(body.statusCode);
                    } else {
                        // Successfully exporting the wallet
                        resolve(body);
                    }
                } catch (error) {
                    reject('bridge_problem');
                }
            })
        })
    }

    serialize(transaction, account, symbolOptin) {
        this._$timeout(() => {
            this._Alert.ledgerFollowInstruction();
        });
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
            } else {
                if (!symbolOptin) {
                    if (payload.statusCode == '26368') {
                        this._Alert.ledgerTransactionTooBig();
                    } else if (payload.statusCode == '27013') {
                        this._Alert.ledgerTransactionCancelByUser();
                    } else {
                        this._Alert.transactionError(payload.statusText);
                    }
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
                    } else if (body.name == "TransportError") {
                        this._Alert.ledgerFailedToSignTransaction(body.message);
                    } else {
                        let payload = {
                            data: serializedTx,
                            signature: body
                        }
                        resolve(payload);
                    }
                } catch (error) {
                    resolve(error);
                }
            })
        })
    }
}

// End methods region //

export default Ledger;
