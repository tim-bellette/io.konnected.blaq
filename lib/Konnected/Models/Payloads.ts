'use strict';

/* eslint-disable camelcase */

import { GarageDoorOperations } from './GarageDoorOperations';
import { GarageDoorStates } from './GarageDoorStates';
import { LockStates } from './LockStates';
import { OnOff } from './OnOff';
import { SecurityProtocols } from './SecurityProtocols';

export interface BasePayload {
  /** ESPHOME object_id */
  id: string;

  /** Human readable string representation of the device state */
  state: string;
}

export interface OnOffStatePayload extends BasePayload {
  /** Binary state of the input (ON or OFF). ON means open or detected, and OFF means closed or not detected. */
  state: OnOff;
  /** Boolean representation of the input state (true means ON or OPEN) */
  value: boolean;
}

export interface GarageDoorStatePayload extends BasePayload {
  /** Binary state of the garage door */
  current_operation: GarageDoorOperations;

  /** Numerical representation of the current state (1 means open, 0 means closed) */
  value: number;

  /** Binary state of the garage door (OPEN or CLOSED) */
  state: GarageDoorStates;

  /** Cover position */
  position: number;
}

export interface GarageLightStatePayload extends BasePayload {
  /** Human readable string representation of the light state; OFF or ON */
  state: OnOff;
}

export interface GarageRemoteControlLockStatePayload extends BasePayload {
  /** Lock state expressed as a number. */
  value: number;

  /** Human readable string representation of the lock state; LOCKED, UNLOCKED or UNKNOWN */
  state: LockStates;
}

/**
 * Returns the state of the garage opener motion sensor (if equipped)
 */
export interface MotionSensorStatePayload extends OnOffStatePayload {
}

/**
 * Returns ON or true when the GDO blaQ is synced with the opener's rolling code, otherwise OFF or false
 */
export interface ProtocolSyncStatePayload extends OnOffStatePayload {
}

/**
 * Reports ON or true when there is an object blocking the obstruction sensor beam, otherwise OFF or false
 */
export interface ObstructionStatePayload extends OnOffStatePayload {
}

/**
 * Reports ON or true when the motor is running, otherwise OFF or false
 */
export interface GarageOpenerMotorStatePayload extends OnOffStatePayload {
}

/** Reports ON or true when the garage opener wall button is pressed, otherwise OFF or false */
export interface WallButtonStatePayload extends OnOffStatePayload {
}

/**
 * Reports an integer representing the cumulative number of openings or cycles of the garage motor in its lifetime.
 */
export interface GarageOpeningsPayload extends BasePayload {
  /** Number of openings or null if unknown */
  value: number | null;
  /** String representation of the number of openings or NA if unknown */
  state: string | 'NA';
}

export interface SecurityProtocolPayload extends BasePayload {
  /** The currently enabled Security+ protocol setting */
  value: SecurityProtocols;
  /** The currently enabled Security+ protocol setting */
  state: string;
}

/**
 * Used to pair new wireless remotes, the learn mode state can be read from the garage opener.
 */
export interface LearnModeStatePayload extends OnOffStatePayload {
}

/**
 * Signal strength of the Wi-Fi connection (RSSI) expressed in dBm
 */
export interface WifiSignalRssiPayload extends BasePayload {
  /** Human readable string representation of the RSSI with units */
  state: string;
  /** RSSI expressed as a negative integer */
  value: number;
}

/**
 * Signal strength of the Wi-Fi connection (RSSI) converted to a percentage
 */
export interface WifiSignalPercentPayload extends BasePayload {
  /** Signal strength expressed as a percentage value (0 - 100) */
  value: number;
  /** Human readable string representation of the signal strength percentage */
  state: string;
}

/**
 * Time elapsed since last boot of the device, in seconds.
 */
export interface UptimePayload extends BasePayload {
  /** Number of seconds since last boot */
  value: number;
  /** Human readable string representation of the seconds since boot, with units */
  state: string;
}

/**
 * Unique ID of the device. Also its MAC address.
 */
export interface DeviceIdPayload extends BasePayload {
  /** 12-character device ID */
  value: string;
  /** 12-character Device ID */
  state: string;
}

/**
 * The IP address of the device.
 */
export interface IPAddressPayload extends BasePayload {
  /** IPv4 address */
  value: string;
  /** IPv4 address */
  state: string;
}

export interface ToggleOnlyPayload extends OnOffStatePayload {
}

export interface PositionRequest {
  position: number;
}

export interface SecurityProtocolRequest {
  option: SecurityProtocols[keyof SecurityProtocols];
}

export interface Empty {
}
