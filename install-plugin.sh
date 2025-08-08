#!/bin/bash

echo "🔧 Installing your plugin into the running Node-RED container..."

# Install the plugin using npm directly in the container
docker exec -u node-red node-red-cip-dev sh -c "npm install /plugin"

# Restart Node-RED to load the plugin
echo "🔄 Restarting Node-RED to load the plugin..."
docker-compose restart

echo "✅ Done! Your plugin should now be available in Node-RED at http://localhost:1880"
echo "🎯 Look for 'node-red-contrib-cip' in the function category of the palette"
