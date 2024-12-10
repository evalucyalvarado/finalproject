// Load the data
Promise.all([
    d3.json('d3_data.json'),
    d3.json('processed_data.json')
  ]).then(function([d3Data, processedData]) {
    const nodes = d3Data.nodes;
    const links = d3Data.links;
  
    // Create a mapping from name to node data
    const nameToNode = {};
    nodes.forEach(node => {
      nameToNode[node.name] = node;
    });
  
    // Create a mapping from name to image data from processedData
    const nameToImages = {};
    processedData.forEach(entry => {
      if (entry.processedNames && entry.processedNames.length > 0) {
        entry.processedNames.forEach(name => {
          if (!nameToImages[name]) {
            nameToImages[name] = [];
          }
          nameToImages[name].push({
            filename: entry.filename,
            date: entry.date,
            title: entry.title,
            description: entry.description || '',
          });
        });
      }
    });
  
    // Attach image data to nodes
    nodes.forEach(node => {
      node.images = nameToImages[node.name] || [];
    });
  
    // Filter key members (totalWeight > 11 or name contains 'Unidentified')
    const keyMembers = nodes.filter(node => node.totalWeight > 11 || node.name.includes('Unidentified'));
  
    // Display key members in the main gallery
    displayGallery(keyMembers, '#key-members-gallery');
  
    // Set up click event for main gallery items
    setUpClickEvents('#key-members-gallery');
  
    // Function to set up click events on gallery items
    function setUpClickEvents(gallerySelector) {
      d3.selectAll(`${gallerySelector} .gallery-item`).on('click', function(event, d) {
        // Get the clicked member's data
        const memberId = +d3.select(this).attr('data-id');
  
        // Find associated people
        const associatedPeople = findAssociatedPeople(memberId, nodes, links);
  
        // Display associated people in the interactive gallery
        displayGallery(associatedPeople, '#associated-members-gallery');
  
        // Set up click events for the new gallery
        setUpClickEvents('#associated-members-gallery');
      });
    }
  
    // Function to display a gallery of members
    function displayGallery(members, gallerySelector) {
      const gallery = d3.select(gallerySelector);
      gallery.selectAll('*').remove(); // Clear existing items
  
      const items = gallery.selectAll('.gallery-item')
        .data(members)
        .enter()
        .append('div')
        .attr('class', 'gallery-item')
        .attr('data-id', d => d.id);
  
      // For each member, display their images
      items.each(function(d) {
        const item = d3.select(this);
  
        // If the member has images, display them
        if (d.images.length > 0) {
          // For simplicity, display the first image
          const imageData = d.images[0];
  
          // Create the card structure similar to your professor's code
          const card = item.append('div').attr('class', 'card');
  
          // Image
          card.append('div')
            .attr('class', 'image')
            .append('img')
            .attr('src', './images/' + imageData.filename)
            .attr('alt', d.name);
  
          // Object date
          card.append('p')
            .attr('class', 'object-date')
            .text(imageData.date || 'Unknown Date');
  
          // Title
          card.append('h2')
            .attr('class', 'title')
            .text(imageData.title || d.name);
  
          // Tooltip with description and associated people
          card.append('div')
            .attr('class', 'tooltip')
            .html(() => {
              const associatedNames = findAssociatedPeople(d.id, nodes, links).map(n => n.name).join(', ');
              return `<strong>${d.name}</strong><br>
                      Description: ${imageData.description || 'N/A'}<br>
                      Associated People: ${associatedNames || 'None'}`;
            });
  
        } else {
          // If no images, display a placeholder
          const card = item.append('div').attr('class', 'card');
  
          // Placeholder Image
          card.append('div')
            .attr('class', 'image')
            .append('img')
            .attr('src', 'placeholder-image.jpg') // Replace with a placeholder image path
            .attr('alt', d.name);
  
          // Object date
          card.append('p')
            .attr('class', 'object-date')
            .text('Unknown Date');
  
          // Title
          card.append('h2')
            .attr('class', 'title')
            .text(d.name);
  
          // Tooltip
          card.append('div')
            .attr('class', 'tooltip')
            .html(() => {
              const associatedNames = findAssociatedPeople(d.id, nodes, links).map(n => n.name).join(', ');
              return `<strong>${d.name}</strong><br>
                      Description: N/A<br>
                      Associated People: ${associatedNames || 'None'}`;
            });
        }
      });
  
      // Show tooltips on hover
      items.selectAll('.card').on('mouseenter', function() {
        d3.select(this).select('.tooltip').style('visibility', 'visible');
      }).on('mouseleave', function() {
        d3.select(this).select('.tooltip').style('visibility', 'hidden');
      });
    }
  
    // Function to find associated people based on links
    function findAssociatedPeople(memberId, nodes, links) {
      const associatedIds = new Set();
  
      links.forEach(link => {
        if (link.source === memberId) {
          associatedIds.add(link.target);
        } else if (link.target === memberId) {
          associatedIds.add(link.source);
        }
      });
  
      // Convert associated IDs to node data
      const associatedPeople = nodes.filter(node => associatedIds.has(node.id));
  
      return associatedPeople;
    }
  });
  