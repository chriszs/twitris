class Block {
  constructor(shape, position = [-1, 0], rotation = 0, fixed = false) {
    this.shape = shape;
    this.rotation = rotation;
    this.position = position;
    this.fixed = fixed;
  }
  translate() {
    let result = [];

    const rotation = Math.abs(this.rotation) % 4;

    if (rotation == 0) {
      result = this.shape.map((row, rowPos) =>
        row.map((cell, colPos) => [
          this.position[0] + rowPos,
          this.position[1] + colPos,
          cell
        ])
      );
    } else if (rotation == 1) {
      result = new Array(this.shape[0].length)
        .fill(null)
        .map(() => new Array(this.shape.length).fill(null));
      for (let colPos = this.shape[0].length - 1; colPos >= 0; colPos--) {
        for (let rowPos = 0; rowPos < this.shape.length; rowPos++) {
          result[colPos][rowPos] = [
            this.position[0] + colPos,
            this.position[1] + rowPos,
            [...this.shape].reverse()[rowPos][colPos]
          ];
        }
      }
    } else if (rotation == 2) {
      result = [...this.shape]
        .reverse()
        .map((row, rowPos) =>
          [...row]
            .reverse()
            .map((cell, colPos) => [
              this.position[0] + rowPos,
              this.position[1] + colPos,
              cell
            ])
        );
    } else if (rotation == 3) {
      result = new Array(this.shape[0].length)
        .fill(null)
        .map(() => new Array(this.shape.length).fill(null));
      for (let colPos = this.shape[0].length - 1; colPos >= 0; colPos--) {
        for (let rowPos = 0; rowPos < this.shape.length; rowPos++) {
          result[colPos][rowPos] = [
            this.position[0] + colPos,
            this.position[1] + rowPos,
            [...this.shape[rowPos]].reverse()[colPos]
          ];
        }
      }
    }

    return result;
  }
  draw() {
    return html`${this.translate()
      .map((row) => row.map(([y, x, cell]) => cell ?? background).join(""))
      .join(newline)}`;
  }
}

export default Block;
