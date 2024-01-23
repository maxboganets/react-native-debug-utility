import * as _ from "underscore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Constants= = {
    storagePrefix: 'myAppName'
};

export let Storage = {
    caseKey: function (key, caseId) {
        return key + '-' + caseId;
    },

    caseAndPersonKey: function (key, caseId, personId) {
        return key + '-' + personId + '-' + caseId;
    },

    getWithCaseKeyFallback: function (key, caseId) {
        // sync for pending requests used to happen for local storage values keyed independently of case IDs.  Now
        // they're keyed by case ID.  The code has stopped writing to LS for the non-case-keys but needs to check them
        // until there's no chance the app will need to sync that data anymore.
        let rawResults;
        return this.get(key)
            .then( (rawResultsFromLs) => {
                rawResults = rawResultsFromLs;
                return this.get(this.caseKey(key, caseId));
            })
            .then( (caseResults) => {
                return Promise.resolve((rawResults || []).concat(caseResults || []));
            });
    },

    // send this a key - returns JSON
    get: function (key, raw, callback) {
        if (callback) {
            AsyncStorage.getItem(Constants.storagePrefix + key, (data) => {
                let returnData = null;
                if (data) {
                    if (raw) {
                        returnData = data;
                    } else {
                        returnData = JSON.parse(data);
                    }
                }
                callback(returnData);
            })
        } else {
            return new Promise( (resolve, reject) => {
                AsyncStorage.getItem(Constants.storagePrefix + key)
                    .then( (data) => {
                        if (data) {
                            let returnData = null;
                            if (raw) {
                                returnData = data;
                            } else {
                                returnData = JSON.parse(data);
                            }

                            window.setTimeout( () => {
                                resolve(returnData);
                            }, 0);

                        } else {
                            resolve(null);
                        }
                    })
                    .catch( (error) => {
                        console.log("ERROR during storage get: ", error);
                        reject(error);
                    })
            });
        }
    },

    // send this a key and a JSON object
    set: function (key, valueJSON, saveRaw, callback) {
        if (valueJSON == null) {
            return this.delete(key, callback);
        } else {
            if (callback) {
                AsyncStorage.setItem(Constants.storagePrefix + key, saveRaw ? valueJSON : JSON.stringify(valueJSON), callback);
            } else {
                return AsyncStorage.setItem(Constants.storagePrefix + key, saveRaw ? valueJSON : JSON.stringify(valueJSON));
            }
        }
    },

    multiSet: function (arrayOfArrays, callback) {
        AsyncStorage.multiSet(arrayOfArrays, callback);
    },

    delete: function (key, callback) {
        if (callback) {
            AsyncStorage.removeItem(Constants.storagePrefix + key, callback);
        } else {
            return AsyncStorage.removeItem(Constants.storagePrefix + key);
        }
    },

    // send this a key and a JSON object with an ID value - adds or updates value at that id
    addToArray: function (key, valueJSON, callback) {
        return this.get(key)
            .then( (dataArray) => {
                let newArray = _.filter(dataArray, (arrayItem) => {
                    return arrayItem.id != valueJSON.id;
                });

                newArray.push(valueJSON);

                return this.set(key, newArray, false, callback);
            });

    },

    mergeArrayToArray: function (key, inputArray, callback) {
        return this.get(key)
            .then( (dataArray) => {
                let inputIds = _.pluck(inputArray, 'id');

                let newArray = _.filter(dataArray, (arrayItem) => {
                    return !_.contains(inputIds, arrayItem.id);
                });

                newArray = newArray.concat(inputArray);

                return this.set(key, newArray, false, callback);
            });
    },


    // send this a key and a JSON object with an ID value - removes item at that ID if it's present
    removeFromArray: function (key, removeId, callback) {
        return this.get(key)
            .then( (dataArray) => {
                let currentDataArray = dataArray || [];

                let updatedDataArray = _.filter(currentDataArray, (arrayItem) => {
                    return arrayItem.id != removeId
                });

                return this.set(key, updatedDataArray, false, callback);
            });
    },

    arrayWithIdOrTempIdItemReplaced: function (originalArray, passedId, replaceValue) {
        let updatedArray = [];
        let newValue = true;

        for (let i = 0; i < originalArray.length; i++) {
            let arrayItem = originalArray[i];
            let checkValue = null;


            if ('' + arrayItem.id === '' + passedId || '' + arrayItem.new_temp_id === '' + passedId) {
                updatedArray.push(replaceValue);
                newValue = false;
            } else {
                updatedArray.push(arrayItem);
            }
        }

        if (newValue) {
            updatedArray.push(replaceValue);
        }

        return updatedArray;
    }
};