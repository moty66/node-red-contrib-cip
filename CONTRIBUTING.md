# Contributing to node-red-contrib-cip

🎉 **Thank you for your interest in contributing to node-red-contrib-cip!**

This project brings Crestron control systems into the Node-RED ecosystem through reverse-engineered CIP protocol implementation. We welcome contributions from developers, Crestron programmers, Node-RED enthusiasts, and anyone passionate about automation and control systems.

## 🚀 Quick Start for Contributors

### Prerequisites

- **Node.js** (v12.0.0 or higher)
- **Docker & Docker Compose** (for development environment)
- **Git** (latest version)
- **Basic knowledge** of Node-RED, JavaScript/TypeScript
- **Optional**: Crestron programming experience

### Development Setup

1. **Fork and Clone**

   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/node-red-contrib-cip.git
   cd node-red-contrib-cip
   ```

2. **Start Development Environment**

   ```bash
   # Start Node-RED with the plugin pre-installed
   docker-compose up --build
   ```

3. **Access Development Environment**

   - **Node-RED**: http://localhost:1880
   - **CIP Server Port**: 41794 (exposed for testing)

4. **Enable Debug Logging**
   ```bash
   # The Docker environment includes DEBUG=* by default
   # For local development:
   DEBUG=CIP* node-red
   ```

## 🎯 Ways to Contribute

### 🐛 Bug Reports

**Before submitting a bug report:**

- Search [existing issues](https://github.com/moty66/node-red-contrib-cip/issues)
- Test with the latest version
- Reproduce the issue in a clean environment

**Bug Report Template:**

```markdown
## Bug Description

Clear description of the issue

## Environment

- Node-RED version:
- Plugin version:
- Crestron processor model:
- Operating System:

## Steps to Reproduce

1. Configure node with...
2. Send message...
3. Observe error...

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Debug Logs
```

[Include relevant debug output with DEBUG=CIP* enabled]

```

## Additional Context
Network setup, firewall settings, etc.
```

### ✨ Feature Requests

**Feature Request Template:**

```markdown
## Feature Description

Clear description of the proposed feature

## Use Case

Why is this feature needed? What problem does it solve?

## Proposed Implementation

If you have ideas about how to implement this

## Crestron Context

How does this relate to Crestron programming/protocol?

## Additional Context

Screenshots, mockups, references, etc.
```

### 🔧 Code Contributions

#### Types of Contributions Welcome

1. **Protocol Enhancements**

   - Smart Graphics support
   - Additional message types
   - Unicode string handling improvements
   - Performance optimizations

2. **Node-RED Integration**

   - UI/UX improvements
   - Configuration validation
   - Error handling enhancements
   - Status reporting improvements

3. **Development Tools**

   - Testing utilities
   - Documentation improvements
   - Build process enhancements
   - CI/CD improvements

4. **Documentation**
   - Code comments
   - Usage examples
   - Troubleshooting guides
   - Crestron integration guides

#### Development Workflow

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make Your Changes**

   - Follow the [Code Style Guidelines](#code-style)
   - Add/update tests if applicable
   - Update documentation as needed

3. **Test Your Changes**

   ```bash
   # Test the plugin installation
   npm install

   # Test in Docker environment
   docker-compose up --build

   # Manual testing with Crestron hardware (if available)
   ```

4. **Commit Your Changes**

   ```bash
   git add .
   git commit -m "feat: add smart graphics support"
   # or
   git commit -m "fix: resolve reconnection timeout issue"
   ```

5. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Code Style Guidelines

### JavaScript/TypeScript Style

```javascript
// Use const/let instead of var
const cipServer = new CIPServer(options);

// Use descriptive variable names
const joinNumber = msg.payload.join;
const eventData = msg.payload.data;

// Function documentation
/**
 * Sends a digital join command to the Crestron processor
 * @param {number} join - Join number (1-based)
 * @param {boolean} value - Digital state (true/false)
 * @returns {boolean} - Success status
 */
function sendDigital(join, value) {
  // Implementation
}

// Error handling
try {
  cipServer.sendDigital(join, value);
} catch (error) {
  node.error(`Failed to send digital join ${join}: ${error.message}`);
}
```

### Node-RED Node Conventions

```javascript
// Node structure
module.exports = function (RED) {
  function MyNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // Configuration validation
    if (!config.ipid) {
      node.error("IPID is required");
      return;
    }

    // Status updates
    node.status({ fill: "yellow", shape: "ring", text: "connecting..." });

    // Event handlers
    node.on("input", function (msg) {
      // Input handling
    });

    node.on("close", function (done) {
      // Cleanup
      done();
    });
  }

  RED.nodes.registerType("my-node", MyNode);
};
```

### Commit Message Format

We follow [Conventional Commits](https://conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(server): add smart graphics support
fix(client): resolve reconnection timeout issue
docs: update installation instructions
refactor(protocol): optimize message parsing
```

## 🧪 Testing Guidelines

### Manual Testing

1. **Basic Connectivity**

   ```bash
   # Test client connection to Crestron processor
   # Test server mode with Crestron as client
   ```

2. **Join Types Testing**

   ```javascript
   // Test digital joins
   msg.payload = {
     type: "event",
     payload: { type: "digital", join: 1, data: true },
   };

   // Test analog joins
   msg.payload = {
     type: "event",
     payload: { type: "analog", join: 1, data: 32768 },
   };

   // Test serial joins
   msg.payload = {
     type: "event",
     payload: { type: "serial", join: 1, data: "test" },
   };
   ```

3. **Error Scenarios**
   - Network disconnection
   - Invalid IPID
   - Malformed messages
   - Crestron processor restart

### Debug Testing

```bash
# Enable full debugging
DEBUG=CIP* node-red

# Test specific scenarios and capture logs
```

## 🏗️ Project Architecture

### Core Components

```
lib/node-cip/
├── cip.js                 # CIP client implementation
├── cip-server.js         # CIP server implementation
├── helpers/
│   ├── cip-input.helper.js   # Message parsing
│   └── cip-output.helper.js  # Message building
├── constants/
│   ├── cip-message-types.js  # Protocol message types
│   └── cip-join-types.js     # Join type constants
└── interfaces/           # TypeScript definitions
```

### Protocol Implementation

The CIP protocol reverse-engineering is based on:

- **Binary message format** with custom headers
- **IPID-based authentication** for device identification
- **Heartbeat mechanism** using ping/pong messages
- **Join-based communication** for digital/analog/serial data

## 🚨 Important Notes

### Protocol Reverse Engineering

This project is based on **reverse-engineering** of Crestron's proprietary CIP protocol:

- All protocol knowledge was obtained through **legal network traffic analysis**
- **No proprietary Crestron code** was used or referenced
- Implementation is **independent and clean-room**
- Respects **intellectual property rights**

### Testing with Crestron Hardware

- **Use development/test processors** only
- **Never test on production systems**
- **Backup Crestron programs** before testing
- **Understand that this is unofficial integration**

### Legal Considerations

- This is an **independent implementation**
- **Not endorsed by Crestron Electronics**
- Use at your own risk in production environments
- Respect Crestron's intellectual property rights

## 📋 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Commit messages follow conventional format
- [ ] Changes are tested manually
- [ ] Documentation is updated if needed
- [ ] No breaking changes (or clearly documented)

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Manual testing completed
- [ ] Debug logging verified
- [ ] Tested with Crestron hardware (if applicable)

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Commit messages follow convention
```

### Review Process

1. **Automated Checks** (when CI is configured)
2. **Code Review** by maintainers
3. **Testing** with development setup
4. **Approval** and merge

## 🏷️ Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] Version bump in package.json
- [ ] CHANGELOG.md updated
- [ ] README.md updated if needed
- [ ] npm publish
- [ ] GitHub release with notes

## 🤝 Community Guidelines

### Code of Conduct

- **Be respectful** and inclusive
- **Be constructive** in feedback
- **Be patient** with new contributors
- **Focus on the code**, not the person

### Getting Help

- **GitHub Issues**: Technical problems and bugs
- **GitHub Discussions**: General questions and ideas
- **Discord/Slack**: Real-time chat (when available)

### Recognition

Contributors are recognized in:

- GitHub contributors list
- CHANGELOG.md mentions
- Release notes
- README.md acknowledgments

## 📞 Contact

- **Project Maintainer**: [Motaz Abutihab](https://github.com/moty66)
- **GitHub Issues**: [Report issues](https://github.com/moty66/node-red-contrib-cip/issues)
- **Email**: (Available in GitHub profile)

---

**Thank you for contributing to node-red-contrib-cip! 🚀**

_Together, we're bringing Crestron control systems into the modern IoT ecosystem._
