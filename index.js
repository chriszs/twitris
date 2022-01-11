import Game from "./lib/game.js";
import Twitter from "./lib/twitter.js";

const twitter = new Twitter();

const game = new Game(8, 13);

try {
  await game.readFile("data/save.json");
} catch (e) {
  // no save
}
await game.update();

await game.writeFile("data/save.json");

const status = game.draw();

console.log(status);

try {
  await twitter.tweet(status);
} catch (e) {
  console.log(e);
}
