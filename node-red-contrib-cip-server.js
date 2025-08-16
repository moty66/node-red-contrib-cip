const { CIPServer, CIPOutputHelper } = require('./lib/node-cip');

module.exports = function (RED) {

  function dinamoCIPServer(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.log("starting node-red-contrib-cip-server");

    const options = {
      ipid: parseInt(config.ipid, 16),
      port: config.port || 41794,
      debug: config.debug === undefined ? false : true,
      timeout: config.timeout !== undefined ? parseInt(config.timeout) : 10000,
      type: "server"
    };

    const cipServer = new CIPServer(options);

    node.status({ fill: "yellow", shape: "ring", text: "Listening on port " + options.port });
    node.log("CIP server started on port " + options.port);
    node.log(JSON.stringify(config));
    node.log(JSON.stringify(options));

    node.on('close', function (done) {
      node.log("closing server");

      cipServer.removeListener('connect', _onConnect.bind(node));
      cipServer.removeListener('update', _onUpdate.bind(node));
      cipServer.removeListener('error', _onError.bind(node))
      cipServer.removeListener('event', _onEvent.bind(node));
      cipServer.disconnect();

      node.status({ fill: "orange", shape: "ring", text: "stopped" });
      done();
    });

    node.on('input', function (msg) {
      if (msg.payload && msg.payload.type) {
        // Send the local data 
        if (msg.payload.type == 'sync') {
          cipServer.sendUpdateRequest();
        }
        // CIPServer class methods call
        else if (cipServer[msg.payload.type]) {
          cipServer[msg.payload.type](msg.payload.data);
        }
        // CIP Events to send to connected clients
        else if ('event' === msg.payload.type && msg.payload.payload && msg.payload.payload.join) {
          if (msg.payload.payload.type === 'digital') {
            cipServer.sendDigital(msg.payload.payload.join, msg.payload.payload.data);
          }
          else if (msg.payload.payload.type === 'analog') {
            cipServer.sendAnalog(msg.payload.payload.join, msg.payload.payload.data);
          }
          else if (msg.payload.payload.type === 'serial') {
            cipServer.sendSerial(msg.payload.payload.join, msg.payload.payload.data || "");
          }
          else if (msg.payload.payload && 'pulse' === msg.payload.payload.type) {
            const pushEvent = {
              join: msg.payload.payload.join,
              data: true
            }
            const releaseEvent = {
              join: msg.payload.payload.join,
              data: false
            }

            cipServer.sendDigital(pushEvent.join, pushEvent.data);

            setTimeout(function () {
              cipServer.sendDigital(releaseEvent.join, releaseEvent.data);
            }, msg.payload.payload.time || msg.payload.payload.hold || msg.payload.payload.delay || msg.payload.payload.wait || 1);
          }
          else {
            node.warn('Unknown join type');
            console.log('Unknown join type', msg.payload.payload);
          }
        }
        // Smart Object digital commands with page calculation
        else if ('smartObjectDigital' === msg.payload.type && msg.payload.payload) {
          const { smartObjectId, join, data, page } = msg.payload.payload;

          let actualJoin = join;

          // If page is specified, calculate join using your Smart Object pattern:
          // Digital joins = 4000 + (page-1) × 10 + 10 + join
          if (page !== undefined) {
            actualJoin = 4000 + (page - 1) * 10 + 10 + join;
            node.log(`Smart Object ${smartObjectId}, Page ${page}, Join ${join} -> Actual Join ${actualJoin}`);
          }

          node.log(`Sending Smart Object Digital: SO=${smartObjectId}, Join=${actualJoin}, Data=${data}`);
          cipServer.sendSmartObjectDigital(smartObjectId, actualJoin, data);
        }
        // Smart Object analog commands with page calculation  
        else if ('smartObjectAnalog' === msg.payload.type && msg.payload.payload) {
          const { smartObjectId, join, data, page } = msg.payload.payload;

          let actualJoin = join;

          // For analog joins, if page calculation is needed (adjust pattern as needed)
          if (page !== undefined && join !== 1) {
            // Assuming similar pattern for analog (you may need to adjust)
            actualJoin = 5000 + (page - 1) * 10 + 10 + join;
            node.log(`Smart Object ${smartObjectId} Analog, Page ${page}, Join ${join} -> Actual Join ${actualJoin}`);
          }

          cipServer.sendSmartObjectAnalog(smartObjectId, actualJoin, data);
        }
        // Smart Object serial commands with page calculation
        else if ('smartObjectSerial' === msg.payload.type && msg.payload.payload) {
          const { smartObjectId, join, data, page } = msg.payload.payload;

          let actualJoin = join;

          // For serial joins (adjust pattern as needed)
          if (page !== undefined) {
            actualJoin = 6000 + (page - 1) * 10 + 10 + join;
            node.log(`Smart Object ${smartObjectId} Serial, Page ${page}, Join ${join} -> Actual Join ${actualJoin}`);
          }

          cipServer.sendSmartObjectSerial(smartObjectId, actualJoin, data);
        }
        else {
          node.warn("Unknown or incomplete payload", msg.payload);
          console.log("Payload details:", JSON.stringify(msg.payload, null, 2));
        }
      }
      else {
        node.warn("Please set the type key in the payload");
      }
    });

    cipServer.on('connect', _onConnect.bind(node));
    cipServer.on('update', _onUpdate.bind(node));
    cipServer.on('error', _onError.bind(node))
    cipServer.on('event', _onEvent.bind(node));

  }

  RED.nodes.registerType("node-red-contrib-cip-server", dinamoCIPServer);

  function _onConnect(data) {
    this.log("client connected to server");
    this.send([null, { connected: true, clientConnected: true }]);
    this.status({ fill: "green", shape: "ring", text: "client connected" });
  };

  function _onUpdate(data) {
    this.send([null, { connected: true, update: data }]);
  };

  function _onError(err) {
    this.error(err);
    this.send([null, { connected: false, error: err, }]);
    this.status({ fill: "red", shape: "ring", text: "server error" });
  };

  function _onEvent(payload) {
    this.status({ fill: "blue", shape: "ring", text: "receiving data.." });
    this.send({ payload });
    this.status({ fill: "green", shape: "ring", text: "client connected" });
  };
}