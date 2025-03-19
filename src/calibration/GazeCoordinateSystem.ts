export class GazeCoordinateSystem {
  private calibrationMatrix: number[][] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  private screenDimensions: { width: number; height: number };

  constructor(screenWidth: number, screenHeight: number) {
    this.screenDimensions = { width: screenWidth, height: screenHeight };
  }

  updateCalibrationMatrix(results: { targetX: number; targetY: number; computedOffset: { x: number; y: number } }[]) {
    // Simple affine transformation implementation
    const pairs = results.map(r => ({
      src: [r.targetX, r.targetY, 1],
      dest: [r.targetX + r.computedOffset.x, r.targetY + r.computedOffset.y]
    }));

    // Using least squares approximation for matrix calculation
    const X: number[][] = [];
    const Y: number[][] = [];
    
    pairs.forEach(pair => {
      X.push(pair.src);
      Y.push([pair.dest[0], pair.dest[1]]);
    });

    // Matrix math implementation here (simplified)
    this.calibrationMatrix = this.matrixLeastSquares(X, Y);
  }

  transformGazePoint(x: number, y: number): { x: number; y: number } {
    const result = [
      this.calibrationMatrix[0][0] * x + this.calibrationMatrix[0][1] * y + this.calibrationMatrix[0][2],
      this.calibrationMatrix[1][0] * x + this.calibrationMatrix[1][1] * y + this.calibrationMatrix[1][2]
    ];
    
    return {
      x: Math.max(0, Math.min(this.screenDimensions.width, result[0])),
      y: Math.max(0, Math.min(this.screenDimensions.height, result[1]))
    };
  }

  private matrixLeastSquares(X: number[][], Y: number[][]): number[][] {
    // Simplified matrix pseudoinverse implementation
    const XT = this.transpose(X);
    const XTX = this.multiply(XT, X);
    const XTY = this.multiply(XT, Y);
    return this.multiply(this.inverse(XTX), XTY);
  }

  private multiply(A: number[][], B: number[][]): number[][] {
    if (A[0].length !== B.length) {
      throw new Error("Invalid matrix dimensions for multiplication");
    }

    const result: number[][] = [];
    for (let i = 0; i < A.length; i++) {
      result[i] = [];
      for (let j = 0; j < B[0].length; j++) {
        result[i][j] = 0;
        for (let k = 0; k < B.length; k++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }
    return result;
  }

  private inverse(matrix: number[][]): number[][] {
    // Simplified matrix inversion implementation
    const det = this.determinant(matrix);
    if (det === 0) {
      throw new Error("Matrix is singular and cannot be inverted");
    }
    const adjugate = this.adjugate(matrix);
    const scalar = 1 / det;
    const result: number[][] = [];
    for (let i = 0; i < adjugate.length; i++) {
      result[i] = [];
      for (let j = 0; j < adjugate[0].length; j++) {
        result[i][j] = adjugate[i][j] * scalar;
      }
    }
    return result;
  }

  private adjugate(matrix: number[][]): number[][] {
    // Simplified adjugate matrix calculation
    const rows = matrix.length;
    const cols = matrix[0].length;
    const adjugate: number[][] = [];
    for (let i = 0; i < rows; i++) {
      adjugate[i] = [];
      for (let j = 0; j < cols; j++) {
        adjugate[i][j] = this.cofactor(matrix, i, j);
      }
    }
    return adjugate;
  }

  private cofactor(matrix: number[][], i: number, j: number): number {
    const minor = this.minor(matrix, i, j);
    return (i + j) % 2 === 0 ? minor : -minor;
  }

  private minor(matrix: number[][], i: number, j: number): number {
    const submatrix = this.submatrix(matrix, i, j);
    return this.determinant(submatrix);
  }

  private determinant(matrix: number[][]): number {
    if (matrix.length !== matrix[0].length) {
      throw new Error("Matrix must be square for determinant calculation");
    }
    if (matrix.length === 1) {
      return matrix[0][0];
    }
    let det = 0;
    for (let i = 0; i < matrix.length; i++) {
      det += matrix[0][i] * this.cofactor(matrix, 0, i);
    }
    return det;
  }

  private submatrix(matrix: number[][], i: number, j: number): number[][] {
    return matrix.slice(0, i).map(row => row.filter((_, k) => k !== j));
  }

  private transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, i) => matrix.map(row => row[i]));
  }

  private invert(matrix: number[][]): number[][] {
    const det = this.determinant(matrix);
    if (det === 0) {
      throw new Error("Matrix is singular and cannot be inverted");
    }
    const adjugate = this.adjugate(matrix);
    const scalar = 1 / det;
    const result: number[][] = [];
    for (let i = 0; i < adjugate.length; i++) {
      result[i] = [];
      for (let j = 0; j < adjugate[0].length; j++) {
        result[i][j] = adjugate[i][j] * scalar;
      }
    }
    return result;
  }
}