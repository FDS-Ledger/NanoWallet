"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nem_sdk_1 = require("nem-sdk");
const symbol_sdk_1 = require("symbol-sdk");
const constants_1 = require("../../../../../node_modules/catapult-optin-module/dist/src/constants");
const OptInDTO_1 = require("../../../../../node_modules/catapult-optin-module/dist/src/model/OptInDTO");
import { LedgerService } from './LedgerService';
const DEFAULT_ACCOUNT_PATH = "m/44'/4343'/0'/0'/0'";


class CosigOptinDTOLedger extends OptInDTO_1.OptInDTO {
    constructor(multisig, signature) {
        super(OptInDTO_1.OptInDTOType.COSIGN_DTO_TYPE);
        if (symbol_sdk_1.PublicAccount.createFromPublicKey(multisig, symbol_sdk_1.NetworkType.MAIN_NET) == null)
            throw new Error('Invalid multisig public key');
        this.multisig = multisig;
        this.signature = signature;
    }
    /**
     * Create NamespaceOptinDTO from transaction
     * @param transaction
     */
    static createFromTransaction(transaction) {
        try {
            const message = nem_sdk_1.default.utils.format.hexMessage(transaction.transaction.message);
            const dto = JSON.parse(message);
            if (dto.hasOwnProperty('type') && dto.type === OptInDTO_1.OptInDTOType.COSIGN_DTO_TYPE &&
                dto.hasOwnProperty('multisig') &&
                dto.hasOwnProperty('signature')) {
                return new CosigOptinDTOLedger(dto.multisig, dto.signature);
            }
            else
                return null;
        }
        catch (e) {
            return null;
        }
    }
}
exports.CosigOptinDTOLedger = CosigOptinDTOLedger;
/**
 * Sign Convert Optin Transaction
 *
 * @param cosigner
 * @param convertDTO
 * @param multisigDestination
 */
CosigOptinDTOLedger.createLedger = async (cosigner, convertDTO, multisigDestination, network) => {
    const transaction = symbol_sdk_1.TransactionMapping.createFromPayload(convertDTO.p);
    if (transaction instanceof symbol_sdk_1.AggregateTransaction) {
        const cosignatureTransaction = symbol_sdk_1.CosignatureTransaction.create(transaction);
        // const signature = cosignatureTransaction.signWith(cosigner, convertDTO.h).signature;
        let signature;
        const ledgerService = new LedgerService();
        if (cosigner.privateKey === undefined) {
            signature = await ledgerService.signTransaction(DEFAULT_ACCOUNT_PATH, cosignatureTransaction, constants_1.OptinConstants[network].CATAPULT_GENERATION_HASH, cosigner.publicKey);
            
        } else {
            signature = cosignatureTransaction.signWith(cosigner, convertDTO.h).signature;
        }
        return new CosigOptinDTOLedger(multisigDestination.publicKey, signature);
    }
    else {
        throw Error('Wrong transaction payload');
    }
};
//# sourceMappingURL=cosigOptinDTO.js.map