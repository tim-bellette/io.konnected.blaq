'use strict';

import { Payloads } from ".";

export enum BlaqEndPoints {
  GarageDoor = '/cover/garage_door',
  GarageDoorOpen = '/cover/garage_door/open',
  GarageDoorClose = '/cover/garage_door/close',
  GarageDoorStop = '/cover/garage_door/stop',
  GarageDoorToggle = '/cover/garage_door/toggle',
  GarageDoorSet = '/cover/garage_door/set',

  ToggleOnly = '/switch/toggle_only',
  ToggleOnlyOn = '/switch/toggle_only/turn_on',
  ToggleOnlyOff = '/switch/toggle_only/turn_off',

  GarageLight = '/light/garage_light',
  GarageLightTurnOn = '/light/garage_light/turn_on',
  GarageLightTurnOff = '/light/garage_light/turn_off',
  GarageLightToggle = '/light/garage_light/toggle',

  Lock = '/lock/lock',
  LockLock = '/lock/lock/lock',
  LockUnlock = '/lock/lock/unlock',

  MotionSensor = '/binary_sensor/motion',
  RollingCodeSynced = '/binary_sensor/synced',
  Obstruction = '/binary_sensor/obstruction',
  MotorRunning = '/binary_sensor/motor',
  WallButtonPressed = '/binary_sensor/wall_button',
  GarageOpenings = '/sensor/garage_openings',

  SecurityProtocol = '/select/security__protocol',
  SecurityProtocolSet = '/select/security__protocol/set',

  Learn = '/switch/learn',
  LearnOn = '/switch/learn/turn_on',
  LearnOff = '/switch/learn/turn_off',
  LearnToggle = '/switch/learn/toggle',

  WifiSignalRssi = '/sensor/wifi_signal_rssi',
  WifiSignalPercent = '/sensor/wifi_signal__',

  Uptime = '/sensor/uptime',
  DeviceId = '/text_sensor/device_id',
  IPAddress = '/text_sensor/ip_address',

  PreCloseWarningPress = '/button/pre-close_warning/press',
  PlaySoundPress = '/button/play_sound/press',
  RestartPress = '/button/restart/press',
  FactoryResetPress = '/button/factory_reset/press',
  ReSyncPress = '/button/re-sync/press',
  ResetDoorTimingsPress = '/button/reset_door_timings/press',
}

export interface BlaqGetEndpoints {
  [BlaqEndPoints.GarageDoor]: Payloads.GarageDoorStatePayload;
  [BlaqEndPoints.GarageLight]: Payloads.GarageLightStatePayload;
  [BlaqEndPoints.Lock]: Payloads.GarageRemoteControlLockStatePayload;
  [BlaqEndPoints.MotionSensor]: Payloads.MotionSensorStatePayload;
  [BlaqEndPoints.RollingCodeSynced]: Payloads.ProtocolSyncStatePayload;
  [BlaqEndPoints.Obstruction]: Payloads.ObstructionStatePayload;
  [BlaqEndPoints.MotorRunning]: Payloads.GarageOpenerMotorStatePayload;
  [BlaqEndPoints.WallButtonPressed]: Payloads.WallButtonStatePayload;
  [BlaqEndPoints.GarageOpenings]: Payloads.GarageOpeningsPayload;
  [BlaqEndPoints.SecurityProtocol]: Payloads.SecurityProtocolPayload;
  [BlaqEndPoints.Learn]: Payloads.LearnModeStatePayload;
  [BlaqEndPoints.WifiSignalRssi]: Payloads.WifiSignalRssiPayload;
  [BlaqEndPoints.WifiSignalPercent]: Payloads.WifiSignalPercentPayload;
  [BlaqEndPoints.Uptime]: Payloads.UptimePayload;
  [BlaqEndPoints.DeviceId]: Payloads.DeviceIdPayload;
  [BlaqEndPoints.IPAddress]: Payloads.IPAddressPayload;
  [BlaqEndPoints.ToggleOnly]: Payloads.ToggleOnlyPayload;
}

export interface BlaqPostEndPoints {
  [BlaqEndPoints.GarageDoorOpen]: Payloads.Empty;
  [BlaqEndPoints.GarageDoorClose]: Payloads.Empty;
  [BlaqEndPoints.GarageDoorStop]: Payloads.Empty;
  [BlaqEndPoints.GarageDoorToggle]: Payloads.Empty;
  [BlaqEndPoints.GarageDoorSet]: Payloads.PositionRequest;

  [BlaqEndPoints.ToggleOnlyOn]: Payloads.Empty;
  [BlaqEndPoints.ToggleOnlyOff]: Payloads.Empty;

  [BlaqEndPoints.GarageLightTurnOn]: Payloads.Empty;
  [BlaqEndPoints.GarageLightTurnOff]: Payloads.Empty;
  [BlaqEndPoints.GarageLightToggle]: Payloads.Empty;

  [BlaqEndPoints.LockLock]: Payloads.Empty;
  [BlaqEndPoints.LockUnlock]: Payloads.Empty;

  [BlaqEndPoints.SecurityProtocolSet]: Payloads.SecurityProtocolRequest;

  [BlaqEndPoints.LearnOn]: Payloads.Empty;
  [BlaqEndPoints.LearnOff]: Payloads.Empty;
  [BlaqEndPoints.LearnToggle]: Payloads.Empty;

  [BlaqEndPoints.PreCloseWarningPress]: Payloads.Empty;
  [BlaqEndPoints.PlaySoundPress]: Payloads.Empty;
  [BlaqEndPoints.RestartPress]: Payloads.Empty;
  [BlaqEndPoints.FactoryResetPress]: Payloads.Empty;
  [BlaqEndPoints.ReSyncPress]: Payloads.Empty;
  [BlaqEndPoints.ResetDoorTimingsPress]: Payloads.Empty;
}

export default BlaqEndPoints;
