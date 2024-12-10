const fs = require('fs');

// Load the JSON data
const data = JSON.parse(fs.readFileSync('extracted_names_metadata.json', 'utf8'));

// Ensure the data is an array of entries
if (!Array.isArray(data)) {
  console.error('Data should be an array of entries.');
  process.exit(1);
}

// Name mapping dictionary
const nameMapping = {
  "Captain David Hilliard": "David Hilliard",
  "Chief": "David Hilliard",
  "Capt David Hilliard": "David Hilliard",
  "Chairman Fred Hampton": "Fred Hampton",
  "Comrade Angela Davis": "Angela Davis",
  "Free Angela": "Angela Davis",
  "Angela Yvonne Davis": "Angela Davis",
  "Chief of Staff Bobby Seale": "Bobby Seale",
  "Minister of Defense Huey Newton": "Huey Newton",
  "Sister Elaine Brown": "Elaine Brown",
  "Eldridge Cleaver": "Eldridge Cleaver",
  "Eldridge Cleaver PhD": "Eldridge Cleaver",
  "Kwame Ture (Stokely Carmichael)": "Kwame Ture F.K.A. Stokely Carmichael",
  "Stokely Carmichael": "Kwame Ture F.K.A. Stokely Carmichael",
  "Free Huey": "Huey P. Newton",
  "Huey P. Newton": "Huey P. Newton",
  "Huey P Newton": "Huey P. Newton",
  "Huey Newton": "Huey P. Newton",
  "Kathleen Cleaver Ph": "Kathleen Cleaver",
  "Kathleen Cleaver": "Kathleen Cleaver",
  "Kathleen Cleaver PhD": "Kathleen Cleaver",
  "Kathleen Neal Cleaver": "Kathleen Cleaver",
  "Robert James Hutton": "Bobby Hutton",
  "Bobby Hutton Memorial Park": "Bobby Hutton",
  "Rap Brown": "H Rap Brown",
  "Congressman Rush": "Bobby Rush",
  "David Hilliard": "David Hilliard",
  "Fred Hampton": "Fred Hampton",
  "Bobby Seale": "Bobby Seale",
  
};

// Names to keep
const namesToKeep = new Set([
  "David Hilliard",
  "Fred Hampton",
  "Angela Davis",
  "Bobby Seale",
  "Huey P. Newton",
  "Elaine Brown",
  "Kathleen Cleaver",
  "Eldridge Cleaver",
  "Kwame Ture F.K.A. Stokely Carmichael",
  "Pirkle Jones",
  "Bobby Hutton",
  "Stephen Shames",
  "Unidentified Man",
  "Unidentified Woman",
  "Unidentified Child",
  "Black Panther Party",
  "Marion Baruch",
  "Blair Stapp",
  "Emory Douglas",
  "Michael Hoerger",
  "Arthur Glenn Morris",
  "William Lee Brent",
  "Raymond Johnson Jr",
  "David Lewis",
  "James Burford",
  "Jamil Abdullah Al",
  "H Rap Brown",
  "Amiri Baraka",
  "Ed Bullins",
  "Roscoe Orman",
  "Enrique Vargas",
  "Leroi Jones",
  "Unitarian Church",
  "Alan Copeland",
  "Mark James",
  "Hiram Maristany",
  "Lisa Lyons",
  "Reis Tijerina",
  "Ivan Dixon",
  "Mike Klonsky",
  "Jesse Steve Rose",
  "Denise Oliver",
  "Mickey Agrait",
  "Mary Ann Carlton",
  "Delores Henderson",
  "Joyce Lee",
  "Joyce Means",
  "Paula Hill",
  "Rafael Viera",
  "Young Lords",
  "Melvin Newton",
  "Bob Fletcher",
  "Faith Ringgold",
  "Frank Espada",
  "Bobby Rush",
]);

// Function to normalize names
function normalizeName(name) {
  return name.trim().toLowerCase();
}

// Function to process names and extract links/images in each entry
function processNames(entry) {
  const processedNames = new Set();
  const links = entry.link ? [entry.link] : []; // Extract the link directly from entry

  // List of fields to search for names
  const fieldsToSearch = ['names', 'title', 'description'];

  fieldsToSearch.forEach((field) => {
    if (entry[field]) {
      let textContent = '';

      if (Array.isArray(entry[field])) {
        textContent = entry[field].join(' ');
      } else {
        textContent = entry[field];
      }

      // Normalize the text
      const normalizedText = textContent.toLowerCase();

      // Search for each key in nameMapping within the text
      for (const variant in nameMapping) {
        const canonicalName = nameMapping[variant];
        const normalizedVariant = normalizeName(variant);

        // Escape special regex characters in the variant
        const escapedVariant = normalizedVariant.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

        // Create a regex to match the variant as a whole word or phrase
        const regex = new RegExp(`\\b${escapedVariant}\\b`, 'gi');

        if (regex.test(normalizedText)) {
          if (namesToKeep.has(canonicalName)) {
            processedNames.add(canonicalName);
          }
        }
      }

      // Also check for canonical names directly in the text
      namesToKeep.forEach((name) => {
        const normalizedNameToKeep = normalizeName(name);
        const escapedNameToKeep = normalizedNameToKeep.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

        const regex = new RegExp(`\\b${escapedNameToKeep}\\b`, 'gi');

        if (regex.test(normalizedText)) {
          processedNames.add(name);
        }
      });
    }
  });

  // Convert the set to an array and assign to the entry
  entry.processedNames = Array.from(processedNames);
  entry.processedLinks = links; // Keep associated links for this entry
}

// Process each entry in the data
data.forEach((entry) => {
  processNames(entry);
});

// Create the adjacency matrix with associated links
const allNamesSet = new Set();
data.forEach((entry) => {
  if (entry.processedNames && entry.processedNames.length > 0) {
    entry.processedNames.forEach((name) => {
      allNamesSet.add(name);
    });
  }
});
const allNames = Array.from(allNamesSet);

const nameToIndex = {};
allNames.forEach((name, index) => {
  nameToIndex[name] = index;
});

const N = allNames.length;
const adjacencyMatrix = Array.from({ length: N }, () => Array.from({ length: N }, () => ({ count: 0, links: [] })));

// Populate adjacency matrix with links
data.forEach((entry) => {
  const names = entry.processedNames;
  const entryLinks = entry.processedLinks;
  if (names && names.length > 1) {
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const indexA = nameToIndex[names[i]];
        const indexB = nameToIndex[names[j]];

        // Increment count and add links
        adjacencyMatrix[indexA][indexB].count += 1;
        adjacencyMatrix[indexB][indexA].count += 1;
        
        adjacencyMatrix[indexA][indexB].links.push(...entryLinks);
        adjacencyMatrix[indexB][indexA].links.push(...entryLinks);
      }
    }
  }
});

// Save the processed data and adjacency matrix to files
fs.writeFileSync('processed_data.json', JSON.stringify(data, null, 2), 'utf8');

const output = {
  names: allNames,
  matrix: adjacencyMatrix,
};

fs.writeFileSync('adjacency_matrix.json', JSON.stringify(output, null, 2), 'utf8');

console.log("Processed data saved to 'processed_data.json'");
console.log("Adjacency matrix with links saved to 'adjacency_matrix.json'");
