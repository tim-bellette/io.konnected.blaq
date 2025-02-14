'use strict';

import * as Konnected from '../../lib/Konnected';
import { KonnectedDevice } from '../KonnectedDevice';
import Capabilities from './Capabilities';

class Device extends KonnectedDevice {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log(`${this.getName()} is initializing...`);

    // Logging
    this.api.on(Konnected.Events.Log, (message: string) => this.log(message));
    this.api.on(Konnected.Events.Error, (error: Error) => this.log(error?.message || 'An error occurred.'));

    // Garage Door
    this.registerGarageDoorSync();

    // Security Protocol
    this.registerCustomSync(Capabilities.GarageDoor.SecurityProtocol, Konnected.Events.SecurityProtocol, async (newValue: string) => {
      await this.api.setSecurityProtocol(newValue as Konnected.Models.SecurityProtocols);
    });

    // Switches
    this.registerSwitchSync(Capabilities.Light.OnOff, Konnected.Switches.Light);
    this.registerSwitchSync(Capabilities.GarageDoor.ToggleOnly, Konnected.Switches.ToggleOnly);
    this.registerSwitchSync(Capabilities.Remote.Lock, Konnected.Switches.RemoteLock);
    this.registerSwitchSync(Capabilities.Remote.Learn, Konnected.Switches.Learn);

    // Buttons
    this.registerButtonTrigger(Capabilities.Button.PlaySound, Konnected.Models.Buttons.PlaySound);
    this.registerButtonTrigger(Capabilities.Button.PreCloseWarning, Konnected.Models.Buttons.PreCloseWarning);
    this.registerButtonTrigger(Capabilities.Button.ReSync, Konnected.Models.Buttons.ReSync);
    this.registerButtonTrigger(Capabilities.Button.ResetDoorTimings, Konnected.Models.Buttons.ResetDoorTimings);
    this.registerButtonTrigger(Capabilities.Button.Restart, Konnected.Models.Buttons.Restart);

    // Measures
    this.registerMeasureListener(Capabilities.Measures.WifiSignalStrength, Konnected.Events.WifiStrength);

    // Alarms
    this.registerAlarmListener(Capabilities.Alarm.MotorRunning, Konnected.Alarms.Motor);
    this.registerAlarmListener(Capabilities.Alarm.Motion, Konnected.Alarms.MotionDetected);
    this.registerAlarmListener(Capabilities.Alarm.NotSynced, Konnected.Alarms.Synced, true);
    this.registerAlarmListener(Capabilities.Alarm.Obstruction, Konnected.Alarms.ObstructionDetected);
    this.registerAlarmListener(Capabilities.Alarm.WallButton, Konnected.Alarms.WallButtonPressed);

    this.log(`${this.getName()} has been initialized.`);
  }

  /**
   * Registers listeners and handlers for garage door synchronization.
   *
   * This method sets up capability listeners for the garage door's closed state and position,
   * and also listens for device updates from the API to synchronize the garage door state.
   *
   * Listeners:
   * - `Capabilities.GarageDoor.Closed`: Opens or closes the garage door based on the boolean value.
   * - `Capabilities.GarageDoor.Position`: Sets the garage door position based on the numeric value.
   *
   * Device Updates:
   * - Listens for `Konnected.Events.Door` events to update the garage door's closed state and position.
   *
   * @private
   */
  private registerGarageDoorSync() {
    // Closed capability
    this.registerCapabilityListener(Capabilities.GarageDoor.Closed, async (value: boolean) => {
      if (!value) {
        await this.api.openGarageDoor();
      } else {
        await this.api.closeGarageDoor();
      }
    });

    // Window covering position capability
    this.registerCapabilityListener(Capabilities.GarageDoor.Position, async (value: number) => {
      await this.api.setGarageDoorPosition(value);
    });

    // Device updates
    this.api.on(Konnected.Events.Door, async (isClosed: boolean, position: number) => {
      await this.setCapabilityValue(Capabilities.GarageDoor.Closed, isClosed);
      await this.setCapabilityValue(Capabilities.OnOff, !isClosed);
      await this.setCapabilityValue(Capabilities.GarageDoor.Position, position);
    });
  }

}

export default Device;

module.exports = Device;
