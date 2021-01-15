"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const simpleOptinDTO_1 = require("../../../../../node_modules/catapult-optin-module/dist/src/model/simpleOptinDTO");
const namespaceOptinDTO_1 = require("../../../../../node_modules/catapult-optin-module/dist/src/model/namespaceOptinDTO");
const vrfOptinDTO_1 = require("./vrfOptinDTOLedger");

/**
 * Prepares Simple dto
 * @param destination
 */
const buildSimpleDTO = (destination) => __awaiter(void 0, void 0, void 0, function* () {
  return new simpleOptinDTO_1.SimpleOptinDTO(destination.publicKey);
});
exports.buildSimpleDTO = buildSimpleDTO;

/**
 * Prepares Namespace dto
 * @param destination
 * @param namespace
 * @param config
 */
const buildNamespaceDTO = (destination, namespace, config) => __awaiter(void 0, void 0, void 0, function* () {
  return namespaceOptinDTO_1.NamespaceOptinDTO.create(destination, namespace, config.CATNetwork);
});
exports.buildNamespaceDTO = buildNamespaceDTO;

/**
 * Prepares Vrf dto
 * @param destination
 * @param vrfAccount
 * @param config
 */
const buildVrfDTO = (destination, vrfAccount, config) => __awaiter(void 0, void 0, void 0, function* () {
  return vrfOptinDTO_1.VrfOptinDTOLedger.createLedger(destination, vrfAccount, config.CATNetwork);
});

/**
 * Build normal opt in DTOs
 *
 * @param destination
 * @param namespaces
 * @param vrfAccount
 * @param config
 */
const buildNormalOptInDTOsLedger = (destination, namespaces, vrfAccount, config) => __awaiter(void 0, void 0, void 0, function* () {
  const buildDTOs = [];
  buildDTOs.push(buildSimpleDTO(destination.publicAccount));
  buildDTOs.push(...namespaces.map(namespace => buildNamespaceDTO(destination, namespace, config)));
  if (vrfAccount) {
      buildDTOs.push(buildVrfDTO(destination, vrfAccount, config));
  }
  return yield Promise.all(buildDTOs);
});
exports.buildNormalOptInDTOsLedger = buildNormalOptInDTOsLedger;