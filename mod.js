import Game from "./lib/game.js";
import Twitter from "./lib/twitter.js";

const twitter = new Twitter();
const game = new Game(8, 13);

try {
    await game.readFile('data/save.json');
} catch (e) {
    // no save
}
game.update();
await game.writeFile('data/save.json');

twitter.tweet(game.draw());
