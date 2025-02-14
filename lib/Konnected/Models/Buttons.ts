'use strict';

import { BlaqEndPoints, BlaqPostEndPoints } from './BlaqEndPoints';

export const enum Buttons {
  PlaySound = 'button-play_sound',
  PreCloseWarning = 'button-pre_close_warning',
  ReSync = 'button-re_sync',
  ResetDoorTimings = 'button-reset_door_timings',
  Restart = 'button-restart',
  FactoryReset = 'button-factory_reset',
}

export type ButtonMapping = {
  [key in Buttons]: keyof BlaqPostEndPoints;
}

export const ButtonMappings: ButtonMapping = {
  [Buttons.PlaySound]: BlaqEndPoints.PlaySoundPress,
  [Buttons.PreCloseWarning]: BlaqEndPoints.PreCloseWarningPress,
  [Buttons.ReSync]: BlaqEndPoints.ReSyncPress,
  [Buttons.ResetDoorTimings]: BlaqEndPoints.ResetDoorTimingsPress,
  [Buttons.Restart]: BlaqEndPoints.RestartPress,
  [Buttons.FactoryReset]: BlaqEndPoints.FactoryResetPress,
} as const;

export default Buttons;
