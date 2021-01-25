import angular from 'angular';

// Create the module where our functionality can attach to
let ledgerModule = angular.module('app.ledger', []);

// Include our UI-Router config settings
import ledgerConfig from './ledger.config';
ledgerModule.config(ledgerConfig);

// Controllers
import ledgerCtrl from './ledger.controller';
ledgerModule.controller('LedgerCtrl', ledgerCtrl);

// Services
import ledgerService from './ledger.service';
ledgerModule.service('Ledger', ledgerService);

import {CosigOptinDTOLedger} from './optin/cosigOptinDTOLedger';
ledgerModule.service('CosigOptinDTOLedgerService', CosigOptinDTOLedger);

import {NamespaceOptinDTOLedger} from './optin/namespaceOptinDTOLedger';
ledgerModule.service('NamespaceOptinDTOLedgerService', NamespaceOptinDTOLedger);

import {VrfOptinDTOLedger} from './optin/vrfOptinDTOLedger';
ledgerModule.service('VrfOptinDTOLedgerService', VrfOptinDTOLedger);
export default ledgerModule;
