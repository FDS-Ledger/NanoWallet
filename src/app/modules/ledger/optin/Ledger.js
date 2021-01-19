/*
 * Copyright 2020 NEM (https://nem.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */
// internal dependencies
import * as BIPPath from 'bip32-path';
// configuration
import { Transaction, SignedTransaction, Convert, CosignatureSignedTransaction, AggregateTransaction } from 'symbol-sdk';

const SUPPORT_VERSION = { LEDGER_MAJOR_VERSION: '0', LEDGER_MINOR_VERSION: '0', LEDGER_PATCH_VERSION: '4' };
const CLA_FIELD = 0xe0;

export class SymbolLedger {

    constructor(transport, scrambleKey) {
        this.transport = transport;
        transport.decorateAppAPIMethods(
            this,
            ['signCosignatureTransaction'],
            scrambleKey,
        );
    }


    /**
     * sign a Symbol Cosignature transaction with a given BIP 44 path
     *
     * @param path a path in BIP 44 format
     * @param transferTransaction a transfer transaction needs to be signed
     * @param signerPublicKey the public key of signer
     * @return a Signed Cosignature Transaction
     */
    async signCosignatureTransaction(path, cosignatureTransaction, signerPublicKey) {
        const rawPayload = cosignatureTransaction.serialize();
        const signingBytes = cosignatureTransaction.transactionInfo.hash + rawPayload.slice(216);
        const rawTx = Buffer.from(signingBytes, 'hex');
        const response = await this.ledgerMessageHandler(path, rawTx);
        // Response from Ledger
        const h = response.toString('hex');
        const signature = h.slice(0, 128);
        const cosignatureSignedTransaction = new CosignatureSignedTransaction(
            cosignatureTransaction.transactionInfo.hash,
            signature,
            signerPublicKey,
        );
        return cosignatureSignedTransaction;
    }
    /**
     * handle sending and receiving packages between Ledger and Wallet
     * @param path a path in BIP 44 format
     * @param rawTx a raw payload transaction hex string
     * @returns respond package from Ledger
     */
    async ledgerMessageHandler(path, rawTx) {
        const TX_INS_FIELD = 0x04;
        const MAX_CHUNK_SIZE = 255;
        const CONTINUE_SENDING = '0x9000';

        const chainCode = false;
        const ed25519 = true;

        const curveMask = ed25519 ? 0x80 : 0x40;
        const bipPath = BIPPath.fromString(path).toPathArray();
        const apduArray = [];
        let offset = 0;

        while (offset !== rawTx.length) {
            const maxChunkSize = offset === 0 ? MAX_CHUNK_SIZE - 1 - bipPath.length * 4 : MAX_CHUNK_SIZE;
            const chunkSize = offset + maxChunkSize > rawTx.length ? rawTx.length - offset : maxChunkSize;
            // APDU fields configuration
            const apdu = {
                cla: CLA_FIELD,
                ins: TX_INS_FIELD,
                p1: offset === 0 ? (chunkSize < maxChunkSize ? 0x00 : 0x80) : chunkSize < maxChunkSize ? 0x01 : 0x81,
                p2: curveMask | (chainCode ? 0x01 : 0x00),
                data: offset === 0 ? Buffer.alloc(1 + bipPath.length * 4 + chunkSize) : Buffer.alloc(chunkSize),
            };

            if (offset === 0) {
                apdu.data.writeInt8(bipPath.length, 0);
                bipPath.forEach((segment, index) => {
                    apdu.data.writeUInt32BE(segment, 1 + index * 4);
                });
                rawTx.copy(apdu.data, 1 + bipPath.length * 4, offset, offset + chunkSize);
            } else {
                rawTx.copy(apdu.data, 0, offset, offset + chunkSize);
            }
            apduArray.push(apdu);
            offset += chunkSize;
        }
        let response = Buffer.alloc(0);
        for (const apdu of apduArray) {
            response = await this.transport.send(apdu.cla, apdu.ins, apdu.p1, apdu.p2, apdu.data);
        }

        if (response.toString() != CONTINUE_SENDING) {
            return response;
        }
    }
}
