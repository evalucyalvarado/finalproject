// radial_network.js

/**
 * Radial Network Visualization using D3.js
 * 
 * This script listens for node selection events and renders a radial network visualization
 * based on the selected node from the key members gallery or interactions within the network.
 * 
 * Author: Your Name
 * Date: 2024-04-27
 */

document.addEventListener('DOMContentLoaded', () => {
    (function() {
        // Configuration
        const SELECTORS = {
            radialNetwork: '#radial-network',
            tooltip: '#tooltip'
        };

        const DIMENSIONS = {
            width: 600,
            height: 600,
            radius: 250
        };

        // Create SVG Element
        const svg = d3.select(SELECTORS.radialNetwork)
            .append('svg')
            .attr('width', DIMENSIONS.width)
            .attr('height', DIMENSIONS.height)
            .append('g')
            .attr('transform', `translate(${DIMENSIONS.width / 2}, ${DIMENSIONS.height / 2})`);

        // Tooltip Setup
        const tooltip = d3.select('body').append('div')
            .attr('id', 'tooltip')
            .style('position', 'absolute')
            .style('text-align', 'left')
            .style('padding', '10px')
            .style('font-size', '12px')
            .style('background', 'rgba(0, 0, 0, 0.85)')
            .style('color', '#f0f0f0')
            .style('border-radius', '8px')
            .style('pointer-events', 'none')
            .style('visibility', 'hidden');

        // State Variables
        let currentSelectedNode = null;
        let simulation = null;

        /**
         * Initializes the radial network by setting up event listeners.
         */
        function init() {
            // Listen for 'nodeSelected' events dispatched from app.js or within the network
            document.addEventListener('nodeSelected', event => {
                const selectedNode = event.detail;
                if (selectedNode) {
                    createRadialNetwork(selectedNode);
                }
            });

            // Optionally, listen for 'dataLoaded' to render an initial network
            document.addEventListener('dataLoaded', () => {
                // Select the first key member as the initial node
                if (window.networkData && window.networkData.nodes.length > 0) {
                    const initialNode = window.networkData.nodes[0];
                    createRadialNetwork(initialNode);
                }
            });
        }

        /**
         * Creates the radial network visualization based on the selected node.
         * @param {Object} selectedNode 
         */
        function createRadialNetwork(selectedNode) {
            currentSelectedNode = selectedNode;

            // Clear any existing visualization
            svg.selectAll('*').remove();

            // Validate networkData
            if (!window.networkData || !window.networkData.nodes || !window.networkData.links) {
                console.error('Network data is not properly loaded.');
                return;
            }

            const { nodes, links, nameToNode } = window.networkData;

            // Find associated links
            const associatedLinks = links.filter(link => 
                link.source === selectedNode.id || link.target === selectedNode.id
            );

            // Find associated node IDs
            const associatedNodeIds = new Set();
            associatedLinks.forEach(link => {
                associatedNodeIds.add(link.source);
                associatedNodeIds.add(link.target);
            });

            // Get associated nodes
            const associatedNodes = nodes.filter(node => associatedNodeIds.has(node.id));

            // Prepare data for visualization
            const visualizationData = {
                nodes: [selectedNode, ...associatedNodes],
                links: associatedLinks
            };

            // Convert link source and target to node objects
            visualizationData.links = visualizationData.links.map(link => ({
                source: visualizationData.nodes.find(n => n.id === link.source),
                target: visualizationData.nodes.find(n => n.id === link.target),
                weight: link.weight || 1
            }));

            // Render the radial network
            renderRadialNetwork(visualizationData);
        }

        /**
         * Renders the radial network using D3.js force simulation.
         * @param {Object} data 
         */
        function renderRadialNetwork(data) {
            // Define simulation
            simulation = d3.forceSimulation(data.nodes)
                .force('link', d3.forceLink(data.links).id(d => d.id).distance(150))
                .force('charge', d3.forceManyBody().strength(-500))
                .force('center', d3.forceCenter(0, 0))
                .force('collision', d3.forceCollide().radius(d => getNodeRadius(d) + 10))
                .on('tick', ticked);

            // Define scales
            const nodeSizeScale = d3.scaleLinear()
                .domain(d3.extent(data.nodes, d => d.totalWeight))
                .range([20, 40]);

            const linkWidthScale = d3.scaleLinear()
                .domain(d3.extent(data.links, d => d.weight))
                .range([1, 5]);

            // Add links
            const link = svg.append('g')
                .attr('class', 'links')
                .selectAll('line')
                .data(data.links)
                .enter()
                .append('line')
                .attr('stroke', '#ff0000') // Red links
                .attr('stroke-width', d => linkWidthScale(d.weight));

            // Add nodes
            const node = svg.append('g')
                .attr('class', 'nodes')
                .selectAll('g')
                .data(data.nodes)
                .enter()
                .append('g')
                .attr('class', 'node')
                .on('mouseover', (event, d) => showTooltip(event, d))
                .on('mousemove', (event, d) => moveTooltip(event, d))
                .on('mouseout', hideTooltip)
                .on('click', (event, d) => handleNodeClick(d));

            node.append('circle')
                .attr('r', d => nodeSizeScale(d.totalWeight))
                .attr('fill', d => d.id === currentSelectedNode.id ? '#ff0000' : '#ffffff') // Highlight selected node
                .attr('stroke', '#ff0000')
                .attr('stroke-width', 2);

            node.append('text')
                .attr('dy', d => getNodeRadius(d) + 15)
                .attr('text-anchor', 'middle')
                .text(d => d.name)
                .style('font-size', '12px')
                .style('fill', '#f0f0f0')
                .style('font-family', 'Special Elite, cursive');

            /**
             * Tick function to update positions
             */
            function ticked() {
                link
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);

                node
                    .attr('transform', d => `translate(${d.x},${d.y})`);
            }

            /**
             * Gets the radius of a node based on its totalWeight
             * @param {Object} node 
             * @returns {number}
             */
            function getNodeRadius(node) {
                const nodeSizeScale = d3.scaleLinear()
                    .domain(d3.extent(data.nodes, d => d.totalWeight))
                    .range([20, 40]);
                return nodeSizeScale(node.totalWeight);
            }

            /**
             * Handles node click events to update the radial network and emit 'nodeSelected' event
             * @param {Object} node 
             */
            function handleNodeClick(node) {
                if (node.id !== currentSelectedNode.id) {
                    // Dispatch a 'nodeSelected' event with the clicked node's data
                    const event = new CustomEvent('nodeSelected', { detail: node });
                    document.dispatchEvent(event);
                }
            }

            /**
             * Shows a tooltip with node information
             * @param {Object} event 
             * @param {Object} d 
             */
            function showTooltip(event, d) {
                tooltip
                    .html(`
                        <h4>${d.name}</h4>
                        <p><strong>Total Weight:</strong> ${d.totalWeight}</p>
                        ${d.description ? `<p><em>${d.description}</em></p>` : ''}
                    `)
                    .style('visibility', 'visible');
            }

            /**
             * Moves the tooltip based on mouse position
             * @param {Object} event 
             * @param {Object} d 
             */
            function moveTooltip(event, d) {
                tooltip
                    .style('top', (event.pageY + 15) + 'px')
                    .style('left', (event.pageX + 15) + 'px');
            }

            /**
             * Hides the tooltip
             */
            function hideTooltip() {
                tooltip
                    .style('visibility', 'hidden');
            }
        }

        /**
         * Initializes the radial network visualization
         */
        init();

    })(); // End of IIFE
});
