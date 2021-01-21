import { Account, NetworkType } from "symbol-sdk";
import { NamespaceOptinDTO } from "../../../../../node_modules/catapult-optin-module/dist/src/model/namespaceOptinDTO";
import { OptInDTO } from "./OptInDTO";
declare class NamespaceOptinDTOLedger extends NamespaceOptinDTO {
    constructor(destination: string, payload: string, hash: string);
    static createFromTransaction(transaction: any): NamespaceOptinDTOLedger | null;
    static createLedger: (destination: Account, namespace: string, network: NetworkType) => NamespaceOptinDTOLedger;
}
export { NamespaceOptinDTOLedger };
