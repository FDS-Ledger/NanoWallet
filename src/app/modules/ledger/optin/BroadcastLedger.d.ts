import { Account, PublicAccount } from "symbol-sdk";
import { OptinConfig } from "../../../../../node_modules/catapult-optin-module/dist/src/optin";
import { SimpleOptinDTO } from "../../../../../node_modules/catapult-optin-module/dist/src/model/simpleOptinDTO";
import { NamespaceOptinDTO } from "../../../../../node_modules/catapult-optin-module/dist/src/model/namespaceOptinDTO";
import { OptInDTO } from "../../../../../node_modules/catapult-optin-module/dist/src/model/OptInDTO";
/**
 * Prepares Simple dto
 * @param destination
 */
declare const buildSimpleDTO: (destination: PublicAccount) => Promise<SimpleOptinDTO>;
/**
 * Prepares Namespace dto
 * @param destination
 * @param namespace
 * @param config
 */
declare const buildNamespaceDTO: (destination: Account, namespace: string, config: OptinConfig) => Promise<NamespaceOptinDTO>;
/**
 * Build normal opt in DTOs
 *
 * @param destination
 * @param namespaces
 * @param vrfAccount
 * @param config
 */
declare const buildNormalOptInDTOsLedger: (destination: Account, namespaces: string[], vrfAccount: Account | null, config: OptinConfig) => Promise<OptInDTO[]>;
/**
 * Build Start Multisig Opt in DTOs
 * @param origin
 * @param cosigner
 * @param destination
 * @param namespaces
 * @param config
 */
declare const buildStartMultisigOptInDTOs: (origin: any, cosigner: Account, destination: Account, namespaces: string[], config: OptinConfig) => Promise<OptInDTO[]>;
export { buildSimpleDTO, buildNamespaceDTO, buildNormalOptInDTOsLedger, buildStartMultisigOptInDTOs };
