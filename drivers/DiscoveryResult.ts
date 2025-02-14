'use strict';

/* eslint-disable camelcase */

import { DiscoveryResultMDNSSD } from 'homey';

export interface DiscoveryResult extends DiscoveryResultMDNSSD {
  id: string;
  lastSeen: Date;
  address: string;
  host: string;
  port: string;
  name: string;
  fullname: string;
  txt: {
    friendly_name: string;
    esphome_version: string;
    mac: string;
    platform: string;
    network: string;
    project_name: string;
    project_version: string;
    web_api: string;
  }
}

export default DiscoveryResult;
