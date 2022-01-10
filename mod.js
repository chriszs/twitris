import Game from "./lib/game.js";
import Twitter from "./lib/twitter.js";

const twitter = new Twitter();
const game = new Game(8, 13);

game.update();
twitter.tweet(game.draw());
