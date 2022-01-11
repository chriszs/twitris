# twitris

A bot that lets [Twitter play Tetris](http://twitter.com/twitrisbot). [Faster version](https://observablehq.com/@chriszs/emojitris) on Observable.

Runs a GitHub Action to tweet on an interval. Reads and saves game state to the `save` branch.

To run locally:

```sh
export TWITTER_CONSUMER_KEY=xxxx
export TWITTER_CONSUMER_SECRET=xxxx
export TWITTER_ACCESS_TOKEN_KEY=xxxx
export TWITTER_ACCESS_TOKEN_SECRET=xxxx
npm i
node index.js
```