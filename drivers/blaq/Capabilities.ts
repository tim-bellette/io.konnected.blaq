'use strict';

export const Capabilities = {
  OnOff: 'onoff',
  Alarm: {
    NotSynced: 'alarm_generic.not_synced',
    MotorRunning: 'alarm_running.motor',
    Obstruction: 'alarm_generic.obstruction',
    Motion: 'alarm_motion',
    WallButton: 'alarm_contact.wall_button',
  },
  Light: {
    OnOff: 'onoff.light',
  },
  GarageDoor: {
    Closed: 'garagedoor_closed',
    Openings: 'garagedoor_openings',
    Position: 'windowcoverings_set',
    SecurityProtocol: 'gdo_security_protocol',
    ToggleOnly: 'onoff.toggle_only',
  },
  Measures: {
    WifiSignalStrength: 'measure_signal_strength',
  },
  Button: {
    PlaySound: 'button.play_sound',
    PreCloseWarning: 'button.pre_close_warning',
    ReSync: 'button.re_sync',
    ResetDoorTimings: 'button.reset_door_timings',
    Restart: 'button.restart',
    Learn: 'button.learn',
  },
  Remote: {
    Lock: 'locked.remote',
    Learn: 'onoff.learn',
  },
} as const;

export default Capabilities;
