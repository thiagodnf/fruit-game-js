const express = require("express");
const bodyParser = require("body-parser");
const server = require("http");
const socket = require("socket.io");
const QRCode = require("qrcode");

const RoomsHandler = require("./src/handlers/rooms-handler.js");
const SocketHandler = require("./src/handlers/socket-handler.js");
const logger = require("./src/utils/logger-utils");

const PORT = process.env.PORT || 3000;

const routes = express.Router();
const app = express();
const http = server.createServer(app);
const io = socket(http);
const roomsHandler = new RoomsHandler();
const socketHandler = new SocketHandler(io, roomsHandler);

/** Settings */

app.use(express.static("public"));
app.use(express.static(__dirname + "/views"));
app.use(bodyParser.urlencoded({ extended: false }));

/** Routes */

routes.get("/", async (req, res) => {

    const rooms = roomsHandler.getAllRooms();

    // const ipAddress = `http://${ip.address()}:${PORT}`;
    const ipAddress = `http://localhost:${PORT}`;

    const ipAddressAsQRCode = await QRCode.toDataURL(ipAddress);

    res.render("index.ejs", {
        rooms,
        ipAddress,
        ipAddressAsQRCode
    });
});

routes.get("/rooms/:roomId", (req, res) => {

    const roomId = req.params.roomId;

    const room = roomsHandler.getRoomById(roomId);

    if (!room) {
        res.redirect("/");
    }

    res.render("room.ejs", {
        room: room
    });
});

routes.post("/rooms/create", function (req, res) {

    const roomName = req.body.roomName;
    const roomTime = req.body.roomTime;

    const room = roomsHandler.create(roomName, roomTime);

    res.redirect(`/rooms/${room.id}`);
});

app.use("/", routes);

app.use((req, res) => {
    res.send("Page not found");
});

http.listen(PORT, () => {

    logger.info("Running on port: %d", PORT);

    io.on("connection", (socket) => {
        socketHandler.connect(socket);
    });
});
