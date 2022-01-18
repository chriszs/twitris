import fs from "fs/promises";

import { shuffle } from "d3-array";

import Block from "./block.js";
import Twitter from "./twitter.js";

import { uniq } from "./util.js";

const twitter = new Twitter();

const hour = new Date().getHours();

const dark = hour >= 23 || hour < 10;

const background = "⬛";
const lightBackground = "⬜";
const newline = "\n";
const shapes = [
  [
    ["🟦", null, null],
    ["🟦", "🟦", "🟦"],
  ],
  [
    ["🟥", "🟥", "🟥"],
    ["🟥", null, null],
  ],
  [
    ["🟨", "🟨"],
    ["🟨", "🟨"],
  ],
  [["🟧", "🟧", "🟧", "🟧"]],
  [
    ["🟪", "🟪", "🟪"],
    [null, "🟪", null],
  ],
  [
    ["🟩", "🟩", null],
    [null, "🟩", "🟩"],
  ],
  [
    [null, "🟫", "🟫"],
    ["🟫", "🟫", null],
  ],
];

class Game {
  constructor(width = 10, height = 18, interval = 500, paused = false) {
    this.interval = interval;
    this.paused = paused;
    this.width = width;
    this.height = height;
    this.start();
  }
  start() {
    this.blocks = [];
    this.rows = new Array(this.height)
      .fill(null)
      .map((row) => new Array(this.width).fill(background));
    this.addBlock();
  }
  addBlock() {
    const shape = shuffle([...shapes])[0];
    let block = new Block(shape);
    const coords = block.translate();
    const x = Math.floor(Math.random() * (this.width - coords[0].length));
    block.position = [-1, x];
    block.rotation = Math.floor(Math.random() * 4);
    if (!this.checkCollision(block)) {
      this.blocks.push(block);
    } else {
      this.start();
    }
  }
  shouldFix(block) {
    const rows = block.translate();

    if (rows.flat(1).some(([y, x, cell]) => y >= this.height - 1)) {
      return true;
    }

    return rows.some((row, rowPos) =>
      row.some(
        ([y, x, cell], colPos) =>
          cell &&
          (rowPos + 1 >= rows.length || rows[rowPos + 1][colPos][2] == null) &&
          this.withinBounds(y + 1, x) &&
          this.rows[y + 1][x] != background
      )
    );
  }
  withinBounds(y, x) {
    return y >= 0 && x >= 0 && y < this.height && x < this.width;
  }
  clearBlock(block) {
    block
      .translate()
      .flat(1)
      .filter(([y, x, cell]) => this.withinBounds(y, x) && cell)
      .forEach(([y, x, cell]) => (this.rows[y][x] = background));
  }
  drawBlock(block) {
    block
      .translate()
      .flat(1)
      .filter(([y, x, cell]) => this.withinBounds(y, x) && cell)
      .forEach(([y, x, cell]) => (this.rows[y][x] = cell));
  }
  checkCollision(block, y, x) {
    const rows = block.translate();

    return rows.some((row, rowPos) =>
      row
        .filter(
          (cell, colPos) =>
            cell[2] &&
            this.withinBounds(cell[0] + y, cell[1] + x) &&
            (rowPos + y >= rows.length ||
              rowPos + y < 0 ||
              colPos + x >= rows[0].length ||
              colPos + x < 0 ||
              rows[rowPos + y][colPos + x][2] == null)
        )
        .some((cell) => this.rows[cell[0] + y][cell[1] + x] != background)
    );
  }
  move(block, y = 0, x = 0) {
    if (!this.checkCollision(block, y, x)) {
      this.clearBlock(block);
      if (!block.fixed) {
        block.position[0] += y;
      }
      block.position[1] += x;
      this.drawBlock(block);
    }
  }
  rowsToClear(block) {
    return uniq(
      block
        .translate()
        .flat(1)
        .map(([y]) => y)
    )
      .filter((y) => y > 0 && y < this.height)
      .filter((y) => this.rows[y].every((cell) => cell != background));
  }
  clearRows(rows) {
    for (const row of rows) {
      for (let cur = row, above = row - 1; above >= 0; cur--, above--) {
        for (let i = 0; i < this.width; i++) {
          this.rows[cur][i] = this.rows[above][i];
        }
      }
    }
  }
  async update() {
    for (const block of this.blocks) {
      if (!block.fixed) {
        if (this.shouldFix(block)) {
          block.fixed = true;
        }

        this.move(block, 1);

        try {
          const replies = await twitter.getReplies(
            (
              await twitter.getLastTweet()
            ).id
          );

          const left = replies.filter(
            (tweet) =>
              tweet.text.toLowerCase().includes("left") ||
              tweet.text.includes("⬅️")
          ).length;
          const right = replies.filter(
            (tweet) =>
              tweet.text.toLowerCase().includes("right") ||
              tweet.text.includes("➡️")
          ).length;
          const spin = replies.filter(
            (tweet) =>
              tweet.text.toLowerCase().includes("spin") ||
              tweet.text.toLowerCase().includes("tilt") ||
              tweet.text.toLowerCase().includes("turn") ||
              tweet.text.toLowerCase().includes("flip") ||
              tweet.text.includes("⤴️") ||
              tweet.text.includes("↩️")
          ).length;
          const down = replies.filter(
            (tweet) =>
              tweet.text.toLowerCase().includes("down") ||
              tweet.text.toLowerCase().includes("drop") ||
              tweet.text.includes("⬇️")
          ).length;

          if (spin > 0 && spin > left && spin > right && spin > down) {
            console.log("spin left");
            this.tiltLeft();
          } else if (left > 0 && left > right && left > down) {
            console.log("go left");
            this.left();
          } else if (right > 0 && right > down) {
            console.log("go right");
            this.right();
          }
          else if (down > 0) {
            console.log("go down");
            this.down();
          }
        } catch (e) {
          console.log(e);
        }

        if (block.fixed) {
          if (block.position[0] <= 0) {
            this.start();
            return;
          }

          this.clearRows(this.rowsToClear(block));
        }
      }
    }

    if (this.blocks.map((block) => block.fixed).every((fixed) => fixed)) {
      this.addBlock();
    }
  }
  left() {
    let block = this.blocks[this.blocks.length - 1];
    if (block.position[1] > 0) {
      this.move(block, 0, -1);
    }
  }
  right() {
    let block = this.blocks[this.blocks.length - 1];
    if (
      Math.max(
        ...block
          .translate()
          .flat(1)
          .map(([_, x]) => x)
      ) <
      this.width - 1
    ) {
      this.move(block, 0, 1);
    }
  }
  down() {
    let block = this.blocks[this.blocks.length - 1];
    const rows = block.translate();
    for (let y = block.position[0] + rows.length; y <= this.height - 1; y++) {
      this.move(block, 1);
    }
  }
  tiltLeft() {
    for (const block of this.blocks) {
      if (!block.fixed) {
        this.clearBlock(block);
        block.rotation++;

        const rows = block.translate();

        if (block.position[0] + rows.length >= this.height) {
          block.position[0] = this.height - rows.length;
        }
        if (block.position[1] + rows[0].length >= this.width) {
          block.position[1] = this.width - rows[0].length;
        }

        this.drawBlock(block);
      }
    }
  }
  tiltRight() {
    for (const block of this.blocks) {
      if (!block.fixed) {
        this.clearBlock(block);
        block.rotation--;

        const rows = block.translate();

        if (block.position[0] + rows.length >= this.height) {
          block.position[0] = this.height - rows.length;
        }
        if (block.position[1] + rows[0].length >= this.width) {
          block.position[1] = this.width - rows[0].length;
        }

        console.log(block.rotation);

        this.drawBlock(block);
      }
    }
  }
  wait() {
    return new Promise((accept) =>
      setTimeout(() => requestAnimationFrame(accept), this.interval)
    );
  }
  draw() {
    return this.rows
      .map((row) => row.join(""))
      .join(newline)
      .replaceAll(background, dark ? background : lightBackground);
  }
  async *show() {
    while (!this.paused) {
      this.update();
      yield html`<center>${this.draw()}</center>`;
      await this.wait();
    }
  }
  toJSON() {
    return {
      blocks: this.blocks.map((block) => block.toJSON()),
      rows: this.rows,
    };
  }
  static fromJSON(json) {
    const game = new Game(json.rows[0].length, json.rows.length);
    game.blocks = json.blocks.map((block) => Block.fromJSON(block));
    game.rows = json.rows;
    return game;
  }
  static async readFile(file) {
    const json = await fs.readFile(file, "utf8");
    const data = JSON.parse(json);
    return Game.fromJSON(data);
  }
  async writeFile(file) {
    await fs.writeFile(file, JSON.stringify(this, null, 2));
  }
}

export default Game;
