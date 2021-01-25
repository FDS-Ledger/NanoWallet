import { SymbolLedger } from './Ledger';
import NemH from '../hw-app-nem';
import AlertService from '../../../services/alert.service';
const alertService= new AlertService();
const TransportNodeHid = window['TransportNodeHid'] && window['TransportNodeHid'].default;

export class LedgerService {

    // async openTransport() {
    //     return await TransportNodeHid.open();
    // }

    // async closeTransport() {
    //     TransportNodeHid && this.transport && (await this.transport.close());
    // }

    // formatError(error) {
    //     return error.statusCode || error.id ? { errorCode: error.statusCode || error.id } : error;
    // }

    // async signTransaction(path, transaction, networkGenerationHash, signerPublicKey) {
    //     try {
    //         this.transport = await this.openTransport();
    //         const symbolLedger = new SymbolLedger(this.transport, 'XYM');
    //         const result = await symbolLedger.signTransaction(path, transaction, networkGenerationHash, signerPublicKey);
    //         return result;
    //     } catch (error) {
    //         throw this.formatError(error);
    //     } finally {
    //         await this.closeTransport();
    //     }
    // }

    /**
   * Pop-up alert handler
   */
    alertHandler(inputErrorCode, isSymbolOptin, isTxSigning, txStatusText) {
        switch (inputErrorCode) {
            case 'NoDevice':
                alertService.ledgerDeviceNotFound();
                break;
            case 26628:
                alertService.ledgerDeviceLocked();
                break;
            case 27904:
                alertService.ledgerNotOpenApp(isSymbolOptin);
                break;
            case 27264:
                alertService.ledgerNotUsingCorrectApp(isSymbolOptin);
                break;
            case 27013:
                isTxSigning ? alertService.ledgerTransactionCancelByUser() : alertService.ledgerRequestCancelByUser();
                break;
            case 26368:
                isTxSigning ? alertService.ledgerNotOpenApp(isSymbolOptin) : alertService.ledgerTransactionTooBig();
                break;
            case 2:
                alertService.ledgerNotSupportApp();
                break;
            default:
                isTxSigning ? alertService.transactionError(txStatusText) : alertService.requestFailed(inputErrorCode);
                break;
        }
    }


    async signTransaction(path, transaction, networkGenerationHash, signerPublicKey) {
        return new Promise((resolve, reject) => {
            this.getAppVersion().then(checkVersion => {
                if (checkVersion != null) {
                    if (display) {
                        alert("Please check your Ledger device!");
                       setTimeout(() => {
                            alertService.ledgerFollowInstruction();
                        });
                    }

                    this.signTransactionSym(path, transaction, networkGenerationHash, signerPublicKey).then((result) => {
                        resolve(result);
                    }).catch((error) => {
                       setTimeout(() => {
                            this.alertHandler(error, true, false);
                        });
                        reject(true);
                    });

                } else {
                   setTimeout(() => {
                        this.alertHandler(checkVersion, true, false);
                    });
                    reject(true);
                }
            }).catch(error => {
               setTimeout(() => {
                    this.alertHandler(error, true, false);
                });
                reject(true);
            });
        });
    }

    async signTransactionSym(path, transaction, networkGenerationHash, signerPublicKey) {
        try {
            const transport = await TransportNodeHid.open("");
            const symbolLedger = new SymbolLedger(this.transport, 'XYM');
            try {
                const result = await symbolLedger.signTransaction(path, transaction, networkGenerationHash, signerPublicKey);
                return Promise.resolve(result);
            }
            catch (err) {
                throw err
            } finally {
                transport.close();
            }
        } catch (err) {
            if (err.statusCode != null) {
                return Promise.resolve(err);
            } else if (err.id != null) {
                return Promise.resolve(err.id);
            } else if (err.name == "TransportError") {
                alertService.ledgerFailedToSignTransaction(err.message);
                return;
            } else {
                return Promise.resolve(err);
            }
        }
    }

    /**
     * Get NEM Ledger app version
     */
    async getAppVersion() {
        try {
            const transport = await TransportNodeHid.open("");
            const nemH = new NemH(transport);
            try {
                const result = await nemH.getAppVersion();
                let appVersion = result;
                if (appVersion.majorVersion == null && appVersion.minorVersion == null && appVersion.patchVersion == null) {
                    if (result.statusCode != null) {
                        return Promise.reject(result.statusCode);
                    } else {
                        return Promise.reject(result.id);
                    }
                } else {
                    let statusCode;
                    if (appVersion.majorVersion < SUPPORT_VERSION.LEDGER_MAJOR_VERSION) {
                        statusCode = 2;
                    } else if (appVersion.minorVersion < SUPPORT_VERSION.LEDGER_MINOR_VERSION) {
                        statusCode = 2;
                    } else if (appVersion.patchVersion < SUPPORT_VERSION.LEDGER_PATCH_VERSION) {
                        statusCode = 2;
                    } else {
                        statusCode = 1;
                    }
                    return Promise.resolve(statusCode);
                }
            } catch (err) {
                throw err
            } finally {
                transport.close();
            }
        } catch (err) {
            if (err.statusCode != null) {
                return Promise.reject(err.statusCode);
            } else if (err.id != null) {
                return Promise.reject(err.id);
            } else {
                return Promise.reject(err);
            }
        }
    }
}
