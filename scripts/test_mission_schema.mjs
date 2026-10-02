import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeMission, validateMission } from '../src/core/missions/missionSchema.js';
import { solveTrussFEA } from '../src/core/solvers/trussFea.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('--- Testing Universal Mission Schema & Normalizer ---');

// Test 1: Validate & Normalize Cantilever example
const cantileverPath = path.join(rootDir, 'src', 'content', 'missions', 'example_cantilever_truss.json');
const cantileverRaw = JSON.parse(fs.readFileSync(cantileverPath, 'utf8'));

const valCantilever = validateMission(cantileverRaw);
console.log('Cantilever Validation:', valCantilever);
if (!valCantilever.isValid) {
  console.error('Cantilever validation failed:', valCantilever.errors);
  process.exit(1);
}

const normCantilever = normalizeMission(cantileverRaw);
console.log(`Normalized Cantilever: ${normCantilever.title} (${normCantilever.initialNodes.length} nodes, ${normCantilever.initialMembers.length} members)`);

// Test FEA solve
const feaCantilever = solveTrussFEA(normCantilever.initialNodes, normCantilever.initialMembers, 1.0);
console.log(`Cantilever FEA Solve: isStable=${feaCantilever.isStable}, minFOS=${feaCantilever.minFactorOfSafety.toFixed(2)}, totalMass=${feaCantilever.totalMassKg.toFixed(1)}kg`);

if (!feaCantilever.isStable) {
  console.error('Cantilever structure solve failed: not stable!');
  process.exit(1);
}

// Test 2: Validate & Normalize Fink Roof example
const finkPath = path.join(rootDir, 'src', 'content', 'missions', 'example_fink_roof_truss.json');
const finkRaw = JSON.parse(fs.readFileSync(finkPath, 'utf8'));

const valFink = validateMission(finkRaw);
console.log('Fink Roof Validation:', valFink);
if (!valFink.isValid) {
  console.error('Fink roof validation failed:', valFink.errors);
  process.exit(1);
}

const normFink = normalizeMission(finkRaw);
console.log(`Normalized Fink Roof: ${normFink.title} (${normFink.initialNodes.length} nodes, ${normFink.initialMembers.length} members)`);

const feaFink = solveTrussFEA(normFink.initialNodes, normFink.initialMembers, 1.0);
console.log(`Fink Roof FEA Solve: isStable=${feaFink.isStable}, minFOS=${feaFink.minFactorOfSafety.toFixed(2)}, totalMass=${feaFink.totalMassKg.toFixed(1)}kg`);

if (!feaFink.isStable) {
  console.error('Fink roof structure solve failed: not stable!');
  process.exit(1);
}

console.log('✅ ALL UNIVERSAL MISSION SCHEMA & FEA SOLVER TESTS PASSED!');
