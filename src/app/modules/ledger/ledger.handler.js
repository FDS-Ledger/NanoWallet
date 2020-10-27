import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import NemH from "./hw-app-nem";
import { TransportStatusError } from "@ledgerhq/errors";

async function getAppVersion(){
  const transport = await TransportNodeHid.open("");
  const nemH = new NemH(transport);

  return new Promise(async(resolve, reject) => {
      nemH.getAppVersion()
      .then(result => {
          transport.close();
          resolve(result);
      })
      .catch( err => {
          transport.close();
          reject(err);
      })
  })
}

async function getAccount(hdKeypath, network, label) {
  const transport = await TransportNodeHid.open("");
  const nemH = new NemH(transport);

  return new Promise(async(resolve, reject) => {
      nemH.getAddress(hdKeypath)
      .then(result => {
          transport.close();
          resolve(
              {
                  "brain": false,
                  "algo": "ledger",
                  "encrypted": "",
                  "iv": "",
                  "address": result.address,
                  "label": label,
                  "network": network,
                  "child": "",
                  "hdKeypath": hdKeypath,
                  "publicKey": result.publicKey
              }
          );
      })
      .catch( err => {
          transport.close();
          reject(err);
      })
  })

}

async function signTransaction(hdKeypath, serializedTx) {
  const transport = await TransportNodeHid.open("");
  const nemH = new NemH(transport);

  return new Promise(async(resolve, reject) => {
      nemH.signTransaction(hdKeypath, serializedTx)
      .then(sig => {
          transport.close();
          resolve(sig.signature);
      })
      .catch( err => {
          transport.close();
          reject(err);
      })
  })
}