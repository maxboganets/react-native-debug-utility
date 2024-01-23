import * as _ from "underscore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Constants= = {
    storagePrefix: 'myAppName'
};

export let Storage = {
    // send this a key - returns JSON
    get: function (key, raw, callback) {
        if (typeof callback == "function") {
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
                            const returnData = raw ? data : JSON.parse(data);

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
            if (typeof callback == "function") {
                AsyncStorage.setItem(Constants.storagePrefix + key, saveRaw ? valueJSON : JSON.stringify(valueJSON), callback);
            } else {
                return AsyncStorage.setItem(Constants.storagePrefix + key, saveRaw ? valueJSON : JSON.stringify(valueJSON));
            }
        }
    },

    multiSet: function (arrayOfArrays, callback = () => {}) {
        AsyncStorage.multiSet(arrayOfArrays, callback);
    },

    delete: function (key, callback) {
        if (typeof callback == "function") {
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
    }
};
