
class MoveToUpAction {
    
    action(game, playerId){

        let player = game.state.players[playerId];
        
        if (player) {

            if (game.hasWall(player.x, player.y - 1)) {
                return;
            }

            if (player.y == 0) {
                player.y = game.state.lines - 1;
            } else {
                player.y -= 1;
            }

            game.checkCollision(player);
            game.checkEndGame(player);
        }
    }
}

module.exports = MoveToUpAction;