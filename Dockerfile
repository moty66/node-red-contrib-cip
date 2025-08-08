FROM nodered/node-red:latest

# Set working directory
WORKDIR /usr/src/node-red

USER root

# Install Node-RED CIP plugin
COPY . /plugin
RUN npm install /plugin --omit=dev

USER node-red
