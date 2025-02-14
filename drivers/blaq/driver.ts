'use strict';

import Homey from 'homey';
import { DiscoveryResult } from '../DiscoveryResult';
import * as Konnected from '../../lib/Konnected';

module.exports = class BlaqDriver extends Homey.Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('Konnected GDO Blaq driver has been initialized');
  }

  async onPair(session: Homey.Driver.PairSession): Promise<void> {
    let device: { name: string, data: { id: string, address: string; port: number; }, settings: { username: string, password: string; } };

    session.setHandler('list_devices', async () => this.onPairListDevices());

    session.setHandler('showView', async (view) => {
      if (view === 'loading') {
        const result = await Konnected.Api.verifyConnection(device.data.address, device.data.port);
        if (result === Konnected.Models.ApiVerificationResponses.Success) {
          await session.showView('add_device');
        } else {
          await session.showView('login_credentials');
        }
      }
    });

    session.setHandler('list_devices_selection', async (data) => {
      device = data[0];
    });

    session.setHandler('add_device', async () =>{
      return device;
    });

    session.setHandler('login', async (data) => {
      device.settings.username = data.username;
      device.settings.password = data.password;

      const result = await Konnected.Api.verifyConnection(device.data.address, device.data.port, data.username, data.password).catch(this.error);

      return (result === Konnected.Models.ApiVerificationResponses.Success);
    });
  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    const discoveryStrategy = this.getDiscoveryStrategy();
    const discoveryResults = discoveryStrategy.getDiscoveryResults();

    const devices = Object.values(discoveryResults).map((discoveryResult) => {
      const device = discoveryResult as DiscoveryResult;
      return {
        name: device.txt.friendly_name,
        data: {
          id: device.id,
          address: device.address,
          port: device.port,
        },
        settings: {
          username: '',
          password: '',
        },
      };
    });

    return devices;
  }

};
