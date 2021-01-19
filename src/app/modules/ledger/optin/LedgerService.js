import { SymbolLedger } from './Ledger';
const TransportNodeHid = window['TransportNodeHid'] && window['TransportNodeHid'].default;

export class LedgerService {
  
    async openTransport() {
        return await TransportNodeHid.open();
    }

    async closeTransport() {
        TransportNodeHid && this.transport && (await this.transport.close());
    }

    formatError(error) {
        return error.statusCode || error.id ? { errorCode: error.statusCode || error.id } : error;
    }

    async signCosignatureTransaction(path, cosignatureTransaction, signerPublicKey) {
        try {
 
            this.transport = await this.openTransport();
            const symbolLedger = new SymbolLedger(this.transport, 'XYM');
            const result = await symbolLedger.signCosignatureTransaction(path, cosignatureTransaction, signerPublicKey);
            await this.closeTransport();
            return result;
        } catch (error) {
            await this.closeTransport();
            throw this.formatError(error);
        }
    }
}
