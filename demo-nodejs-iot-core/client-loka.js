process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

var https = require("https");
var WebSocketClient = require("websocket").client;
var client = new WebSocketClient();

//Authentication Token
var token = "02bf6751-70c5-49ee-8234-ec291facc63a";

//Insert your device here
var deviceId = 8061455;

//Subscribe devices
var optionsget = {
    host: "core.loka.systems",
    port: 443,
    path: "/subscribe_terminal/" + deviceId,
    method: "GET",
    headers: { Authorization: "Bearer " + token }
};

// do the GET request
var reqGet = https.request(optionsget, function(res) {
    console.log("statusCode: ", res.statusCode);

    res.on("data", function(d) {
	console.info("GET result:\n");
	process.stdout.write(d);
	console.info("\n");
    });
});

reqGet.end();
reqGet.on("error", function(e) {
    console.error(e);
});

client.on("connectFailed", function(error) {
    console.log("Connect Error: " + error.toString());
});

client.on("connect", function(connection) {
    console.log("WebSocket Client Connected");

    connection.on("error", function(error) {
	console.log("Connection Error: " + error.toString());
    });

    connection.on("close", function() {
	console.log("echo-protocol Connection Closed");
    });

    connection.on("message", function(message) {
	console.log("message recieved");
	if (message.type === "utf8") {
	    console.log("Received: '" + message.utf8Data + "'");
	}
    });
});

client.connect(
    "wss://core.loka.systems/message",
    null,
    null,
    { Authorization: "Bearer " + token },
    null
);

//Unsubscribe device when terminating
process.on("SIGINT", function() {
    console.log("Unsubscribing device...");

    optionsget.path = "/unsubscribe_terminal/" + deviceId;
    var reqGet = https.request(optionsget, function(res) {
	console.log("End.");
	process.exit();
    });
    reqGet.end();
});
