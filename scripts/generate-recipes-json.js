const fs = require('fs');
const path = require('path');

const TMP_DIR = path.join(__dirname, '../tmp');
const OUTPUT_FILE = path.join(__dirname, '../recipes-import.json');

const CATEGORY_MAP = {
  'Ciasta i słodyczne': 'Ciasta i słodycze',
  'Dania główne': 'Dania główne',
  Imprezy: 'Imprezy',
  Inne: 'Inne',
  'Rice Cakes': 'Rice Cakes',
  Sałatki: 'Sałatki',
  'Śniadania i kolacje': 'Śniadania i kolacje',
  Warzywa: 'Warzywa',
  Zupy: 'Zupy',
};

function getRatingFromFilename(filename) {
  if (filename.includes('❌')) return 'fatalne';
  if (filename.includes('➖')) return 'średnie';
  if (filename.includes('⭐️⭐️⭐️') || filename.includes('⭐️⭐️')) return 'wyśmienite';
  if (filename.includes('⭐️')) return 'dobre';
  return undefined; // Not cooked yet
}

function cleanTitle(filename) {
  let title = filename.replace('.md', '');
  title = title.replace(/❌|➖|⭐️/g, '').trim();
  return title;
}

function parseRecipeFile(filePath, category) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);

  const title = cleanTitle(filename);
  const rating = getRatingFromFilename(filename);

  let sourceUrl = undefined;
  const linkMatch = content.match(/\[Link\]\((.*?)\)/i);
  if (linkMatch) {
    sourceUrl = linkMatch[1];
  }

  // Very basic parsing for ingredients and instructions
  let ingredients = '';
  let instructions = '';

  const parts = content.split(/###\s*SKŁADNIKI/i);
  let prefixNotes = '';

  if (parts.length > 1) {
    prefixNotes = parts[0]
      .replace(/\[Link\]\(.*?\)/i, '')
      .replace(/####\s*Uwagi/i, 'Uwagi:')
      .trim();

    const rest = parts[1];
    const instructionParts = rest.split(/###\s*PRZYGOTOWANIE/i);

    ingredients = instructionParts[0].trim();
    if (instructionParts.length > 1) {
      instructions = instructionParts[1].replace(/#[\węóąśłżźćń]+/g, '').trim(); // Remove hashtags at the end
    }
  } else {
    // Fallback if structure is different
    instructions = content.replace(/\[Link\]\(.*?\)/i, '').trim();
  }

  if (prefixNotes) {
    instructions = prefixNotes + '\n\n' + instructions;
  }

  return {
    title,
    category,
    rating,
    sourceUrl,
    ingredients,
    instructions,
    createdAt: new Date().toISOString(),
  };
}

function readAllRecipes(dir, currentCategory = 'Inne') {
  let recipes = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Map directory name to allowed category if possible
      const mappedCategory = CATEGORY_MAP[entry.name] || 'Inne';
      recipes = recipes.concat(readAllRecipes(fullPath, mappedCategory));
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.md') &&
      !entry.name.toLowerCase().startsWith('index')
    ) {
      // Fallback for root files
      let category = currentCategory;
      if (dir === TMP_DIR) {
        category = 'Inne';
      }
      try {
        const recipe = parseRecipeFile(fullPath, category);
        recipes.push(recipe);
      } catch (err) {
        console.error(`Failed to parse ${fullPath}:`, err);
      }
    }
  }

  return recipes;
}

function main() {
  console.log(`Reading recipes from ${TMP_DIR}...`);
  const allRecipes = readAllRecipes(TMP_DIR);

  console.log(`Found ${allRecipes.length} recipes. Generating JSON...`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allRecipes, null, 2));

  console.log(`Saved to ${OUTPUT_FILE}`);
}

main();
