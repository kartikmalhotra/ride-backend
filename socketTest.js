// socketTest.js
const { io } = require("socket.io-client");

const SERVER_URL = "http://localhost:3000"; // your backend
const socket = io(SERVER_URL, {
    transports: ["websocket"], // ensures WebSocket (not polling)
});

socket.on("connect", () => {
    console.log("✅ Connected to backend with socket id:", socket.id);

    // Replace this with a valid ride_id from your DB
    socket.emit("driver:online", {
        ride_id: "0bb43d82-2873-4f5a-a459-3ff39935a75e",
        lat: 17.4425,
        lng: 78.3922,
    });

    console.log("📡 driver:online emitted!");
});

socket.on("connect_error", (err) => {
    console.error("❌ Connection error:", err.message);
});

socket.on("disconnect", () => {
    console.log("🔌 Disconnected from server");
});
