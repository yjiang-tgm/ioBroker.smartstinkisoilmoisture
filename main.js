'use strict';
/*
 * Created with @iobroker/create-adapter v1.21.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
// const fs = require("fs");

const axios = require('axios').default;
const {stringify} = require('flatted/cjs');

class SoilMoisture extends utils.Adapter {

    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'smartstinkisoilmoisture',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
        process.on('SIGINT', () => this.terminate ? this.terminate() : process.exit());
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    onReady() {
        this.log.info('Adapter ready');
        /*this.setObject('soilMoisture', {
            type: 'state',
            common: {
                name: 'soilMoisture',
                type: 'number',
                role: 'value',
                read: true,
                write: false,
            },
            native: {},
        });*/
        this.readValues();
        this.interval = setInterval(this.readValues.bind(this), 600000);
    }

    /**
     * Reads the values from the soil moisture sensor and puts the value in the object as a percentage
     * the percentage is calculated from the sensor value (0-1023) and inverted (since 0 is reported as wet
     * and 1023 is reported as dry)
     */
    readValues() {
        const url = this.config.serverurl;
        this.log.info('Making a HTTP request to ' + url);

        // Conversion rate 1023 -> 100%
        const conversion = 100 / 1023;

        axios.get(url)
            .then(response => {
                // flip the percentage, since 100% is dry and 0% is wet
                const percentage = 100 - (stringify(response) * conversion);
                this.setState('soilMoisture', {val: percentage, ack: true});
            })
            .catch(reason => this.log.error(reason));
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            if(this.interval) clearInterval(this.interval);
            this.log.info('Cleaned everything up...');
            callback();
        } catch (e) {
            this.log.error(e);
            callback();
        }
    }
}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new SoilMoisture(options);
} else {
    // otherwise start the instance directly
    new SoilMoisture();
}