
class MoveToLeftAction {
    
    action(game, playerId){

        let player = game.state.players[playerId];
        
        if (player) {

            if (game.hasWall(player.x - 1, player.y)) {
                return;
            }
            
            if (player.x == 0) {
                player.x = game.state.columns - 1 ;
            } else {
                player.x -= 1;
            }

            game.checkCollision(player);
            game.checkEndGame(player);
        }
    }
}

module.exports = MoveToLeftAction;