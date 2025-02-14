'use strict';

import { BlaqEndPoints, BlaqPostEndPoints } from "./BlaqEndPoints";

export const enum Switches {
  RemoteLock = 'switch-remote_lock',
  Light = 'switch-light',
  ToggleOnly = 'switch-toggle_only',
  Learn = 'switch-learn',
}

export interface SwitchEventListener {
  (value: boolean): void | Promise<void>;
}

export type SwitchEvent = {
  [key in Switches]: SwitchEventListener;
}

export interface SwitchEvents extends SwitchEvent { }

export type SwitchMapping = {
  [key in Switches]: { on: keyof BlaqPostEndPoints, off: keyof BlaqPostEndPoints }
}

export const SwitchMappings: SwitchMapping = {
  [Switches.Light]: { on: BlaqEndPoints.GarageLightTurnOn, off: BlaqEndPoints.GarageLightTurnOff },
  [Switches.RemoteLock]: { on: BlaqEndPoints.LockLock, off: BlaqEndPoints.LockUnlock },
  [Switches.ToggleOnly]: { on: BlaqEndPoints.ToggleOnlyOn, off: BlaqEndPoints.ToggleOnlyOff },
  [Switches.Learn]: { on: BlaqEndPoints.LearnOn, off: BlaqEndPoints.LearnOff },
} as const;

export default Switches;
