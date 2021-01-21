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

    async signTransaction(path, transaction, networkGenerationHash, signerPublicKey) {
        try {
            this.transport = await this.openTransport();
            const symbolLedger = new SymbolLedger(this.transport, 'XYM');
            const result = await symbolLedger.signTransaction(path, transaction, networkGenerationHash, signerPublicKey);
            return result;
        } catch (error) {
            throw this.formatError(error);
        } finally {
            await this.closeTransport();
        }
    }
}
