import { Account, NetworkType } from "symbol-sdk";
import { OptInDTO } from "./OptInDTO";
declare class NamespaceOptinDTOLedger extends OptInDTO {
    /** Public Key of the opt-in destination account. This will most frequently be left empty for the destination to match the origin account */
    destination: string;
    /** Signed ​payload​ of ​Catapult Transaction "CatNamespaceOptin"​. This transaction must be signed only by the destination account. */
    payload: string;
    /** Hash of the transaction */
    hash: string;
    constructor(destination: string, payload: string, hash: string);
    /**
     * Create NamespaceOptinDTO from transaction
     * @param transaction
     */
    static createFromTransaction(transaction: any): NamespaceOptinDTOLedger | null;
    /**
     *
     * @param destination
     * @param namespace
     * @param network
     */
    static createLedger: (destination: Account, namespace: string, network: NetworkType) => NamespaceOptinDTOLedger;
}
export { NamespaceOptinDTOLedger as NamespaceOptinDTO };
