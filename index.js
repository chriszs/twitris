import Game from "./lib/game.js";
import Twitter from "./lib/twitter.js";

const twitter = new Twitter();

let game = null;

try {
  game = await Game.readFile("data/save.json");
} catch (e) {
  let game = new Game(8, 13);
}

try {
  await game.update();

  await game.writeFile("data/save.json");
  
  const status = game.draw();
  
  console.log(status);
  
  await twitter.tweet(status);
} catch (e) {
  console.log(e);
}
