# node-red-contrib-cip

[![npm version](https://badge.fury.io/js/node-red-contrib-cip.svg)](https://badge.fury.io/js/node-red-contrib-cip)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node-RED](https://img.shields.io/badge/Node--RED-2.0+-red.svg)](https://nodered.org)
[![GitHub issues](https://img.shields.io/github/issues/moty66/node-red-contrib-cip)](https://github.com/moty66/node-red-contrib-cip/issues)

Professional Node-RED nodes for seamless integration with **Crestron control systems** through the **CIP (Crestron Internet Protocol)**. This package provides both client and server nodes, enabling bidirectional communication with Crestron processors.

> **🔬 Reverse-Engineered Protocol**: This implementation is based on comprehensive reverse-engineering of the proprietary Crestron Internet Protocol (CIP), achieved through extensive network traffic analysis, packet inspection, and protocol behavior study. The library provides a complete, independent implementation of the CIP protocol stack.

## ✨ Features

### 🔌 **Dual Node Architecture**

- **CIP Client Node**: Connect Node-RED to Crestron processors as a client
- **CIP Server Node**: Allow Crestron processors to connect to Node-RED as clients

### 📡 **Complete Protocol Support**

- **Digital Joins**: Boolean control (lights, relays, switches)
- **Analog Joins**: Numeric control (volume, dimming, position: 0-65535)
- **Serial Joins**: String communication (text, commands, feedback)
- **Smart Objects**: Advanced UI controls with intelligent state management
- **Pulse Commands**: Momentary button presses with configurable timing
- **Real-time Feedback**: Instant status updates from Crestron systems

### 🚀 **Enterprise Features**

- **Automatic Reconnection**: Robust connection management with configurable timeouts
- **Smart Object Support**: Advanced UI controls with dynamic lists, keypads, and button arrays
- **Heartbeat Monitoring**: Built-in ping/pong mechanism for connection health
- **Packet-level Debugging**: Comprehensive logging for troubleshooting
- **State Synchronization**: Full system state retrieval on connection
- **TypeScript Support**: Complete type definitions included

### 🔧 **Development Tools**

- **Docker Environment**: Pre-configured development setup
- **Debug Logging**: Detailed CIP protocol inspection

## 📦 Installation

### Via Node-RED Palette Manager

1. Open Node-RED in your browser
2. Go to **Menu → Manage Palette**
3. Click the **"Install"** tab
4. Search for `node-red-contrib-cip`
5. Click **"Install"**

### Via npm

```bash
cd ~/.node-red
npm install node-red-contrib-cip
```

### Via Docker (Development)

```bash
git clone https://github.com/moty66/node-red-contrib-cip.git
cd node-red-contrib-cip
docker-compose up --build
```

Access Node-RED at http://localhost:1880 with the plugin pre-installed.

## 🎯 Quick Start

### 1. CIP Client Setup (Node-RED → Crestron)

**Crestron Configuration:**

```simpl
// In your Crestron program, add an Ethernet device
ETHERNET_SERVER MyServer {
    DEVICE = "192.168.1.100:41794";  // Node-RED IP
    IPID = 04;
}
```

**Node-RED Configuration:**

```javascript
// Node configuration
{
  name: "Crestron Processor",
  host: "192.168.1.50",    // Crestron processor IP
  port: 41794,             // CIP port (default)
  ipid: "04",              // Must match Crestron IPID (hex)
  reconnect: true,
  timeout: 10000
}
```

### 2. CIP Server Setup (Crestron → Node-RED)

**Node-RED Configuration:**

```javascript
// Server node configuration
{
  name: "Crestron Server",
  port: 41794,             // Listening port
  ipid: "04",              // Server IPID (hex)
  debug: false,
  timeout: 10000
}
```

**Crestron Configuration:**

```simpl
// Configure Crestron to connect to Node-RED server
ETHERNET_CLIENT MyClient {
    DEVICE = "192.168.1.100:41794";  // Node-RED server IP:port
    IPID = 04;
}
```

## 💡 Usage Examples

### Digital Control (Lights, Relays)

```javascript
// Turn on light (Digital Join 1)
msg.payload = {
  type: "event",
  payload: {
    type: "digital",
    join: 1,
    data: true, // true = on, false = off
  },
};
```

### Analog Control (Volume, Dimming)

```javascript
// Set volume to 75% (Analog Join 5)
msg.payload = {
  type: "event",
  payload: {
    type: "analog",
    join: 5,
    data: 49152, // 75% of 65535
  },
};
```

### Serial Communication (Text, Commands)

```javascript
// Send text to display (Serial Join 10)
msg.payload = {
  type: "event",
  payload: {
    type: "serial",
    join: 10,
    data: "Conference Room Available",
  },
};
```

### Button Press Simulation

```javascript
// Simulate 500ms button press (Digital Join 3)
msg.payload = {
  type: "event",
  payload: {
    type: "pulse",
    join: 3,
    time: 500, // milliseconds
  },
};
```

### System Synchronization

```javascript
// Request current state of all joins
msg.payload = {
  type: "sync",
};
```

## 🎛️ Smart Objects

Smart Objects provide advanced UI control capabilities beyond basic joins, allowing for complex interface elements like dynamic lists, button arrays, and interactive controls. **Smart Objects are available with the CIP Server node.**

### Supported Smart Object Types

#### 📋 **Dynamic List**

Interactive lists with programmable content and selection handling.

```javascript
// Register a dynamic list
msg.payload = {
  type: "registerSmartObject",
  payload: {
    smartObjectId: 101,
    profile: "dynamicList",
    config: {
      maxItems: 20,
      allowMultipleSelection: false,
    },
  },
};

// Set list item count
msg.payload = {
  type: "smartObject",
  payload: {
    smartObjectId: 101,
    action: "setItemCount",
    itemCount: 5,
  },
};

// Set list item text
msg.payload = {
  type: "smartObject",
  payload: {
    smartObjectId: 101,
    action: "setItemText",
    itemIndex: 1,
    text: "Living Room",
  },
};

// Enable/disable list item
msg.payload = {
  type: "smartObject",
  payload: {
    smartObjectId: 101,
    action: "setItemEnabled",
    itemIndex: 1,
    enabled: true,
  },
};
```

#### 📄 **Page Reference**

Multi-page navigation controls with page switching and button management.

```javascript
// Register a page reference
msg.payload = {
  type: "registerSmartObject",
  payload: {
    smartObjectId: 102,
    profile: "pageReference",
    config: {
      totalPages: 5,
      showNavButtons: true,
    },
  },
};

// Select a page
msg.payload = {
  type: "smartObject",
  payload: {
    smartObjectId: 102,
    action: "selectPage",
    pageNumber: 3,
  },
};

// Enable/disable navigation button
msg.payload = {
  type: "smartObject",
  payload: {
    smartObjectId: 102,
    action: "setButtonEnabled",
    buttonNumber: 1,
    enabled: false,
  },
};
```

#### 🔘 **Button List**

Arrays of programmable buttons with individual text and state control.

```javascript
// Register a button list
msg.payload = {
  type: "registerSmartObject",
  payload: {
    smartObjectId: 103,
    profile: "buttonList",
    config: {
      buttonCount: 8,
      allowToggle: true,
    },
  },
};

// Set button text
msg.payload = {
  type: "smartObject",
  payload: {
    smartObjectId: 103,
    action: "setText",
    buttonIndex: 1,
    text: "Power",
  },
};

// Enable/disable button
msg.payload = {
  type: "smartObject",
  payload: {
    smartObjectId: 103,
    action: "setEnabled",
    buttonIndex: 1,
    enabled: true,
  },
};
```

#### 🔢 **Keypad**

Numeric input controls with display feedback and key simulation.

```javascript
// Register a keypad
msg.payload = {
  type: "registerSmartObject",
  payload: {
    smartObjectId: 104,
    profile: "keypad",
    config: {
      allowDecimal: true,
      maxValue: 999,
      minValue: 0,
    },
  },
};

// Send key press
msg.payload = {
  type: "smartObject",
  payload: {
    smartObjectId: 104,
    action: "sendKey",
    keyValue: "5",
  },
};

// Set display text
msg.payload = {
  type: "smartObject",
  payload: {
    smartObjectId: 104,
    action: "setDisplay",
    displayText: "125",
  },
};

// Enable/disable keypad
msg.payload = {
  type: "smartObject",
  payload: {
    smartObjectId: 104,
    action: "setEnabled",
    enabled: true,
  },
};
```

### Smart Object Events

Smart Objects generate specialized events that provide context about user interactions:

```javascript
// Smart Object event output
{
  "topic": "smartObject",
  "payload": {
    "type": "smartObject",
    "smartObjectId": 101,
    "join": 1,
    "data": {
      "action": "itemSelected",
      "itemIndex": 3,
      "itemText": "Kitchen",
      "currentPage": 1
    },
    "timestamp": "2025-08-16T10:30:00.000Z"
  }
}
```

### Advanced Smart Object Features

#### State Tracking

```javascript
// Get current page of a page reference
msg.payload = {
  type: "getSmartObjectState",
  payload: {
    smartObjectId: 102,
    property: "currentPage",
  },
};

// Get all registered Smart Objects
msg.payload = {
  type: "getRegisteredSmartObjects",
};
```

#### Batch Operations

```javascript
// Configure multiple items at once
msg.payload = {
  type: "smartObject",
  payload: {
    smartObjectId: 101,
    action: "batchSetItems",
    items: [
      { index: 1, text: "Zone 1", enabled: true },
      { index: 2, text: "Zone 2", enabled: true },
      { index: 3, text: "Zone 3", enabled: false },
    ],
  },
};
```

## 📊 Node Outputs

### Output 1: Join Events

Real-time events from Crestron processor:

```javascript
// Digital join feedback
{
  payload: {
    join: 1,
    data: true,
    type: "digital"
  }
}

// Analog join feedback
{
  payload: {
    join: 5,
    data: 32768,
    type: "analog"
  }
}

// Serial join feedback
{
  payload: {
    join: 10,
    data: "Status: Online",
    type: "serial"
  }
}

// Smart Object interaction
{
  payload: {
    join: 1,
    data: {
      smartObjectId: 101,
      action: "itemSelected",
      itemIndex: 3,
      itemText: "Kitchen",
      currentPage: 1
    },
    type: "smartObject"
  }
}
```

### Output 2: Connection Status

System events and connection status:

```javascript
// Connection established
{ connected: true }

// Connection lost
{ connected: false, error: "Connection timeout" }

// Update events
{ connected: true, update: { status: "ready" } }

// Server-specific: client connected
{ connected: true, clientConnected: true }
```

## 🎛️ Smart Object Configuration

Smart Objects require specific configuration in both Node-RED and Crestron Studio for proper operation.

### Crestron Studio Setup

1. **Add Smart Object to Your Project:**

   ```
   - In Crestron Studio, add desired Smart Objects to your project
   - Configure Smart Object IDs (typically 101-199)
   - Program SIMPL logic to handle Smart Object events
   ```

2. **Smart Object ID Mapping:**
   | Smart Object Type | Suggested ID Range | Purpose |
   |-------------------|-------------------|----------------------------|
   | Dynamic Lists | 101-110 | Room/Zone selection |
   | Page References | 111-120 | Multi-page navigation |
   | Button Lists | 121-130 | Function button arrays |
   | Keypads | 131-140 | Numeric input controls |

3. **SIMPL Programming Example:**
   ```
   // For Dynamic List Smart Object ID 101
   Smart_Object_101.Item_Clicked -> [Your logic here]
   Smart_Object_101.Current_Item_Text$ -> [Process selected item]
   ```

### Node-RED Configuration

Smart Objects must be registered before use:

```javascript
// Register Smart Objects on connection
msg.payload = [
  {
    type: "registerSmartObject",
    payload: {
      smartObjectId: 101,
      profile: "dynamicList",
      config: { maxItems: 20 },
    },
  },
  {
    type: "registerSmartObject",
    payload: {
      smartObjectId: 102,
      profile: "pageReference",
      config: { totalPages: 5 },
    },
  },
];
```

### Configuration Profiles

#### Dynamic List Profile

```javascript
{
  maxItems: 50,           // Maximum number of items
  allowMultipleSelection: false,  // Allow multi-select
  enableScrolling: true,  // Enable scrolling
  itemHeight: 30         // Item height in pixels
}
```

#### Page Reference Profile

```javascript
{
  totalPages: 10,        // Total number of pages
  showNavButtons: true,  // Show navigation buttons
  enableSwipeGestures: true,  // Enable swipe navigation
  loopPages: false       // Loop from last to first page
}
```

#### Button List Profile

```javascript
{
  buttonCount: 12,       // Number of buttons
  allowToggle: true,     // Allow toggle state
  buttonStyle: "raised", // "raised" or "flat"
  columns: 3            // Number of columns
}
```

#### Keypad Profile

```javascript
{
  allowDecimal: true,    // Allow decimal input
  maxValue: 9999,       // Maximum value
  minValue: 0,          // Minimum value
  maxDigits: 4,         // Maximum digits
  showDisplay: true     // Show numeric display
}
```

## 🔧 Configuration Options

| Parameter     | Description                   | Default    | Required     |
| ------------- | ----------------------------- | ---------- | ------------ |
| **name**      | Display name for the node     | "Crestron" | No           |
| **host**      | Crestron processor IP address | -          | Yes (Client) |
| **port**      | CIP protocol port             | 41794      | Yes          |
| **ipid**      | Hexadecimal IPID value        | "04"       | Yes          |
| **reconnect** | Enable automatic reconnection | true       | No           |
| **timeout**   | Connection timeout (ms)       | 10000      | No           |
| **debug**     | Enable packet-level debugging | false      | No           |

## 🛠️ Development

### Local Development Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/moty66/node-red-contrib-cip.git
   cd node-red-contrib-cip
   ```

2. **Start development environment:**

   ```bash
   docker-compose up --build
   ```

3. **Access Node-RED:**
   Open http://localhost:1880 in your browser

4. **Enable debug logging:**
   ```bash
   DEBUG=CIP* node-red
   ```

### Project Structure

```
node-red-contrib-cip/
├── lib/node-cip/                    # Core CIP protocol library
│   ├── cip.js                       # CIP client implementation
│   ├── cip-server.js               # CIP server implementation
│   ├── helpers/                    # Protocol helpers
│   │   ├── cip-input.helper.js     # Message parsing
│   │   └── cip-output.helper.js    # Message building
│   ├── constants/                  # Protocol constants
│   └── interfaces/                 # TypeScript interfaces
├── node-red-contrib-cip.js         # Client node implementation
├── node-red-contrib-cip.html       # Client node UI
├── node-red-contrib-cip-server.js  # Server node implementation
├── node-red-contrib-cip-server.html# Server node UI
├── docker-compose.yml              # Development environment
└── package.json                    # Package configuration
```

### Making Changes

```bash
# For code changes
docker-compose restart

# For package.json changes
docker-compose down && docker-compose up --build
```

## 🔍 Protocol Implementation Details

### Reverse Engineering Achievement

This library represents a complete **reverse-engineering** of Crestron's proprietary CIP protocol, accomplished through:

- **Network Traffic Analysis**: Deep packet inspection of Crestron-to-Crestron communications
- **Protocol State Mapping**: Understanding connection handshakes, authentication, and state management
- **Message Format Decoding**: Binary protocol structure analysis and documentation
- **Timing Behavior Study**: Heartbeat intervals, timeout handling, and reconnection logic
- **Join Type Implementation**: Digital, analog, serial, and unicode message formats

### Technical Specifications

| Feature              | Implementation                      |
| -------------------- | ----------------------------------- |
| **Protocol Version** | CIP (Crestron Internet Protocol)    |
| **Transport**        | TCP/IP                              |
| **Default Port**     | 41794                               |
| **Message Format**   | Binary protocol with custom headers |
| **Heartbeat**        | 5-10 second ping intervals          |
| **Authentication**   | IPID-based device identification    |
| **Join Types**       | Digital, Analog, Serial, Unicode    |
| **Reconnection**     | Configurable automatic retry logic  |

### Message Types Supported

- `0x00`: ACK
- `0x01`: Server Sign-on
- `0x02`: Connection Accepted
- `0x04`: Connection Refused
- `0x05`: Join Event
- `0x0a`: Client Sign-on
- `0x0d`: Ping
- `0x0e`: Pong
- `0x0f`: Who Is
- `0x12`: Unicode

## 🚨 Troubleshooting

### Common Issues

**1. Connection Refused**

```
Error: Connection refused by Crestron processor
```

**Solutions:**

- Verify IPID matches between Node-RED and Crestron program
- Check that the IPID exists in Crestron's IP table
- Ensure network connectivity (ping test)
- Verify port 41794 is not blocked by firewall

**2. No Response from Joins**

```
Joins not responding to commands
```

**Solutions:**

- Verify join numbers are correct (1-based indexing)
- Check Crestron program logic for join assignments
- Enable debug logging: `DEBUG=CIP* node-red`
- Confirm join types match (digital/analog/serial)

**3. Frequent Disconnections**

```
Connection drops repeatedly
```

**Solutions:**

- Increase timeout value in node configuration
- Check network stability and latency
- Verify Crestron processor is not overloaded
- Review debug logs for specific error patterns

### Debug Mode

Enable comprehensive debugging:

```bash
# Start Node-RED with debug logging
DEBUG=CIP* node-red

# Docker environment
docker-compose up  # DEBUG=* already configured
```

**Debug Output Example:**

```
CIP ## connecting. { host: '192.168.1.50', port: 41794, ipid: 4 }...
CIP ## connection opened
CIP <= ipid 4
CIP => accepted
CIP <= ping request n° 1
CIP => pong
CIP => digital 1: High
```

### Network Requirements

- **Connectivity**: Node-RED and Crestron processor must be on same network or routable
- **Firewall**: Port 41794 must be open for TCP connections
- **Latency**: Low-latency network recommended for real-time control
- **Bandwidth**: Minimal bandwidth required (~1-10 Kbps typical)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Reporting Issues

- Use GitHub Issues for bug reports
- Include debug logs when possible
- Specify Node-RED and Crestron firmware versions
- Provide network configuration details

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Crestron Electronics**: For creating innovative control systems that inspired this project
- **Node-RED Community**: For the excellent platform and development tools
- **Open Source Community**: For protocols, libraries, and inspiration

## 📞 Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/moty66/node-red-contrib-cip/issues)
- **NPM Package**: [node-red-contrib-cip](https://www.npmjs.com/package/node-red-contrib-cip)

---

**Built with ❤️ by [Motaz Abutihab](https://github.com/moty66)**

_Bringing Crestron control systems into the Node-RED ecosystem through innovative protocol reverse-engineering._
