// script.js

// Initialize Scrollama
const scroller = scrollama();

// Function to handle step enter
function handleStepEnter(response) {
  const step = response.element.getAttribute('data-step');

  // Update content based on the current step
  switch (step) {
    case '1':
      // Display the introductory image
      document.getElementById('main-image').src = 'images/bobby_seale_speech.jpg';
      document.getElementById('main-image').style.display = 'block';
      document.getElementById('network-diagram').style.display = 'none';
      break;
    case '2':
      // Update the image with the first context image
      document.getElementById('main-image').src = 'images/context_image1.jpg';
      break;
    case '3':
      // Update the image with the second context image
      document.getElementById('main-image').src = 'images/context_image2.jpg';
      break;
    case '4':
      // Update the image with the third context image
      document.getElementById('main-image').src = 'images/context_image3.jpg';
      break;
    case '5':
      // Hide the main image and display the network diagram
      document.getElementById('main-image').style.display = 'none';
      document.getElementById('network-diagram').style.display = 'block';
      // Render the network diagram
      renderNetworkDiagram();
      break;
    case '6':
      // Hide the network diagram and display a concluding image
      document.getElementById('network-diagram').style.display = 'none';
      document.getElementById('main-image').style.display = 'block';
      document.getElementById('main-image').src = 'images/conclusion_image.jpg';
      break;
    default:
      break;
  }
}

// Function to initialize Scrollama
function init() {
  scroller
    .setup({
      step: '.article section',
      offset: 0.5,
      debug: false,
    })
    .onStepEnter(handleStepEnter);

  // Handle window resize event
  window.addEventListener('resize', scroller.resize);
}

// Function to render the network diagram
function renderNetworkDiagram() {
  // Clear any existing SVG
  d3.select('#network-diagram').selectAll('*').remove();

  // Load your adjacency matrix data (assuming it's in JSON format)
  d3.json('data/adjacency_matrix.json').then(data => {
    // Process data
    const nodes = data.names.map(name => ({ id: name }));
    const links = data.links.map(link => ({
      source: link.source,
      target: link.target,
      value: link.value,
    }));

    // Set up SVG canvas dimensions
    const width = document.getElementById('network-diagram').clientWidth;
    const height = document.getElementById('network-diagram').clientHeight;

    const svg = d3.select('#network-diagram')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Set up simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Add links
    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', d => Math.sqrt(d.value));

    // Add nodes
    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 8)
      .attr('fill', '#ff5722')
      .call(drag(simulation));

    // Add labels
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .attr('dy', -10)
      .attr('text-anchor', 'middle')
      .text(d => d.id);

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    node.on('mouseover', (event, d) => {
      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);
      tooltip.html(`Name: ${d.id}`)
        .style('left', (event.pageX) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    // Drag functions
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }).catch(error => {
    console.error('Error loading adjacency matrix:', error);
  });
}

// Kick off the initialization
init();
