import { Account, PublicAccount } from "symbol-sdk";
import { ConvertOptinDTO } from "../../../../../node_modules/catapult-optin-module/dist/src/model/convertOptinDTO";
import { CosigOptinDTO } from "../../../../../node_modules/catapult-optin-module/dist/src/model/cosigOptinDTO";
declare class CosigOptinDTOLedger extends CosigOptinDTO {
    constructor(multisig: string, signature: string);
    static createLedger: (cosigner: Account, cosignerAcountPath: string, convertDTO: ConvertOptinDTO, multisigDestination: PublicAccount) => CosigOptinDTOLedger;
}
export { CosigOptinDTOLedger };
