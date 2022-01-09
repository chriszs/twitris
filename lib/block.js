import { shuffle } from "https://cdn.skypack.dev/d3-array";

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

export default Block;
