
class MoveToRightAction {
    
    action(game, playerId){

        let player = game.state.players[playerId];
        
        if (player) {

            if (game.hasWall(player.x + 1, player.y)) {
                return;
            }

            if (player.x == game.state.columns - 1) {
                player.x = 0;
            } else {
                player.x += 1;
            }

            game.checkCollision(player);
            game.checkEndGame(player);
        }
    }
}

module.exports = MoveToRightAction;