'use strict';

export const enum Alarms {
  Motor = 'alarm-motor',
  MotionDetected = 'alarm-motion_detected',
  Synced = 'alarm-synced',
  ObstructionDetected = 'alarm-obstruction_detected',
  WallButtonPressed = 'alarm-wall_button',
}

export interface AlarmEventListener {
  (value: boolean): void | Promise<void>;
}

export type AlarmEvent = {
  [key in Alarms]: AlarmEventListener;
}

export interface AlarmEvents extends AlarmEvent {}

export default Alarms;
