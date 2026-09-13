// =====================================================
// HiveMQ Cloud Configuration
// =====================================================

const MQTT_HOST =
    "870b4660c9b74e878261c8343be956f9.s1.eu.hivemq.cloud";

const MQTT_PORT = 8884;

// IMPORTANT:
// For testing only. Do NOT expose a production password
// in browser JavaScript.
const MQTT_USERNAME = "esp32";
const MQTT_PASSWORD = "hackers game";

// =====================================================
// MQTT Topics
// =====================================================

const COMMAND_TOPIC =
    "devices/esp32_01/command";

const STATUS_TOPIC =
    "devices/esp32_01/status";

// =====================================================
// HTML Elements
// =====================================================

const connection = document.getElementById("connection");
const ledStatus = document.getElementById("ledStatus");
const ledIndicator = document.getElementById("ledIndicator");
const deviceStatus = document.getElementById("deviceStatus");
const onBtn = document.getElementById("onBtn");
const offBtn = document.getElementById("offBtn");
const messageBox = document.getElementById("message");

// =====================================================
// MQTT Client
// =====================================================

const clientId =
    "WebDashboard_" +
    Math.random().toString(16).substring(2, 10);

const mqttUrl =
    `wss://${MQTT_HOST}:${MQTT_PORT}/mqtt`;

console.log("Connecting to:", mqttUrl);

const client = mqtt.connect(mqttUrl, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    clientId: clientId,
    clean: true,
    reconnectPeriod: 3000,
    connectTimeout: 10000
});

// =====================================================
// MQTT Connected
// =====================================================

client.on("connect", () => {
    console.log("MQTT Connected!");

    connection.innerText = "● MQTT Connected";
    connection.className = "connection connected";

    deviceStatus.innerText = "CONNECTED";

    onBtn.disabled = false;
    offBtn.disabled = false;

    client.subscribe(STATUS_TOPIC, { qos: 1 }, (error) => {
        if (error) {
            console.error("Subscribe Error:", error);
            showMessage("Subscribe error");
            return;
        }

        console.log("Subscribed:", STATUS_TOPIC);
        showMessage("Connected to HiveMQ");
    });
});

// =====================================================
// MQTT Error
// =====================================================

client.on("error", (error) => {
    console.error("MQTT Error:", error);

    connection.innerText = "● MQTT Error";
    connection.className = "connection disconnected";
    showMessage("MQTT connection error");
});

// =====================================================
// MQTT Close
// =====================================================

client.on("close", () => {
    console.log("MQTT Disconnected");

    connection.innerText = "● MQTT Disconnected";
    connection.className = "connection disconnected";

    deviceStatus.innerText = "DISCONNECTED";

    onBtn.disabled = true;
    offBtn.disabled = true;
});

// =====================================================
// MQTT Reconnect
// =====================================================

client.on("reconnect", () => {
    console.log("Trying to reconnect...");

    connection.innerText = "● Reconnecting...";
    connection.className = "connection disconnected";
});

// =====================================================
// RECEIVE MESSAGE FROM ESP32
// =====================================================

client.on("message", (topic, message) => {
    const value = message.toString().trim().toUpperCase();

    console.log("Message received:", value);
    console.log("Topic:", topic);

    if (topic === STATUS_TOPIC) {
        updateLED(value);
    }
});

// =====================================================
// UPDATE LED STATUS
// =====================================================

function updateLED(value) {
    if (value === "ON") {
        ledStatus.innerText = "ON";
        ledIndicator.className = "led on";
    }
    else if (value === "OFF") {
        ledStatus.innerText = "OFF";
        ledIndicator.className = "led off";
    }
}

// =====================================================
// SEND ON COMMAND
// =====================================================

onBtn.addEventListener("click", () => {
    sendCommand("ON");
});

// =====================================================
// SEND OFF COMMAND
// =====================================================

offBtn.addEventListener("click", () => {
    sendCommand("OFF");
});

// =====================================================
// SEND MQTT COMMAND
// =====================================================

function sendCommand(command) {
    if (!client.connected) {
        alert("MQTT is not connected!");
        return;
    }

    client.publish(
        COMMAND_TOPIC,
        command,
        {
            qos: 1,
            retain: false
        },
        (error) => {
            if (error) {
                console.error("Publish Error:", error);
                showMessage("Publish error");
                return;
            }

            console.log("Command sent:", command);
            showMessage(`Command sent: ${command}`);
        }
    );
}

function showMessage(text) {
    if (messageBox) {
        messageBox.innerText = text;
    }
}
