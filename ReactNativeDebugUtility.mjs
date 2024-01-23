import {Storage} from './Storage';
import moment from 'moment';

export const ReactNativeDebugUtility = {
/*
 * addDebugData ARGS:
 * newRow - string, text
 * function RETURNS:
 * Promise with resolved / rejected response
 */
    addDebugData: async function (newRow) {
        const storageKey = Constants.storage.debugData;
        return new Promise( (resolve, reject) => {
            Storage.get(storageKey)
                .then((response) => {
                    let debugData = Array.isArray(response) ? response : [];
                    newRow.timestamp = moment();
                    debugData.unshift(newRow);
                    debugData = debugData.slice(0, Constants.debugRowsToStore);
                    Storage.set(storageKey, debugData)
                        .then((response) => {
                            resolve(response);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },

/*
 * getDebugData ARGS:
 * NONE
 * function RETURNS:
 * Promise with resolved / rejected response
 * Resolved response contain an array with hashes {timestamp, text}
 */
    getDebugData: async function () {
        const storageKey = Constants.storage.debugData;
        return new Promise( (resolve, reject) => {
            Storage.get(storageKey)
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
};
