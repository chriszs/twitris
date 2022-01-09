import Game from "./lib/game.js";

const game = new Game(8, 13);
game.update();
console.log(game.draw());
