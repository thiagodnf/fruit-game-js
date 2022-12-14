
let gameCanvas;
let gameContext;
let socket;
let playerName;
let showGrid = false;

let game = null;
let player = null;

let $ranking = null;
let $countDown = null;
let $btnStart = null;
let $winnersModal = null;

let audioFruitOne = null;
let audioFruitThree = null;
let audioFruitFive = null;
let audioEndGame = null;

let imageBanana = null;
let imageApple = null;
let imageGrape = null;

function renderGame() {

    if (!game) {
        requestAnimationFrame(renderGame);
        return;
    }

    gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    gameContext.fillStyle = "#5DC800";
    gameContext.fillRect(0, 0, canvas.width, canvas.height);



    if (showGrid) {

        gameContext.strokeStyle = "gray";

        for (let i = 0; i <= game.lines; i++) {
            gameContext.beginPath();
            gameContext.moveTo(0, i * 20);
            gameContext.lineTo(game.columns * game.size, i * game.size);
            gameContext.stroke();
        }

        for (let j = 0; j <= game.columns; j++) {
            gameContext.beginPath();
            gameContext.moveTo(j * game.size, 0);
            gameContext.lineTo(j * game.size, game.lines * game.size);
            gameContext.stroke();
        }
    }

    gameContext.fillStyle = "Chartreuse";

    for (var playerId in game.players) {

        const p = game.players[playerId];

        // Ignore the current player
        if (playerId !== player.id) {
            gameContext.fillRect(p.x * game.size, p.y * game.size, game.size, game.size);
        }
    };

    game.fruits.forEach((fruit) => {

        let image = imageBanana;

        if (fruit.points === 1) {
            image = imageBanana;
        } else if (fruit.points === 3) {
            image = imageApple;
        } else if (fruit.points === 5) {
            image = imageGrape;
        } else {
            image = imageBanana;
        }

        gameContext.drawImage(image, fruit.x * game.size, fruit.y * game.size, game.size, game.size);
    });



    if (player) {
        gameContext.fillStyle = "#000000";
        gameContext.fillRect(player.x * game.size, player.y * game.size, game.size, game.size);
    }

    requestAnimationFrame(renderGame);
}

function handleKeys(roomId, keyPressed) {

    let valid = [37, 38, 39, 40];

    if (!valid.includes(keyPressed)) {
        return;
    }

    socket.emit("player-move", roomId, player.id, keyPressed);
}

function join(roomId, playerName) {

    if (!socket) {
        socket = io();
    }

    socket.on("connect", () => {

        console.log("Connected with Socket Id:", socket.id);

        socket.emit("join-game", roomId, playerName);
    });

    socket.on("disconnect", () => {

        console.log("Disconnected");
    });

    socket.on("room-error", (reason) => {

        console.log("Receiving a room error", reason);

        bootbox.alert({
            title: "Oops...",
            message: reason,
            animate:  false,
            callback : function(){
                window.location.href = "/";
            }
        });
    });

    socket.on("player-joined", (response) => {

        console.log("Player Joined:", response.player);

        game = response.game;
        player = response.player;

        $("#newPlayerModal").modal("hide");
    });

    socket.on("eaten-fruit-update", (response) => {

        console.log(response);

        if (response.player.id == player.id) {

            if (response.fruit.points == 1) {
                audioFruitOne.play();
            } else if (response.fruit.points == 3) {
                audioFruitThree.play();
            } else if (response.fruit.points == 5) {
                audioFruitFive.play();
            }
        }
    });

    socket.on("game-update", (response) => {

        game = response.game;

        if (game.adminId == player.id) {
            $btnStart.show();
        } else {
            $btnStart.hide();
        }

        updateRanking();
    });

    socket.on("player-update", (response) => {

        player = response.player;
    });

    socket.on("countdown-change", (response) => {

        const remainingSeconds = response.remainingSeconds;

        const date = new Date(remainingSeconds * 1000);
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const seconds = date.getSeconds();

        const timeString = hours.toString().padStart(2, "0") + ":" +
            minutes.toString().padStart(2, "0") + ":" +
            seconds.toString().padStart(2, "0");

        $countDown.text(timeString);
    });

    socket.on("end-game", (response) => {

        game = response.game;

        $btnStart.prop("disabled", false);

        let firstStep;
        let secondStep;
        let thirdStep;

        if (response.ranking[0]) {
            firstStep = response.ranking[0].name;
        }

        if (response.ranking[1]) {
            secondStep = response.ranking[1].name;
        }

        if (response.ranking[2]) {
            thirdStep = response.ranking[2].name;
        }

        $winnersModal.find(".first-step-name")[0].textContent = firstStep || "";
        $winnersModal.find(".second-step-name")[0].textContent = secondStep || "";
        $winnersModal.find(".third-step-name")[0].textContent = thirdStep || "";

        $winnersModal.modal("show");

        audioEndGame.play();
    });
}

function updateRanking() {

    const ranking = Object.keys(game.players).map(e => ({
        id: game.players[e].id,
        name: game.players[e].name,
        score: game.players[e].score
    })).sort(function (a, b) {
        return (a.score > b.score) ? -1 : ((a.score < b.score) ? 1 : 0);
    });

    $ranking.children().remove();

    ranking.forEach((p, i) => {

        $ranking.append(`
            <li class="list-group-item d-flex justify-content-between align-items-center pt-1 pb-1">
                <span class="${p.id === player.id ? "font-weight-bold" : ""}">
                    #${i + 1} ${p.name}
                </span>
                <span class="badge badge-primary badge-pill">${p.score}</span>
            </li>
        `);
    });
}

function start() {
    socket.emit("start-game", roomId);

    $btnStart.prop("disabled", true);
}

$(function () {

    console.log("RoomId:", roomId);

    gameCanvas = document.getElementById("canvas");
    gameContext = gameCanvas.getContext("2d");

    audioFruitOne = new Howl({
        src: ["/audio/fruit-1.wav"]
    });

    audioFruitThree = new Howl({
        src: ["/audio/fruit-3.wav"]
    });

    audioFruitFive = new Howl({
        src: ["/audio/fruit-5.wav"]
    });

    audioEndGame = new Howl({
        src: ["/audio/end-game.wav"]
    });

    $ranking = $("#ranking");
    $countDown = $("#count-down");
    $btnStart = $("#btn-start");
    $winnersModal = $("#winners-modal");

    imageBanana = document.getElementById("banana");
    imageApple = document.getElementById("apple");
    imageGrape = document.getElementById("grape");

    $(document).keyup(function (event) {
        handleKeys(roomId, event.which);
    });

    $("#form-new-player").submit(function (event) {

        event.preventDefault();

        if ($(this).valid()) {

            var playerName = $(this).find("#playerName").val().trim();

            join(roomId, playerName);
        }

        return false;
    });

    $btnStart.hide();

    $btnStart.on("click", function () {
        start();
    });

    requestAnimationFrame(renderGame);

    $("#newPlayerModal").modal("show");
});
