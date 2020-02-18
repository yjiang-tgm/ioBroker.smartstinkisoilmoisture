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
        this.setObject('soilMoisture', {
            type: 'state',
            common: {
                name: 'soilMoisture',
                type: 'number',
                role: 'value',
                read: true,
                write: false,
            },
            native: {},
        });
        this.interval = setInterval(this.readValues.bind(this), 5000);
    }

    /**
     * Reads the values from the soil moisture sensor and puts the value in the object
     */
    readValues() {
        const url = this.config.serverurl;
        this.log.info('Making a HTTP request to ' + url);

        axios.get(url)
            .then(response => this.setState('soilMoisture', {val: stringify(response), ack: true}))
            .catch(reason => this.log.error(reason));
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            if(this.interval) clearInterval(this.interval);
            this.log.info('cleaned everything up...');
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