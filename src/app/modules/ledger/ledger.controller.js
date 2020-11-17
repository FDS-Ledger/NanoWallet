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
     * Login with LEDGER
     */
    async login() {
        this.okPressed = true;
        const checkVersion = await this._Ledger.getAppVersion();
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
                        this._Ledger.alertHandler(error);
                    });
                    this.okPressed = false;
                });
        } else {
            this._$timeout(() => {
                this._Ledger.alertHandler(checkVersion);
            });
            this.okPressed = false;
        }
    }
    //// End methods region ////
}

export default LedgerCtrl;
