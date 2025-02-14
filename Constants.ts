'use strict';

export interface ILocales {
  DEVICE: {
    SETTINGS_UPDATED: string,
    FOUND: string,
    ADDRESS_CHANGED: string,
    LAST_SEEN_CHANGED: string,
  },
  UNAUTHORISED: string,
}

export const LOCALES: ILocales = {
  DEVICE: {
    SETTINGS_UPDATED: 'device.settingsUpdated',
    FOUND: 'device.found',
    ADDRESS_CHANGED: 'device.addressChanged',
    LAST_SEEN_CHANGED: 'device.lastSeenChanged',
  },
  UNAUTHORISED: 'unauthorised',
};

export default LOCALES;
