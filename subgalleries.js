document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded. Ready for subgallery rendering.');

  // Render the subgallery carousel for the selected gallery
  function renderSubGallery(gallery) {
    console.log(`Opening subgallery for gallery: ${gallery.name}`);

    const subGalleryContainer = document.querySelector('.carousel-wrapper');
    const dotsContainer = document.querySelector('.carousel-dots');

    // Debugging to confirm container presence
    if (!subGalleryContainer || !dotsContainer) {
      console.error("Subgallery containers not found in DOM.");
      console.log('DOM structure at error:', document.body.innerHTML); // Log the DOM for debugging
      return;
    }

    // Clear existing content in the subgallery
    subGalleryContainer.innerHTML = '';
    dotsContainer.innerHTML = '';

    // Fetch gallery data
    fetch('data/processed_data_with_colors.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Fetched JSON data:', data);

        // Filter items matching the selected gallery name
        const matchingItems = data.filter(
          (item) => item.gallery && item.gallery.includes(gallery.name)
        );

        if (matchingItems.length === 0) {
          subGalleryContainer.innerHTML = '<p>No items available for this gallery.</p>';
          return;
        }

        // Populate images and dots
        matchingItems.forEach((item, index) => {
          const img = document.createElement('img');
          img.src = `images/${item.filename}`;
          img.alt = item.title || 'Gallery Item';
          img.classList.add('carousel-image');
          if (index === 0) img.classList.add('active'); // Mark the first image as active
          subGalleryContainer.appendChild(img);

          const dot = document.createElement('span');
          dot.classList.add('carousel-dot');
          if (index === 0) dot.classList.add('active'); // Mark the first dot as active
          dotsContainer.appendChild(dot);

          img.addEventListener('click', () => {
            console.log(`Image clicked: ${item.title}`);
            openVisualizationDashboard(item);
          });

          dot.addEventListener('click', () => {
            setActiveImage(index, matchingItems.length);
          });
        });

        initializeCarousel(matchingItems.length);
      })
      .catch((error) => {
        console.error('Error loading processed_data_with_colors JSON:', error);
      });
  }

  // Initialize carousel functionality for swiping and dragging
  function initializeCarousel(totalImages) {
    const subGalleryContainer = document.querySelector('.carousel-wrapper');
    let isDragging = false;
    let startX = 0;
    let currentIndex = 0;

    // Handle drag start
    subGalleryContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX;
    });

    // Handle drag end
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Handle drag movement
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.pageX - startX;

      if (deltaX > 50 && currentIndex > 0) {
        currentIndex--;
        setActiveImage(currentIndex, totalImages);
        isDragging = false;
      } else if (deltaX < -50 && currentIndex < totalImages - 1) {
        currentIndex++;
        setActiveImage(currentIndex, totalImages);
        isDragging = false;
      }
    });
  }

  // Function to handle active image and dot state
  function setActiveImage(index, totalImages) {
    const images = document.querySelectorAll('.carousel-image');
    const dots = document.querySelectorAll('.carousel-dot');
    const subGalleryContainer = document.querySelector('.carousel-wrapper');

    const offset = -index * 100; // Calculate offset
    subGalleryContainer.style.transform = `translateX(${offset}%)`;

    images.forEach((img, idx) => img.classList.toggle('active', idx === index));
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === index));
  }

  // Open the visualization dashboard when an image is clicked
  function openVisualizationDashboard(item) {
    console.log(`Opening visualization dashboard for: ${item.title}`);
    const dashboard = document.querySelector('.visualizationDashboard');
    dashboard.classList.remove('hidden');
    const dashboardImage = dashboard.querySelector('.dashboard-image img');
    const imageTitle = dashboard.querySelector('.image-title');
    const imageDescription = dashboard.querySelector('.image-description');

    if (dashboardImage && imageTitle && imageDescription) {
      dashboardImage.src = `images/${item.filename}`;
      dashboardImage.alt = item.title || 'Gallery Item';
      imageTitle.textContent = item.title || 'Untitled';
      imageDescription.textContent = item.description || 'No description available.';
    } else {
      console.error('Dashboard elements not found.');
    }
  }
});
