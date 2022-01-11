import Game from "./lib/game.js";
import Twitter from "./lib/twitter.js";

const twitter = new Twitter();

const game = new Game(8, 13);

try {
  await game.readFile("data/save.json");
} catch (e) {
  // no save
}
game.update();

const replies = await twitter.getReplies((await twitter.getLastTweet()).id);

const left = replies.filter(
  (tweet) =>
    tweet.text.toLowerCase().includes("left") || tweet.text.includes("⬅️")
).length;
const right = replies.filter(
  (tweet) =>
    tweet.text.toLowerCase().includes("right") || tweet.text.includes("➡️")
).length;
const spin = replies.filter(
  (tweet) =>
    tweet.text.toLowerCase().includes("spin") ||
    tweet.text.toLowerCase().includes("tilt") ||
    tweet.text.toLowerCase().includes("turn") ||
    tweet.text.toLowerCase().includes("flip") ||
    tweet.text.includes("⤴️")
).length;

if (spin > 0 && spin > left && spin > right) {
  console.log("spin left");
  game.tiltLeft();
} else if (left > 0 && left > right) {
  console.log("go left");
  game.left();
} else if (right > 0) {
  console.log("go right");
  game.right();
}

await game.writeFile("data/save.json");

const status = game.draw();

console.log(status);

try {
  await twitter.tweet(status);
} catch (e) {
  console.log(e);
}
