import Game from "./lib/game.js";
import twitter from "./lib/twitter.js";

const game = new Game(8, 13);

try {
  await game.readFile("data/save.json");
} catch (e) {
  // no save
}
game.update();
await game.writeFile("data/save.json");

const status = game.draw();

console.log(status);

try {
  await twitter.post("statuses/update", { status });
} catch (e) {
  console.log(e);
}
