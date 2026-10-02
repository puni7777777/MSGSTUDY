import fs from 'fs';

const lines = fs.readFileSync('src/app/docs/page.js', 'utf8').split('\n');
lines.forEach((line, idx) => {
  // Check for {something} that isn't JSX expression syntax or in backticks
  const matches = line.match(/\{([a-zA-Z0-9_]+)\}/g);
  if (matches) {
    console.log(idx + 1, matches, line.trim());
  }
});
