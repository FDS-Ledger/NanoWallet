import { Account, NetworkType } from "symbol-sdk";
import { VrfOptinDTO } from "../../../../../node_modules/catapult-optin-module/dist/src/model/vrfOptinDTO";
declare class VrfOptinDTOLedger extends VrfOptinDTO {
    constructor(destination: string, payload: string, hash: string);
    static createLedger: (destinationAccount: Account, vrfAccount: Account, vrfAccountPath: string, network: NetworkType) => VrfOptinDTO;
}
export { VrfOptinDTOLedger };
