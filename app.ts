'use strict';

import Homey from 'homey';
import { ILocales, LOCALES } from './Constants';

export class KonnectedApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('Konnected has been initialized');
  }

  locale: ILocales = {
    DEVICE: {
      SETTINGS_UPDATED: this.homey.__(LOCALES.DEVICE.SETTINGS_UPDATED),
      FOUND: this.homey.__(LOCALES.DEVICE.FOUND),
      ADDRESS_CHANGED: this.homey.__(LOCALES.DEVICE.ADDRESS_CHANGED),
      LAST_SEEN_CHANGED: this.homey.__(LOCALES.DEVICE.LAST_SEEN_CHANGED),
    },
    UNAUTHORISED: this.homey.__(LOCALES.UNAUTHORISED),
  };

}

export default KonnectedApp;

module.exports = KonnectedApp;
