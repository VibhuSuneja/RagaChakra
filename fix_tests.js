const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'tests/tier1_feature_coverage.spec.js'),
  path.join(__dirname, 'tests/tier2_boundary_cases.spec.js'),
  path.join(__dirname, 'tests/tier3_cross_feature.spec.js'),
  path.join(__dirname, 'tests/tier4_real_world.spec.js')
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Fix strict mode violation in T1-F1-01
  content = content.replace(
    /await expect\(page\.locator\('#app-root, #root, body'\)\)\.toBeVisible\(\);/g,
    "await expect(page.locator('#root')).toBeVisible();"
  );

  // We need to move `await page.goto('/');` before `localStorage` operations.
  // There are two types: single line evaluate and multi line evaluate.
  // We can just find every occurrence of `await page.goto('/');` or similar 
  // and ensure evaluate happens after. Or, simpler:
  // Find `await page.evaluate` blocks followed by `await page.goto('/');`
  // and swap them.

  // Pattern 1:
  // await page.evaluate(() => localStorage.clear());
  // await page.goto('/');
  content = content.replace(
    /(await page\.evaluate\([^;]+;\n\s*)(await page\.goto\('[^']+'\);)/g,
    "$2\n    $1"
  );

  // Pattern 2 (Multi-line evaluate):
  // await page.evaluate(() => {
  //   localStorage.setItem(...);
  // });
  // await page.goto('/');
  content = content.replace(
    /(await page\.evaluate\(\(\) => {[\s\S]*?}\);\n\s*)(await page\.goto\('[^']+'\);)/g,
    "$2\n    $1"
  );
  
  // Pattern 3: same as 1 but no newline between?
  content = content.replace(
    /(await page\.evaluate\([^;]+;)\s*(await page\.goto\('[^']+'\);)/g,
    "$2\n    $1"
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file);
});
