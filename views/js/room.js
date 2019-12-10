
let socket;
let data;
let showGrid = true;

let gameCanvas;
let gameContext;

let state;
let player;
let ranking = [];
let gameModeState;

var wallImage = document.getElementById("wall");
var appleImage = document.getElementById("apple");

function renderGame() {
    
    if (!state || !player) {
        requestAnimationFrame(renderGame);
        return;
    }

    let x = Math.floor(gameCanvas.width / (2 * 25));
    let y = Math.floor(gameCanvas.height / (2 * 25));
  
    gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    gameContext.translate((x - player.x) * 25, (y - player.y) * 25);
    
    if (showGrid) {

        gameContext.strokeStyle = 'gray'
        
        for (let i = 0; i <= state.lines; i++) {
            gameContext.beginPath();
            gameContext.moveTo(0, i* 25);
            gameContext.lineTo(state.lines*25, i* 25);
            gameContext.stroke();
        }

        for (let j = 0; j <= state.columns; j++) {
            gameContext.beginPath();
            gameContext.moveTo(j* 25, 0);
            gameContext.lineTo(j* 25, state.columns*25);
            gameContext.stroke();
        }
    }

    gameContext.fillStyle = '#7dc23a'
    gameContext.fillRect(0, 0, state.lines * 25,  state.columns * 25);

    for (const wallId in state.walls) {

        let wall = state.walls[wallId];

        gameContext.drawImage(wallImage, wall.x * 25, wall.y * 25, 25, 25);
    }

    for (const fruitId in state.fruits) {
        
        const fruit = state.fruits[fruitId];
        
        gameContext.drawImage(appleImage, fruit.x * 25, fruit.y * 25, 25, 25);
    }    

    for (const playerId in state.players) {

        // Ignore the current player
        if (playerId === player.id) {
            continue;
        }

        const p = state.players[playerId];

        gameContext.fillStyle = '#000000';

        gameContext.fillRect(p.x * 25, p.y * 25, 25, 25);
    }

    gameContext.setTransform(1, 0, 0, 1, 0, 0);

    // Render current player
    gameContext.fillStyle = 'yellow';
    
    gameContext.fillRect(x * 25, y * 25, 25, 25);

    gameContext.fillStyle = 'black'
    gameContext.globalAlpha = 0.1
    gameContext.fillRect(gameCanvas.width-210, 10, 200, (ranking.length)*18);

    ranking.forEach((e, i) => {
        gameContext.fillStyle = 'Black'
        gameContext.globalAlpha = 1.0
        gameContext.textAlign = "left";
        gameContext.font = "12px Arial";
        gameContext.fillText(`#${(i+1)}   ${e.name} (${e.score} points)`, gameCanvas.width-205, 5+(i+1)*18); 
    });

    if (gameModeState && gameModeState.status === 2) {
        gameContext.fillStyle = 'Black'
        gameContext.globalAlpha = 1.0
        gameContext.textAlign = "left";
        gameContext.font = "12px Arial";
        gameContext.fillText(gameModeState.value, 18, 18); 
    }

    requestAnimationFrame(renderGame);
}

function handleKeyUp(roomId, keyPressed){

    let valid = [37, 38, 39, 40];

    if (!valid.includes(keyPressed)) {
        return;
    }

    if (!state || !player) {
        return;
    }

    socket.emit('player-move', roomId, keyPressed)
}

function resizeWindow(){
    
    console.log("Resizing window");

    var windowHeight = $(window).height();
    var offsetRoom = $(".room").offset();

    $(".room").find(".card-body").height(windowHeight - offsetRoom.top - 60);

    gameCanvas.width = $(".room").find(".card-body").width();
    gameCanvas.height = $(".room").find(".card-body").height();
}

function join(roomId, playerName, password){

    if (socket && socket.connected) {
        alert("It is already connected");
        return;
    }

    socket = io();

    socket.on('connect', () => {
        
        console.log('Connected')

        socket.emit('join-game', roomId, playerName, password);
    });

    socket.on('disconnect', () => {

        console.log('Disconnected');

        window.location.href = "/rooms";
    });

    socket.on('joined', (gameState, playerState) => {

        console.log('Joined');

        state = gameState;
        player = playerState;
        
        $("#modal-join").modal("hide");
    });

    socket.on('room-error', (reason) => {
        
        console.log('Receiving a room error')
        console.log(reason)
        alert(reason)
    });

    socket.on('player-state', (playerState) => {
        
        console.log('Receiving the player state')

        player = playerState;
    });

    socket.on('game-state', (gameState) => {
        
        console.log('Receiving the game state')
        
        state = gameState;

        ranking = Object.keys(state.players).map(e => ({
            name: state.players[e].name,
            score: state.players[e].score
        })).sort(function (a, b) {
            return (a.score > b.score) ? -1 : ((a.score < b.score)? 1 : 0);
        }).filter((e,i) => i < 10);
    });

    socket.on('game-mode-state', (state, value) => {
        
        console.log('Receiving the game mode state')

        gameModeState = state;

        console.log(state)
    });
}

$(function(){

    var roomId = window.location.pathname.replace("/room/", "");

    if (!roomId) {
        alert("The roomId is not valid");
        return;
    }

    console.log("Entering into the room");

    gameCanvas = document.getElementById('game-canvas');
    gameContext = gameCanvas.getContext('2d');

    resizeWindow();

    $(window).resize(function(){
        resizeWindow();
    });

    $("#modal-join").modal("show");

    $("#form-join").submit(function(event){
        event.preventDefault();

        var playerName = $(this).find("#playerName").val();
        var password = $(this).find("#password").val();
        
        join(roomId, playerName, password);

        return false;
    });


    $(document).keyup(function(event) {
        handleKeyUp(roomId, event.which)
    });

    requestAnimationFrame(renderGame)

    return ;
    
    

    

    socket.on('end-game', (player) => {
        
        console.log('End game')

        alert(`Winner: ${player.name}`);
    });

    socket.on('game-mode-changed', (gameModeStatus) => {
        
        console.log('Receiving the game mode updating')

        $(".game-mode .card-body").text(gameModeStatus);
    });

    

    

    socket.on('timer-changed', (timer) => {
        
        console.log('Receiving a timer updating')
        
        if (timer === 0) {
            $("#panel-info").text("");
        } else {
            $("#panel-info").text(`Starting in ${timer} seconds`);
        }
    });

   
});