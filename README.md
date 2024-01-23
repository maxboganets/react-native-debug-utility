This is a simple utility to save an information in local storage on mobile device. New records are placed at the beginning and sorted by date.

It rely on two react native modules, put them into your package.json file:

1. moment
2. @react-native-async-storage/async-storage

Utility is in the mjs file and can be used with ES6 code. to include the utility to the other file do the following:

    import {ReactNativeDebugUtility} from './ReactNativeDebugUtility.mjs';

**How to add new record to the storage:**

    const saveDebugResponse = await DebugUtility.addDebugData({
        text: 'New Dedug Record Added'
    });

**How to get debug data:**

    DebugUtility.getDebugData()
        .then( response => {
            // Do something
        })
        .catch( error => {
            // Handle an error
        });

or:

    try {
        const debugData = await DebugUtility.getDebugData();
    } catch (error) {
        // Handle an error
    }

**Example:**

    import {
        ScrollView,
        View
    } from "react-native";
    import React from 'react';
    import moment from "moment";
    import {ReactNativeDebugUtility} from "./ReactNativeDebugUtility";

    const _ = require('underscore');

    export const DebugDataPage = class extends React.Component {
        constructor(props) {
                super(props);
    
            this.state = {
                loading: true,
                debugData: null
            };
        }

        componentDidMount = () => {
            this.fetchData();
        };

        async fetchData () {
            DebugUtility.getDebugData()
                .then( response => {
                    this.setState({
                        loading: false,
                        debugData: response
                    });
                })
                .catch( error => {
                    this.messageDisplayer.displayErrorMessage(`An error occurred fetching debug data: ${error}`);
                    this.setState({
                        loading: false,
                        debugData: []
                    });
                });
        }

        getDebugRows () {
            const {debugData} = this.state;
            let components = [];
            if (!Array.isArray(debugData)) {
                return components;
            }
            debugData.map(debugRow => {
                components.push(
                    <View>
                        <Text>{moment(debugRow.timestamp).format("YYYY-MM-DD HH:mm")}</Text>
                        <Text>{debugRow.text}</Text>
                    </View>
                );
            });
            return components;
        }

        render = () => {
            const {
                loading,
                debugData
            } = this.state;
    
            return (
                <View>
                    {loading === false &&
                        <ScrollView
                            ref="scroller"
                            style={{}}
                        >
                            {this.getDebugRows()}
                        </ScrollView>
                    }
                </View>
            );
        }
    });


