'use strict';

import Homey from 'homey';
import * as Konnected from '../lib/Konnected';
import { KonnectedApp } from '../app';

export class KonnectedDevice extends Homey.Device {

  app: KonnectedApp = this.homey.app as KonnectedApp;
  api: Konnected.Api = new Konnected.Api();

  /**
   * Registers synchronization for a switch capability between Homey and the device.
   *
   * This method sets up listeners to synchronize the state of a switch capability
   * between Homey and the physical device. It listens for changes in Homey and updates
   * the device state accordingly, and vice versa.
   *
   * @param capability - The capability to be synchronized (e.g., 'onoff').
   * @param sw - The switch object representing the physical switch on the device.
   *
   * @returns void
   */
  protected registerSwitchSync(capability: string, sw: Konnected.Switches): void {
    if (!this.hasCapability(capability)) {
      return;
    }

    // Listen for changes in Homey
    this.registerCapabilityListener(capability, async (value: boolean) => {
      await this.api.setSwitchState(sw, value);
    });

    // Listen for changes from device
    this.api.on(sw, async (value: boolean) => {
      await this.setCapabilityValue(capability, value);
    });
  }

  /**
   * Registers a custom synchronization for a specific capability.
   *
   * @template T - The type of the value to be synchronized. Can be a string, number, boolean, or object.
   * @param {string} capability - The capability to be synchronized.
   * @param {Konnected.Events} event - The event to listen for synchronization.
   * @param {(newValue: T) => void | Promise<void>} listener - The listener function to handle the new value.
   * @returns {void}
   */
  protected registerCustomSync<T extends string | number | boolean | object>(capability: string, event: Konnected.Events, listener: (newValue: T) => void | Promise<void>): void {
    if (!this.hasCapability(capability)) {
      return;
    }

    this.api.on(event, async (value: string | number | boolean | object) => {
      await this.setCapabilityValue(capability, value);
    });

    this.registerCapabilityListener(capability, listener);
  }

  /**
   * Registers a button trigger for a specific capability.
   *
   * @param capability - The capability to check for and register the listener.
   * @param button - The button to be pressed when the capability is triggered.
   */
  protected registerButtonTrigger(capability: string, button: Konnected.Buttons): void {
    if (!this.hasCapability(capability)) {
      return;
    }

    this.registerCapabilityListener(capability, async () => {
      await this.api.pressButton(button);
    });
  }

  /**
   * Registers an alarm listener for a specific capability and event.
   *
   * @param capability - The capability to set the value for.
   * @param alarm - The event to listen for from the Konnected API.
   * @param invert - Optional. If true, the value will be inverted before setting the capability. Defaults to false.
   */
  protected registerAlarmListener(capability: string, alarm: Konnected.Alarms, invert: boolean = false): void {
    if (!this.hasCapability(capability)) {
      return;
    }

    this.api.on(alarm, async (value: boolean) => {
      await this.setCapabilityValue(capability, invert ? !value : value);
    });
  }

  /**
   * Registers a listener for a specific capability measurement event.
   *
   * @param capability - The capability to listen for.
   * @param event - The event to listen for, which triggers when the capability value changes.
   *
   * @remarks
   * This method checks if the device has the specified capability before registering the event listener.
   * When the event is triggered, the capability value is updated asynchronously.
   */
  protected registerMeasureListener(capability: string, event: Konnected.Events): void {
    if (!this.hasCapability(capability)) {
      return;
    }

    this.api.on(event, async (value: number | string | boolean | object) => {
      await this.setCapabilityValue(capability, value);
    });
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    if (changedKeys.includes('username') || changedKeys.includes('password')) {
      this.api.disconnect();

      await this.setUnavailable(this.app.locale.DEVICE.SETTINGS_UPDATED);
      this.api.username = newSettings.username as string;
      this.api.password = newSettings.password as string;

      this.api.connect().then(async () => {
        await this.setAvailable();
      }).catch(async (error: Error) => {
        await this.setUnavailable(error.message);
      });
    }
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    if (this.api) {
      this.api.disconnect();
    }
  }

  async onDiscoveryAvailable(discoveryResult: Homey.DiscoveryResult): Promise<void> {
    await this.setUnavailable(this.app.locale.DEVICE.FOUND);
    await this.connect(discoveryResult);
  }

  async onDiscoveryAddressChanged(discoveryResult: Homey.DiscoveryResult): Promise<void> {
    await this.setUnavailable(this.app.locale.DEVICE.ADDRESS_CHANGED);
    await this.connect(discoveryResult);
  }

  async onDiscoveryLastSeenChanged(discoveryResult: Homey.DiscoveryResult): Promise<void> {
    await this.setUnavailable(this.app.locale.DEVICE.LAST_SEEN_CHANGED);
    await this.connect(discoveryResult);
  }

  async connect(discoveryResult: Homey.DiscoveryResult): Promise<void> {
    if (discoveryResult.id !== this.getData().id) {
      this.log('Discovery result does not match device id, ignoring.');
      return;
    }

    const details: { address: string, port: number, id: string } = discoveryResult as unknown as { address: string, port: number, id: string };
    this.log('Connecting:', { ipAddress: details.address, port: details.port, id: details.id });

    await this.api.connect({
      ipAddress: details.address,
      port: details.port,
      username: this.getSetting('username'),
      password: this.getSetting('password'),
    }).catch(async (error) => {
      if (error instanceof Konnected.Errors.UnauthorizedError) {
        throw new Error(this.app.locale.UNAUTHORISED);
      }

      throw error;
    });

    this.log('Connected:', { ipAddress: details.address, port: details.port, id: details.id });
    await this.setAvailable();
  }

}

export default KonnectedDevice;
