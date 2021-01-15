"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbol_sdk_1 = require("symbol-sdk");
const constants_1 = require("../../../../../node_modules/catapult-optin-module/dist/src/constants");
const VrfOptInDTO_1 = require("../../../../../node_modules/catapult-optin-module/dist/src/model/vrfOptinDTO");

class VrfOptinDTOLedger extends VrfOptInDTO_1.VrfOptinDTO {
    constructor(destination, payload, hash) {
        super(destination, payload, hash);
    }
}
exports.VrfOptinDTO = VrfOptinDTOLedger;
/**
 *
 * @param destinationAccount
 * @param vrfAccount
 * @param network
 */
VrfOptinDTOLedger.createLedger = (destinationAccount, vrfAccount, network) => {
    const vrfKeyLinkTransaction = symbol_sdk_1.VrfKeyLinkTransaction.create(symbol_sdk_1.Deadline['createFromDTO']('1'), vrfAccount.publicKey, symbol_sdk_1.LinkAction.Link, network);
    const signedTransaction = destinationAccount.sign(vrfKeyLinkTransaction, constants_1.OptinConstants[network].CATAPULT_GENERATION_HASH);
    return new VrfOptinDTO(destinationAccount.publicKey, signedTransaction.payload, signedTransaction.hash);
};
//# sourceMappingURL=vrfOptinDTO.js.map