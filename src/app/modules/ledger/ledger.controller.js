import nem from 'nem-sdk';
var request = require('request');
const SUPPORT_VERSION = {
    LEDGER_MAJOR_VERSION: 0,
    LEDGER_MINOR_VERSION: 0,
    LEDGER_PATCH_VERSION: 2
}
class LedgerCtrl {

    /**
     * Initialize dependencies and properties
     *
     * @params {services} - Angular services to inject
     */
    constructor(AppConstants, $timeout, Alert, Login, Ledger) {
        'ngInject';

        //// Module dependencies region ////

        this._AppConstants = AppConstants;
        this._$timeout = $timeout;
        this._Alert = Alert;
        this._Login = Login;
        this._Ledger = Ledger;

        //// End dependencies region ////

        //// Module properties region ////

        /**
         * Default network
         *
         * @type {number}
         */
        this.network = this._AppConstants.defaultNetwork;

        /**
         * Available networks
         *
         * @type {object} - An object of objects
         */
        this.networks = nem.model.network.data;

        // Prevent user to click twice on send when already processing
        this.okPressed = false;

        //// End properties region ////
    }

    //// Module methods region ////

    /**
     * Change wallet network
     *
     * @param {number} id - The network id to use at wallet creation
     */
    changeNetwork(id) {
        if (id == nem.model.network.data.mijin.id && this._AppConstants.mijinDisabled) {
            this._Alert.mijinDisabled();
            // Reset network to default
            this.network = this._AppConstants.defaultNetwork;
            return;
        } else if (id == nem.model.network.data.mainnet.id && this._AppConstants.mainnetDisabled) {
            this._Alert.mainnetDisabled();
            // Reset network to default
            this.network = this._AppConstants.defaultNetwork;
            return;
        }
        // Set Network
        this.network = id;
    }

    /**
     * Get NEM Ledger app version
     */
    getAppVersion() {
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
                    if (appVersion.majorVersion == 0
                        && appVersion.minorVersion == 0
                        && appVersion.patchVersion == 2) {
                        resolve(1);
                    }
                    else if (appVersion.majorVersion < SUPPORT_VERSION.LEDGER_MAJOR_VERSION) {
                        resolve(2);
                    } else if (appVersion.minorVersion < SUPPORT_VERSION.LEDGER_MINOR_VERSION) {
                        resolve(2);
                    } else if (appVersion.patchVersion < SUPPORT_VERSION.LEDGER_PATCH_VERSION) {
                        resolve(2);
                    }
                    else {
                        resolve(3);
                    }
                } catch (error) {
                    alert(error);
                }
            })
        })
    }

    /**
     * Login with LEDGER
     */
    async login() {
        this.okPressed = true;
        let checkVersion = await this.getAppVersion();
        try {
            if (checkVersion == 1) {
                this._$timeout(() => {
                    this._Alert.ledgerFollowInstruction();
                });
                this._Ledger.createWallet(this.network)
                    .then(wallet => {
                        this._Login.login({}, wallet);
                        this.okPressed = false;
                    })
                    .catch(error => {
                        this._$timeout(() => {
                            switch (error) {
                                case 'NoDevice':
                                    this._Alert.ledgerDeviceNotFound();
                                    break;
                                case 'bridge_problem':
                                    this._Alert.ledgerBridgeNotRunning();
                                    break;
                                case 'close_bolos_app':
                                    this._Alert.ledgerNotOpenApp();
                                    break;
                                case 'not_using_nem_app':
                                    this._Alert.ledgerNotUsingNemApp();
                                    break;
                                case 'user_reject_login':
                                    this._Alert.ledgerLoginCancelByUser();
                                    break;
                                case 'old_bolos_app':
                                    this._Alert.ledgerNotSupportApp();
                                    break;
                                default:
                                    this._Alert.createWalletFailed(error);
                                    break;
                            }
                        });
                        this.okPressed = false;
                    });
            }
            else if (checkVersion == 2){
                this._$timeout(() => {
                    this._Alert.ledgerNotSupportApp();
                });
                this.okPressed = false;
            }
            else{
                this._$timeout(() => {
                    this._Alert.ledgerDeviceNotFound();
                });
                this.okPressed = false;
            }
        } catch (error) {
            this._$timeout(() => {
                this._Alert.createWalletFailed(error);
            });
            this.okPressed = false;
        }
    }
    //// End methods region ////
}

export default LedgerCtrl;
