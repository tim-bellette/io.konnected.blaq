'use strict';

import { ErrorEvent, EventSource } from 'eventsource';
import { TypedEmitter } from 'tiny-typed-emitter';

import { Alarms } from './Models/Alarms';
import { ApiEvents, IAllEvents } from './Models/ApiEvents';
import { ApiVerificationResponses } from './Models/ApiVerificationResponses';
import {
  BasePayload,
  DeviceIdPayload,
  GarageDoorStatePayload,
  GarageLightStatePayload,
  GarageOpeningsPayload,
  GarageRemoteControlLockStatePayload,
  IPAddressPayload,
  LearnModeStatePayload,
  MotionSensorStatePayload,
  ObstructionStatePayload,
  ProtocolSyncStatePayload,
  SecurityProtocolPayload,
  ToggleOnlyPayload,
  UptimePayload,
  WallButtonStatePayload,
  WifiSignalPercentPayload,
  WifiSignalRssiPayload,
  GarageOpenerMotorStatePayload,
} from './Models/Payloads';
import { BlaqEndPoints, BlaqGetEndpoints, BlaqPostEndPoints } from './Models/BlaqEndPoints';
import { Buttons, ButtonMappings } from './Models/Buttons';
import { DeviceEvents } from './Models/DeviceEvents';
import { ESPHomeEvents } from './Models/ESPHomeEvents';
import { GarageDoorStates } from './Models/GarageDoorStates';
import { LockStates } from './Models/LockStates';
import { OnOff } from './Models/OnOff';
import { SecurityProtocols } from './Models/SecurityProtocols';
import { Switches, SwitchMappings } from './Models/Switches';
import { UnauthorizedError } from './Models/Errors';

export const DEFAULT_MAX_RETRY_COUNT = 5;

export class Api extends TypedEmitter<IAllEvents> {

  private _ipAddress: string = '';
  public get ipAddress(): string {
    return this._ipAddress;
  }

  private _port: number = 80;
  public get port(): number {
    return this._port;
  }

  private _username: string = '';
  public get username(): string {
    return this._username;
  }

  public set username(value: string) {
    this._username = value;
  }

  private _password: string = '';
  public get password(): string {
    return this._password;
  }

  public set password(value: string) {
    this._password = value;
  }

  public get url(): string {
    return `http://${this.ipAddress}:${this.port}`;
  }

  private _eventSource: EventSource | null = null;

  /**
   * Connects to the device using the provided options.
   *
   * @param options - An optional object containing connection parameters.
   * @param options.ipAddress - The IP address of the device.
   * @param options.port - The port number to connect to.
   * @param options.username - The username for authentication (optional).
   * @param options.password - The password for authentication (optional).
   * @param options.maxRetries - The maximum number of retry attempts (optional).
   *
   * @returns A promise that resolves when the connection is successfully established.
   *
   * @throws UnauthorizedError - If the connection fails due to unauthorized access.
   * @throws Error - If the connection fails after the maximum number of retries.
   */
  public async connect(options?: { ipAddress: string, port: number, username?: string, password?: string, maxRetries?: number }): Promise<void> {
    const maxRetries = options?.maxRetries || DEFAULT_MAX_RETRY_COUNT;

    if (options) {
      this._ipAddress = options.ipAddress;
      this._port = options.port;
      this._username = options.username || '';
      this._password = options.password || '';
    }

    if (this._eventSource) {
      this._eventSource.close();
    }

    return new Promise<void>((resolve, reject) => {
      let retryCount = 0;
      this._eventSource = new EventSource(`${this.url}/events`, {
        fetch: (input, init) => fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            Authorization: this.getAuthorizationHeader(),
          },
        }),
      });

      // Connection error
      const connectionErrorListener = (error: ErrorEvent) => {
        if (error.code === 401) {
          reject(new UnauthorizedError(error.message));
        }

        if (this._eventSource?.readyState === this._eventSource?.CONNECTING) {
          if (retryCount < maxRetries) {
            retryCount++;
            this.emit(ApiEvents.Log, `Failed to connect to device. Retrying...${retryCount} of ${maxRetries}`);
          } else {
            this._eventSource?.removeEventListener(ESPHomeEvents.Error, connectionErrorListener);
            this._eventSource?.close();
            reject(new Error(error.message));
          }
        }
      };
      this._eventSource.addEventListener(ESPHomeEvents.Error, connectionErrorListener);

      // Connected
      const connectionOpenedListener = () => {
        this._eventSource?.removeEventListener(ESPHomeEvents.Error, connectionErrorListener);
        this._eventSource?.removeEventListener(ESPHomeEvents.Open, connectionOpenedListener);
        this._eventSource?.addEventListener(ESPHomeEvents.State, (event) => this.onStateUpdate(event));
        this._eventSource?.addEventListener(ESPHomeEvents.Error, (error) => this.onError(error));

        resolve();
      };
      this._eventSource.addEventListener(ESPHomeEvents.Open, connectionOpenedListener);
    });
  }

  /**
   * Disconnects the current event source if it exists.
   *
   * This method checks if there is an active event source (`_eventSource`).
   * If an event source is found, it closes the connection.
   */
  public disconnect() {
    if (this._eventSource) {
      this._eventSource.close();
    }
  }

  /**
   * Handles error events by emitting an error event with the appropriate error message.
   *
   * @param error - The error event that occurred.
   */
  protected onError(error: ErrorEvent): void {
    this.emit(ApiEvents.Error, error.message ? new Error(error.message) : new Error('An unknown error occurred.'));
  }

  /**
   * Handles the state update event by parsing the event data and emitting the corresponding event.
   *
   * @param event - The message event containing the state update data.
   *
   * The function processes the following device events:
   * - `DeviceEvents.GarageDoorCover`: Emits `ApiEvents.Door` with the garage door state and position.
   * - `DeviceEvents.GarageLight`: Emits `Models.Switches.Light` with the garage light state.
   * - `DeviceEvents.RemoteLock`: Emits `Models.Switches.RemoteLock` with the remote lock state.
   * - `DeviceEvents.MotionSensor`: Emits `Models.Alarms.MotionDetected` with the motion sensor value.
   * - `DeviceEvents.SyncedSensor`: Emits `Models.Alarms.Synced` with the protocol sync state value.
   * - `DeviceEvents.ObstructionSensor`: Emits `Models.Alarms.ObstructionDetected` with the obstruction sensor value.
   * - `DeviceEvents.MotorSensor`: Emits `Models.Alarms.Motor` with the garage opener motor state value.
   * - `DeviceEvents.WallButtonSensor`: Emits `Models.Alarms.WallButtonPressed` with the wall button state value.
   * - `DeviceEvents.GarageOpeningsSensor`: Emits `ApiEvents.Openings` with the garage openings value.
   * - `DeviceEvents.SecurityProtocolSelect`: Emits `ApiEvents.SecurityProtocol` with the security protocol value.
   * - `DeviceEvents.LearnSwitch`: Emits `Models.Switches.Learn` with the learn mode state value.
   * - `DeviceEvents.WifiSignalStrength`: Emits `ApiEvents.WifiStrength` with the WiFi signal RSSI value.
   * - `DeviceEvents.WifiSignalPercentage`: Emits `ApiEvents.WifiPercentage` with the WiFi signal percentage value.
   * - `DeviceEvents.UptimeSensor`: Emits `ApiEvents.Uptime` with the uptime value.
   * - `DeviceEvents.DeviceId`: Emits `ApiEvents.DeviceId` with the device ID state.
   * - `DeviceEvents.IPAddressTextSensor`: Emits `ApiEvents.IPAddress` with the IP address value.
   * - `DeviceEvents.ToggleOnlySwitch`: Emits `Models.Switches.ToggleOnly` with the toggle-only switch value.
   */
  protected onStateUpdate(event: MessageEvent): void {
    if (!event.data) {
      return; // no data to process
    }

    const data: BasePayload = JSON.parse(event.data);

    switch (data.id) {
      case DeviceEvents.GarageDoorCover:
        this.emit(ApiEvents.Door, (data as GarageDoorStatePayload).state === GarageDoorStates.Closed, (data as GarageDoorStatePayload).position);
        break;

      case DeviceEvents.GarageLight:
        this.emit(Switches.Light, (data as GarageLightStatePayload).state === OnOff.On);
        break;

      case DeviceEvents.RemoteLock:
        this.emit(Switches.RemoteLock, (data as GarageRemoteControlLockStatePayload).state === LockStates.Locked);
        break;

      case DeviceEvents.MotionSensor:
        this.emit(Alarms.MotionDetected, (data as MotionSensorStatePayload).value);
        break;

      case DeviceEvents.SyncedSensor:
        this.emit(Alarms.Synced, (data as ProtocolSyncStatePayload).value);
        break;

      case DeviceEvents.ObstructionSensor:
        this.emit(Alarms.ObstructionDetected, (data as ObstructionStatePayload).value);
        break;

      case DeviceEvents.MotorSensor:
        this.emit(Alarms.Motor, (data as GarageOpenerMotorStatePayload).value);
        break;

      case DeviceEvents.WallButtonSensor:
        this.emit(Alarms.WallButtonPressed, (data as WallButtonStatePayload).value);
        break;

      case DeviceEvents.GarageOpeningsSensor:
        this.emit(ApiEvents.Openings, (data as GarageOpeningsPayload).value);
        break;

      case DeviceEvents.SecurityProtocolSelect:
        this.emit(ApiEvents.SecurityProtocol, (data as SecurityProtocolPayload).value);
        break;

      case DeviceEvents.LearnSwitch:
        this.emit(Switches.Learn, (data as LearnModeStatePayload).value);
        break;

      case DeviceEvents.WifiSignalStrength:
        this.emit(ApiEvents.WifiStrength, (data as WifiSignalRssiPayload).value);
        break;

      case DeviceEvents.WifiSignalPercentage:
        this.emit(ApiEvents.WifiPercentage, (data as WifiSignalPercentPayload).value);
        break;

      case DeviceEvents.UptimeSensor:
        this.emit(ApiEvents.Uptime, (data as UptimePayload).value);
        break;

      case DeviceEvents.DeviceId:
        this.emit(ApiEvents.DeviceId, (data as DeviceIdPayload).state);
        break;

      case DeviceEvents.IPAddressTextSensor:
        this.emit(ApiEvents.IPAddress, (data as IPAddressPayload).value);
        break;

      case DeviceEvents.ToggleOnlySwitch:
        this.emit(Switches.ToggleOnly, (data as ToggleOnlyPayload).value);
        break;

      default:
        break;
    }
  }

  public async isGarageDoorOpen(): Promise<boolean> {
    const { data } = await this.get(BlaqEndPoints.GarageDoor);

    if (!data) {
      throw new Error('Error fetching garage door state. No data returned.');
    }

    return data.state === GarageDoorStates.Open;
  }

  public async openGarageDoor(): Promise<void> {
    await this.post(BlaqEndPoints.GarageDoorOpen, {});
  }

  public async closeGarageDoor(): Promise<void> {
    await this.post(BlaqEndPoints.GarageDoorClose, {});
  }

  public async stopGarageDoor(): Promise<void> {
    await this.post(BlaqEndPoints.GarageDoorStop, {});
  }

  public async toggleGarageDoor(): Promise<void> {
    await this.post(BlaqEndPoints.GarageDoorToggle, {});
  }

  public async setGarageDoorPosition(position: number): Promise<void> {
    await this.post(BlaqEndPoints.GarageDoorSet, { position });
  }

  public async isGarageLightOn(): Promise<boolean> {
    const { data } = await this.get(BlaqEndPoints.GarageLight);

    if (!data) {
      throw new Error('Error fetching garage light state. No data returned.');
    }

    return data.state === OnOff.On;
  }

  public async turnOnGarageLight(): Promise<void> {
    await this.post(BlaqEndPoints.GarageLightTurnOn, {});
  }

  public async turnOffGarageLight(): Promise<void> {
    await this.post(BlaqEndPoints.GarageLightTurnOff, {});
  }

  public async toggleGarageLight(): Promise<void> {
    await this.post(BlaqEndPoints.GarageLightToggle, {});
  }

  public async isRemoteLocked(): Promise<boolean> {
    const { data } = await this.get(BlaqEndPoints.Lock);

    if (!data) {
      throw new Error('Error fetching lock state. No data returned.');
    }

    return data.state === LockStates.Locked;
  }

  public async lockRemote(): Promise<void> {
    await this.post(BlaqEndPoints.LockLock, {});
  }

  public async unlockRemote(): Promise<void> {
    await this.post(BlaqEndPoints.LockUnlock, {});
  }

  public async isMotionDetected(): Promise<boolean> {
    const { data } = await this.get(BlaqEndPoints.MotionSensor);

    if (!data) {
      throw new Error('Error fetching motion sensor state. No data returned.');
    }

    return data.state === OnOff.On;
  }

  public async isSynced(): Promise<boolean> {
    const { data } = await this.get(BlaqEndPoints.RollingCodeSynced);

    if (!data) {
      throw new Error('Error fetching rolling code sync state. No data returned.');
    }

    return data.state === OnOff.On;
  }

  public async isObstructionDetected(): Promise<boolean> {
    const { data } = await this.get(BlaqEndPoints.Obstruction);

    if (!data) {
      throw new Error('Error fetching obstruction sensor state. No data returned.');
    }

    return data.state === OnOff.On;
  }

  public async isMotorRunning(): Promise<boolean> {
    const { data } = await this.get(BlaqEndPoints.MotorRunning);

    if (!data) {
      throw new Error('Error fetching motor state. No data returned.');
    }

    return data.state === OnOff.On;
  }

  public async isWallButtonPressed(): Promise<boolean> {
    const { data } = await this.get(BlaqEndPoints.WallButtonPressed);

    if (!data) {
      throw new Error('Error fetching wall button state. No data returned.');
    }

    return data.state === OnOff.On;
  }

  public async getGarageOpenings(): Promise<number | null> {
    const { data } = await this.get(BlaqEndPoints.GarageOpenings);

    if (!data) {
      throw new Error('Error fetching garage openings. No data returned.');
    }

    return data.value;
  }

  public async getSecurityProtocol(): Promise<SecurityProtocols> {
    const { data } = await this.get(BlaqEndPoints.SecurityProtocol);

    if (!data) {
      throw new Error('Error fetching security protocol. No data returned.');
    }

    return data.value;
  }

  public async setSecurityProtocol(protocol: SecurityProtocols): Promise<void> {
    await this.post(BlaqEndPoints.SecurityProtocolSet, { option: protocol });
  }

  public async isLearnModeEnabled(): Promise<boolean> {
    const { data } = await this.get(BlaqEndPoints.Learn);

    if (!data) {
      throw new Error('Error fetching learn mode state. No data returned.');
    }

    return data.state === OnOff.On;
  }

  public async turnOnLearnMode(): Promise<void> {
    await this.post(BlaqEndPoints.LearnOn, {});
  }

  public async turnOffLearnMode(): Promise<void> {
    await this.post(BlaqEndPoints.LearnOff, {});
  }

  public async toggleLearnMode(): Promise<void> {
    await this.post(BlaqEndPoints.LearnToggle, {});
  }

  public async getWifiSignalRssi(): Promise<number> {
    const { data } = await this.get(BlaqEndPoints.WifiSignalRssi);

    if (!data) {
      throw new Error('Error fetching wifi signal strength. No data returned.');
    }

    return data.value;
  }

  public async getWifiSignalPercent(): Promise<number> {
    const { data } = await this.get(BlaqEndPoints.WifiSignalPercent);

    if (!data) {
      throw new Error('Error fetching wifi signal strength. No data returned.');
    }

    return data.value;
  }

  public async getUptime(): Promise<number> {
    const { data } = await this.get(BlaqEndPoints.Uptime);

    if (!data) {
      throw new Error('Error fetching uptime. No data returned.');
    }

    return data.value;
  }

  /**
   * Retrieves the device ID from the Blaq API.
   *
   * @returns {Promise<string>} A promise that resolves to the device ID.
   * @throws {Error} If there is an error fetching the device ID or if no data is returned.
   */
  public async getDeviceId(): Promise<string> {
    const { data } = await this.get(BlaqEndPoints.DeviceId);

    if (!data) {
      throw new Error('Error fetching device id. No data returned.');
    }

    return data.value;
  }

  public async getIpAddress(): Promise<string> {
    const { data } = await this.get(BlaqEndPoints.IPAddress);

    if (!data) {
      throw new Error('Error fetching IP address. No data returned.');
    }

    return data.value;
  }

  public async pressPreCloseWarningButton(): Promise<void> {
    await this.post(BlaqEndPoints.PreCloseWarningPress, {});
  }

  public async pressPlaySoundButton(): Promise<void> {
    await this.post(BlaqEndPoints.PlaySoundPress, {});
  }

  public async pressRestartButton(): Promise<void> {
    await this.post(BlaqEndPoints.RestartPress, {});
  }

  public async pressFactoryResetButton(): Promise<void> {
    await this.post(BlaqEndPoints.FactoryResetPress, {});
  }

  /**
   * Presses a button by sending a POST request to the corresponding endpoint.
   *
   * @param button - The button to be pressed, represented by a value from the `Models.Buttons` enum.
   * @returns A promise that resolves when the button press action is completed.
   *
   * @throws Will emit an `ApiEvents.Error` event if the button mapping is not found.
   */
  public async pressButton(button: Buttons): Promise<void> {
    const endpoint = ButtonMappings[button];

    if (!endpoint) {
      this.emit(ApiEvents.Error, new Error(`Button mapping not found for button: ${button}`));
      return;
    }

    await this.post(endpoint, {});
  }

  /**
   * Sets the state of a specified switch.
   *
   * @param sw - The switch to be controlled, represented by a `Models.Switches` enum.
   * @param state - The desired state of the switch. `true` to turn it on, `false` to turn it off.
   * @returns A promise that resolves when the switch state has been successfully set.
   */
  public async setSwitchState(sw: Switches, state: boolean): Promise<void> {
    const actions = SwitchMappings[sw];
    const action = state ? actions.on : actions.off;

    await this.post(action, {});
  }

  public static async verifyConnection(ipAddress: string, port: number): Promise<ApiVerificationResponses>;
  public static async verifyConnection(ipAddress: string, port: number, username: string, password: string): Promise<ApiVerificationResponses>;
  /**
   * Verifies the connection to a device using the provided IP address, port, and optional credentials.
   *
   * @param ipAddress - The IP address of the device to connect to.
   * @param port - The port number to use for the connection.
   * @param username - (Optional) The username for authentication.
   * @param password - (Optional) The password for authentication.
   * @returns A promise that resolves to an `ApiVerificationResponses` indicating the result of the verification.
   * @throws An error if the connection fails or an unexpected status code is received.
   */
  public static async verifyConnection(ipAddress: string, port: number, username?: string, password?: string): Promise<ApiVerificationResponses> {
    const api = new Api();

    api._ipAddress = ipAddress;
    api._port = port;
    api._username = username || '';
    api._password = password || '';

    const { response } = await api.get(BlaqEndPoints.DeviceId);

    if (response.status === 200) {
      return ApiVerificationResponses.Success;
    }

    if (response.status === 401) {
      if (username && password) {
        return ApiVerificationResponses.InvalidCredentials;
      }

      return ApiVerificationResponses.AuthenticationRequired;
    }

    throw new Error(`Unexpected status code: ${response.status}`);
  }

  /**
   * Generates the authorization header for HTTP Basic Authentication.
   *
   * @returns {string} The authorization header in the format `Basic <base64-encoded-credentials>`.
   *                   Returns an empty string if either the username or password is not set.
   */
  private getAuthorizationHeader(): string {
    return (this.username && this.password) ? `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}` : '';
  }

  /**
   * Sends a GET request to the specified endpoint and returns the response.
   *
   * @template T - The key of the endpoint in the `IBlaqEndpoints` interface.
   * @param {T} endpoint - The endpoint to send the GET request to.
   * @returns {Promise<{ response: Response, data?: IBlaqEndpoints[T], error?: string }>}
   * A promise that resolves to an object containing the response, the data (if the request was successful),
   * and an error message (if the request was not successful).
   */
  protected async get<T extends keyof BlaqGetEndpoints>(endpoint: T): Promise<{ response: Response, data?: BlaqGetEndpoints[T] }> {
    const options: RequestInit = {
      method: 'GET',
      headers: {
        Authorization: this.getAuthorizationHeader(),
        Accept: 'application/json',
      },
    };

    const response = await fetch(`${this.url}${endpoint}`, options);

    if (response.status === 401) {
      return { response };
    }

    if (response.status !== 200) {
      throw new Error(response.statusText);
    }

    return { response, data: await response.json() as BlaqGetEndpoints[T] };
  }

  /**
   * Sends a POST request to the specified endpoint with the given parameters.
   *
   * @template T - The type of the endpoint, which extends the keys of BlaqPostEndPoints.
   * @param {T} endpoint - The endpoint to which the POST request is sent.
   * @param {BlaqPostEndPoints[T]} parameters - The parameters to include in the POST request.
   * @returns {Promise<{ response: Response, error?: string }>} - A promise that resolves to an object containing the response and optionally an error message.
   * @throws {Error} - Throws an error if the response status is not 200.
   * @protected
   */
  protected async post<T extends keyof BlaqPostEndPoints>(endpoint: T, parameters: BlaqPostEndPoints[T]): Promise<{ response: Response, error?: string }> {
    const options: RequestInit = {
      method: 'POST',
      headers: {
        Authorization: this.getAuthorizationHeader(),
        Accept: 'application/json',
      },
    };

    let queryParameters = '';
    for (const [key, value] of Object.entries(parameters)) {
      queryParameters += `${key}=${encodeURIComponent(value)}&`;
    }

    const response = await fetch(`${this.url}${endpoint}?${queryParameters}`, options);

    if (response.status === 401) {
      return { response };
    }

    if (response.status !== 200) {
      throw new Error(response.statusText);
    }

    return { response };
  }

}

export default Api;
