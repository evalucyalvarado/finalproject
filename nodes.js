const fs = require('fs');

// Load adjacency matrix data
const output = JSON.parse(fs.readFileSync('adjacency_matrix.json', 'utf8'));
const names = output.names;
const matrix = output.matrix;

// Create nodes array
const nodes = names.map((name, index) => {
  return {
    id: index,
    name: name,
    group: 1, // Default group
  };
});

// Create links array
const links = [];

for (let i = 0; i < matrix.length; i++) {
  for (let j = i + 1; j < matrix[i].length; j++) {
    const { count, links: mediaLinks } = matrix[i][j];
    if (count > 0) {
      links.push({
        source: i,
        target: j,
        value: count,
        links: mediaLinks, // Associate media links with this connection
      });
    }
  }
}

// Calculate node degrees (number of connections) and total weights
nodes.forEach((node) => {
  node.degree = 0;
  node.totalWeight = 0;
});

links.forEach((link) => {
  nodes[link.source].degree += 1;
  nodes[link.source].totalWeight += link.value;
  nodes[link.target].degree += 1;
  nodes[link.target].totalWeight += link.value;
});

// Identify nodes with zero degree
const zeroDegreeNodes = nodes.filter(node => node.degree === 0);

// Sort nodes based on totalWeight
nodes.sort((a, b) => b.totalWeight - a.totalWeight);

// Choose a central node (e.g., the most connected node)
const centralNode = nodes[0]; // Node with the highest totalWeight

// Add links to connect zero degree nodes to the central node
zeroDegreeNodes.forEach(node => {
  links.push({
    source: node.id,
    target: centralNode.id,
    value: 1, // Assign a minimal weight
    links: [], // No media links for these additional connections
  });

  // Update degrees and total weights
  node.degree += 1;
  node.totalWeight += 1;

  centralNode.degree += 1;
  centralNode.totalWeight += 1;
});

// Re-sort nodes based on totalWeight (optional)
nodes.sort((a, b) => b.totalWeight - a.totalWeight);

// Select top N names for galleries (e.g., top 5)
const topN = 5;
const topNodes = nodes.slice(0, topN);

// Mark top nodes for styling in visualization
nodes.forEach((node) => {
  if (topNodes.includes(node)) {
    node.group = 2; // Assign a different group for top nodes
  } else {
    node.group = 1; // Ensure others are in group 1
  }
});

// Node interactions
//node.on('mouseover', function(event, d) {
  // Create a tooltip or update existing one
  //const tooltip = d3.select('#tooltip');
  //if (tooltip.empty()) {
    //d3.select('body').append('div').attr('id', 'tooltip').attr('class', 'tooltip');
  //}
  //d3.select('#tooltip')
    //.html(() => {
      //const imageData = d.images[0] || {};
      //return `<h4>${imageData.title || d.name}</h4>
        //      <p>${imageData.description || 'No description available.'}</p>`;
    //})
   // .style('visibility', 'visible')
   // .style('top', (event.pageY - 20) + 'px')
    //.style('left', (event.pageX + 20) + 'px');
//})
//.on('mouseout', function() {
//  d3.select('#tooltip').style('visibility', 'hidden');
//});


// Prepare data for D3 visualization
const d3Data = {
  nodes: nodes,
  links: links,
};

// Save to file
fs.writeFileSync('d3_data.json', JSON.stringify(d3Data, null, 2), 'utf8');

console.log("D3 data saved to 'd3_data.json'");
