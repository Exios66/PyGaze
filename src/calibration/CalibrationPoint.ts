export interface CalibrationResult {
  targetX: number;
  targetY: number;
  gazeSamples: Array<{ x: number; y: number; timestamp: number }>;
  computedOffset: { x: number; y: number };
  accuracy: number;
  precision: number;
}

export class CalibrationPoint {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly duration: number = 2000,
    public readonly radius: number = 20
  ) {}

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.fill();
  }
} 