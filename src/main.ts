import { CalibrationTrialSet } from './calibration/CalibrationTrialSet';
import { GazeCoordinateSystem } from './calibration/GazeCoordinateSystem';

async function runCalibration(tracker: any) {
  const trialSet = new CalibrationTrialSet(1920, 1080);
  trialSet.generateDefaultPoints();
  try {
    for (let i = 0; i < trialSet.getPointCount(); i++) {
      const result = await trialSet.runTrial(tracker);
      console.log(`Calibration point ${i+1}:`);
      console.log(`- Target: (${result.targetX}, ${result.targetY})`);
      console.log(`- Accuracy: ${result.accuracy.toFixed(2)}px`);
      console.log(`- Precision: ${result.precision.toFixed(2)}px`);
    }
    const coordinateSystem = new GazeCoordinateSystem(1920, 1080);
    coordinateSystem.updateCalibrationMatrix(trialSet.getResults());
    
    // Export results
    const jsonData = trialSet.exportCalibrationData('json');
    const csvData = trialSet.exportCalibrationData('csv');
    
    console.log('\nCalibration Summary:');
    console.log(jsonData);
    
    // Save to file or send to server
    // ... file system operations ...
    
    return coordinateSystem;
  } catch (error) {
    console.error('Calibration failed:', error);
    throw error;
  }
} 