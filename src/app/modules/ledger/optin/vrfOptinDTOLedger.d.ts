import { Account, NetworkType } from "symbol-sdk";
import { VrfOptinDTO } from "../../../../../node_modules/catapult-optin-module/dist/src/model/vrfOptinDTO";
declare class VrfOptinDTOLedger extends VrfOptinDTO {
    constructor(destination: string, payload: string, hash: string);
    static createLedger: (destinationAccount: Account, destinationAccountPath: string, vrfAccount: Account, network: NetworkType) => VrfOptinDTO;
}
export { VrfOptinDTOLedger };
