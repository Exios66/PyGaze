import { CalibrationPoint, CalibrationResult } from './CalibrationPoint';

export class CalibrationTrialSet {
  getPointCount(): number {
    return this.points.length;
  }

  getResults(): CalibrationResult[] {
    return this.results;
  }

  private points: CalibrationPoint[] = [];
  private results: CalibrationResult[] = [];
  private currentTrialIndex = 0;

  constructor(
    public readonly screenWidth: number,
    public readonly screenHeight: number,
    public readonly sampleRate: number = 60
  ) {}

  addCalibrationPoint(point: CalibrationPoint) {
    this.points.push(point);
  }

  generateDefaultPoints(points: number = 9) {
    const gridSize = Math.sqrt(points);
    for (let i = 1; i <= gridSize; i++) {
      for (let j = 1; j <= gridSize; j++) {
        const x = (this.screenWidth * i) / (gridSize + 1);
        const y = (this.screenHeight * j) / (gridSize + 1);
        this.addCalibrationPoint(new CalibrationPoint(x, y));
      }
    }
  }

  async runTrial(tracker: any): Promise<CalibrationResult> {
    const point = this.points[this.currentTrialIndex];
    const samples: Array<{ x: number; y: number; timestamp: number }> = [];
    
    // Start eye tracking collection
    await tracker.startCalibration();
    
    // Visual point presentation logic
    return new Promise((resolve) => {
      setTimeout(async () => {
        // Stop collection and process results
        const rawData = await tracker.stopCalibration();
        samples.push(...rawData);
        
        const result = this.processSamples(point, samples);
        this.results.push(result);
        this.currentTrialIndex++;
        resolve(result);
      }, point.duration);
    });
  }

  private processSamples(point: CalibrationPoint, samples: CalibrationResult['gazeSamples']) {
    const meanX = samples.reduce((sum, s) => sum + s.x, 0) / samples.length;
    const meanY = samples.reduce((sum, s) => sum + s.y, 0) / samples.length;
    
    return {
      targetX: point.x,
      targetY: point.y,
      gazeSamples: samples,
      computedOffset: {
        x: meanX - point.x,
        y: meanY - point.y
      },
      accuracy: Math.sqrt(Math.pow(meanX - point.x, 2) + Math.pow(meanY - point.y, 2)),
      precision: Math.sqrt(
        samples.reduce((sum, s) => sum + Math.pow(s.x - meanX, 2) + Math.pow(s.y - meanY, 2), 0) / samples.length
      )
    };
  }

  exportCalibrationData(format: 'json' | 'csv' = 'json') {
    const summary = {
      screenResolution: `${this.screenWidth}x${this.screenHeight}`,
      sampleRate: this.sampleRate,
      calibrationPoints: this.points.length,
      averageAccuracy: this.results.reduce((sum, r) => sum + r.accuracy, 0) / this.results.length,
      averagePrecision: this.results.reduce((sum, r) => sum + r.precision, 0) / this.results.length,
      offsets: this.results.map(r => r.computedOffset)
    };

    if (format === 'csv') {
      return [
        'Parameter,Value',
        `Screen Resolution,${summary.screenResolution}`,
        `Sample Rate,${summary.sampleRate}`,
        `Calibration Points,${summary.calibrationPoints}`,
        `Average Accuracy,${summary.averageAccuracy.toFixed(2)}`,
        `Average Precision,${summary.averagePrecision.toFixed(2)}`,
        ...summary.offsets.map((o, i) => `Point ${i+1} Offset X,${o.x.toFixed(2)},Offset Y,${o.y.toFixed(2)}`)
      ].join('\n');
    }
    
    return JSON.stringify(summary, null, 2);
  }
} 