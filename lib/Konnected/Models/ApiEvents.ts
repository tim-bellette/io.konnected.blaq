'use strict';

import { SecurityProtocols } from '.';
import { AlarmEvents } from './Alarms';
import { SwitchEvents } from './Switches';

export const enum ApiEvents {
  Error = 'error',
  Openings = 'openings',
  WifiStrength = 'wifi_strength',
  DeviceId = 'device_id',
  Disconnected = 'disconnected',
  SecurityProtocol = 'security_protocol',
  WifiPercentage = 'wifi_percentage',
  Uptime = 'uptime',
  IPAddress = 'ip_address',
  Door = 'door',
  Log = 'log',
}
export interface IApiEvents {
  [ApiEvents.Error]: (error: Error) => void | Promise<void>;
  [ApiEvents.Openings]: (value: number | null) => void | Promise<void>;
  [ApiEvents.WifiStrength]: (value: number) => void | Promise<void>;
  [ApiEvents.DeviceId]: (value: string) => void | Promise<void>;
  [ApiEvents.Disconnected]: () => void | Promise<void>;
  [ApiEvents.Door]: (isClosed: boolean, position: number) => void | Promise<void>;
  [ApiEvents.SecurityProtocol]: (value: SecurityProtocols) => void | Promise<void>;
  [ApiEvents.WifiPercentage]: (value: number) => void | Promise<void>;
  [ApiEvents.Uptime]: (value: number) => void | Promise<void>;
  [ApiEvents.IPAddress]: (value: string) => void | Promise<void>;
  [ApiEvents.Log]: (message: string) => void | Promise<void>;
}

export type IAllEvents = IApiEvents & SwitchEvents & AlarmEvents;

export default ApiEvents;
