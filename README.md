# blaQ Garage Door Opener for Homey

## Overview

This app seamlessly integrates your blaQ garage door opener into the Homey ecosystem. With this integration, you can effortlessly control your garage door, monitor its status in real-time, and automate its operation using Homey Flows. Using the Homey app, managing your garage door has never been easier.

All control is handled locally through the blaQ's Local WebAPI, ensuring fast and secure operation. Real-time updates are provided using event monitoring, allowing you to stay informed about the status of your garage door without delays.

**Note:** For this integration to function properly, you need to configure your blaQ device to enable the Local WebAPI, with or without a password.

## About the blaQ Garage Door Opener

The blaQ Garage Door Opener is a smart, Wi-Fi-enabled device designed to provide seamless remote control over your garage door. It serves as a reliable alternative to MyQ, offering full local control without reliance on cloud services. The device integrates easily with smart home ecosystems, providing real-time status monitoring and automation capabilities.

You can purchase the blaQ Garage Door Opener from [Konnected](https://konnected.io/products/smart-garage-door-opener-blaq-myq-alternative).

## Communication Between the App and the Device

The Homey app communicates with the blaQ Garage Door Opener using two key mechanisms:

1. **EventSource for Real-Time Updates:** The app establishes a persistent connection to the device's EventSource endpoint, allowing it to receive instant status updates whenever the garage door state changes.
2. **WebAPI Calls for Actions:** When you issue a command, such as opening or closing the garage door, the app makes a direct request to the device's Local WebAPI, ensuring fast and secure execution of actions.

This local-first approach ensures low latency, enhanced reliability, and full control without the need for external cloud services.

For more details, refer to the official API documentation at [Konnected API Docs](https://konnected.readme.io/reference/gdo-blaq-introduction).

