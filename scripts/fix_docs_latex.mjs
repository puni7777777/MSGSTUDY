import fs from 'fs';

let code = fs.readFileSync('src/app/docs/page.js', 'utf8');

code = code.replace(/P_\{cr\}/g, 'P_cr');
code = code.replace(/\\text\{FOS\}/g, 'FOS');
code = code.replace(/\\min\(\\sigma_y\/\\sigma, P_\{cr\}\/\|P\|\)/g, 'min(σ_y / σ, P_cr / |P|)');
code = code.replace(/\\Delta L = \\frac\{FL\}\{EA\}/g, 'ΔL = F·L / (E·A)');
code = code.replace(/\{FOS\}/g, 'FOS');
code = code.replace(/\{cr\}/g, 'cr');
code = code.replace(/\{FL\}/g, 'FL');
code = code.replace(/\{EA\}/g, 'EA');

fs.writeFileSync('src/app/docs/page.js', code, 'utf8');
console.log('Fixed unescaped JSX braces in docs/page.js');
