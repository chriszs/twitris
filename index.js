import {
  shuffle
} from "https://cdn.skypack.dev/d3-array";


const dark = false;
const background = dark ? "⬛" : "⬜";
const newline = "\n";

const uniq = (values) => [...new Set(values)];

class Block {
  static shapes = [
    [
      ["🟦", null, null],
      ["🟦", "🟦", "🟦"],
    ],
    [
      ["🟥", null, null],
      ["🟥", "🟥", "🟥"],
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
      ["🟫", "🟫", null],
      [null, "🟫", "🟫"],
    ],
  ];
  constructor(
    shape = shuffle(Block.shapes)[0],
    rotation = 0,
    position = [-1, 0],
    fixed = false
  ) {
    this.shape = shape;
    this.rotation = rotation;
    this.position = position;
    this.fixed = fixed;
  }
  translate() {
    let shape = [...this.shape];

    if (Math.abs(this.rotation) % 4 == 2 || Math.abs(this.rotation) % 4 == 3) {
      shape = shape.reverse();
    }
    if (Math.abs(this.rotation) % 4 == 1 || Math.abs(this.rotation) % 4 == 3) {
      shape = shape.map((row) => [...row].reverse());
    }

    return shape.map((row, rowPos) =>
      row.map((cell, colPos) => [
        this.position[0] + (Math.abs(this.rotation) % 4 == 1 ? colPos : rowPos),
        this.position[1] + (Math.abs(this.rotation) % 4 == 1 ? rowPos : colPos),
        cell,
      ])
    );
  }
}

class Game {
  constructor(width = 10, height = 18, interval = 500, paused = false) {
    this.interval = interval;
    this.paused = paused;
    this.width = width;
    this.height = height;
    this.start();
  }
  start() {
    this.blocks = [new Block()];
    this.rows = new Array(this.height)
      .fill(null)
      .map((row) => new Array(this.width).fill(background));
  }
  checkCollision(block) {
    const rows = block.translate();

    if (rows.flat(1).some(([y, x, cell]) => y >= this.height - 1)) {
      return true;
    }

    return rows.some((row, rowPos) =>
      row.some(
        ([y, x, cell], colPos) =>
          cell &&
          (rowPos + 1 >= rows.length || rows[rowPos + 1][colPos][2] == null) &&
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
  move(block, y = 0, x = 0) {
    this.clearBlock(block);
    block.position[0] += y;
    block.position[1] += x;
    this.drawBlock(block);
  }
  rowsToClear(block) {
    return uniq(
      block
        .translate()
        .flat(1)
        .map(([y]) => y)
    )
      .filter((y) => y > 0)
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
  update() {
    for (const block of this.blocks) {
      if (!block.fixed) {
        if (this.checkCollision(block)) {
          block.fixed = true;
          if (!this.withinBounds(block.position[0], block.position[1])) {
            this.start();
            return;
          }
          this.clearRows(this.rowsToClear(block));
          if (block.position[0] !== 0) {
            this.blocks.push(new Block());
          }
        } else {
          this.move(block, 1);
        }
      }
    }
  }
  left() {
    for (const block of this.blocks) {
      if (!block.fixed && block.position[1] > 0) {
        this.move(block, 0, -1);
      }
    }
  }
  right() {
    for (const block of this.blocks) {
      if (
        !block.fixed &&
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
  }
  tiltLeft() {
    for (const block of this.blocks) {
      if (!block.fixed) {
        this.clearBlock(block);
        block.rotation++;
        this.drawBlock(block);
      }
    }
  }
  tiltRight() {
    for (const block of this.blocks) {
      if (!block.fixed) {
        this.clearBlock(block);
        block.rotation--;
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
    return this.rows.map((row) => row.join("")).join(newline);
  }
}

const game = new Game(8, 13);
game.update();
console.log(game.draw());
