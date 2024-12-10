// Setup the visualization dashboard (data step 7)
function setupVisualizationDashboard() {
    const visualizationDashboard = document.querySelector('[data-step="7"]');
    if (!visualizationDashboard) {
      console.error("'.data-step[7]' container not found in DOM.");
      return;
    }
  
    // Clear any existing content
    visualizationDashboard.innerHTML = '';
  
    // Create left section for image details
    const leftSection = document.createElement('div');
    leftSection.classList.add('dashboard-left');
  
    // Create and append the image container with img
    const fullImageContainer = document.createElement('div');
    fullImageContainer.classList.add('dashboard-image');
  
    const fullImage = document.createElement('img');
    fullImage.alt = 'No image selected';
    fullImage.src = ''; // Initially empty
  
    fullImageContainer.appendChild(fullImage);
    leftSection.appendChild(fullImageContainer);
  
    // Add title and description
    const imageTitle = document.createElement('h2');
    imageTitle.classList.add('image-title');
    imageTitle.textContent = 'Select an image to see details';
  
    const imageDescription = document.createElement('p');
    imageDescription.classList.add('image-description');
    imageDescription.textContent = 'Click on an image from the subgallery.';
  
    leftSection.appendChild(imageTitle);
    leftSection.appendChild(imageDescription);
  
    // Create right section for visualization placeholders
    const rightSection = document.createElement('div');
    rightSection.classList.add('dashboard-right');
  
    const visualizationPlaceholder = document.createElement('div');
    visualizationPlaceholder.classList.add('visualization-placeholder');
    visualizationPlaceholder.textContent = 'Data visualizations will appear here.';
  
    rightSection.appendChild(visualizationPlaceholder);
  
    // Append sections to the dashboard
    visualizationDashboard.appendChild(leftSection);
    visualizationDashboard.appendChild(rightSection);
  }
  
  // Populate image details dynamically
  function populateImageDetails(image) {
    const fullImage = document.querySelector('.dashboard-image img'); // Select the img inside the container
    const imageTitle = document.querySelector('.image-title');
    const imageDescription = document.querySelector('.image-description');
  
    if (fullImage && imageTitle && imageDescription) {
      fullImage.src = `images/${image.filename}`;
      fullImage.alt = image.title || 'Image';
      imageTitle.textContent = image.title || 'Untitled Image';
      imageDescription.textContent = image.description || 'No description available.';
    } else {
      console.error("One or more elements for populating image details are missing.");
    }
  }
  
  // Initialize the dashboard on page load
  document.addEventListener('DOMContentLoaded', () => {
    setupVisualizationDashboard();
  });
  