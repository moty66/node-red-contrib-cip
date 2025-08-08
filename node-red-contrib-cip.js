var { CIP, CIPOutputHelper } = require('./lib/node-cip');

module.exports = function (RED) {

    function dinamoCIP(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.log("starting node-red-contrib-cip");

        var options = {
            ipid: parseInt(config.ipid, 16),
            host: config.host,
            port: config.port || 41794,
            debug: config.debug === undefined ? false : config.debug,
            reconnect: config.reconnect === undefined ? false : config.reconnect,
            timeout: config.timeout !== undefined ? parseInt(config.timeout) : 10000
        };

        var cip = new CIP();

        node.status({ fill: "black", shape: "ring", text: "Initializing ..." });
        node.log("conneting");
        node.log(JSON.stringify(config));
        node.log(JSON.stringify(options));

        node.on('close', function (done) {
            node.log("closing");

            cip.removeListener('connect', _onConnect.bind(node));
            cip.removeListener('update', _onUpdate.bind(node));
            cip.removeListener('error', _onError.bind(node))
            cip.removeListener('event', _onEvent.bind(node));
            cip.disconnect();

            node.status({ fill: "orange", shape: "ring", text: "stopped" });
            done();
        });

        node.on('input', function (msg) {
            if (msg.payload && msg.payload.type) {
                // Send the local data 
                if (msg.payload.type == 'sync') {
                    cip.sendUpdateRequest();
                }
                // CIP class methods call
                else if (cip[msg.payload.type]) {
                    cip[msg.payload.type](msg.payload.data);
                }
                // CIP Events
                else if ('event' === msg.payload.type && msg.payload.payload && msg.payload.payload.join) {
                    if (CIPOutputHelper[msg.payload.payload.type]) {
                        var packetBuilder = CIPOutputHelper[msg.payload.payload.type];;
                        var eventData = {
                            join: msg.payload.payload.join,
                            data: msg.payload.payload.data || false
                        }
                        cip.write(packetBuilder(eventData));
                    }
                    else if (msg.payload.payload && 'pulse' === msg.payload.payload.type) {

                        var pushEvent = {
                            join: msg.payload.payload.join,
                            data: 1
                        }
                        var releaseEVent = {
                            join: msg.payload.payload.join,
                            data: 0
                        }

                        cip.write(CIPOutputHelper.digital(pushEvent));

                        setTimeout(function () {
                            cip.write(CIPOutputHelper.digital(releaseEVent))
                        }, msg.payload.payload.time || msg.payload.payload.hold || msg.payload.payload.delay || msg.payload.payload.wait || 1);
                    }
                    else {
                        node.warn('Unknow join type');
                        console.log('Unknown join type', msg.payload.payload);
                    }
                }
                else {
                    node.warn("Unknow or incomplete payload", msg.payload);
                }
            }
            else {
                node.warn("Please set the type key in the payload");
            }
        });


        cip.connect(options);
        cip.on('connect', _onConnect.bind(node));
        cip.on('update', _onUpdate.bind(node));
        cip.on('error', _onError.bind(node))
        cip.on('event', _onEvent.bind(node));

    }

    RED.nodes.registerType("node-red-contrib-cip", dinamoCIP);

    function _onConnect(data) {
        this.log("connected");
        this.send([null, { conncted: true, }]);
        this.status({ fill: "green", shape: "ring", text: "connected" });
    };

    function _onUpdate(data) {
        this.send([null, { connected: true, update: data }]);
    };

    function _onError(err) {

        this.error(err);
        this.send([null, { connected: false, error: err, }]);
        this.status({ fill: "red", shape: "ring", text: "disconnected" });
    };

    function _onEvent(payload) {
        this.status({ fill: "blue", shape: "ring", text: "receiving data.." });
        this.send({ payload });
        this.status({ fill: "green", shape: "ring", text: "connected" });
    };
}
