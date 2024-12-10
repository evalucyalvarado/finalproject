// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded.');

  // Fetch gallery data and populate the main gallery
  fetch('data/galleries.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      populateGalleries(data); // Populate the main gallery
    })
    .catch(error => console.error('Error loading galleries JSON:', error));

  // Ensure subgallery (data-step 6) and dashboard (data-step 7) are hidden initially
  document.querySelector('[data-step="6"]').classList.add('hidden');
  document.querySelector('[data-step="7"]').classList.add('hidden');
});

// Smooth scrolling to elements
function scrollToElement(selector) {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// Show a loading spinner
function showLoading(container) {
  const loadingSpinner = document.createElement('div');
  loadingSpinner.classList.add('loading-spinner');
  loadingSpinner.textContent = 'Loading...';
  container.innerHTML = ''; // Clear existing content
  container.appendChild(loadingSpinner);
}

// Remove the loading spinner
function hideLoading(container) {
  const loadingSpinner = container.querySelector('.loading-spinner');
  if (loadingSpinner) {
    loadingSpinner.remove();
  }
}

// Populate the main gallery (data-step 5)
function populateGalleries(galleries) {
  const galleryContainer = document.querySelector('.galleries');
  if (!galleryContainer) {
    console.error("'.galleries' container not found in DOM.");
    return;
  }

  showLoading(galleryContainer); // Show loading spinner

  setTimeout(() => {
    galleryContainer.innerHTML = ''; // Clear loading spinner

    galleries.forEach(gallery => {
      const galleryTile = document.createElement('div');
      galleryTile.classList.add('library-tile');

      const heroImageContainer = document.createElement('div');
      heroImageContainer.classList.add('heroImage-container');
      heroImageContainer.style.backgroundColor = gallery.color || '#852221';

      const heroImage = document.createElement('div');
      heroImage.classList.add('heroImage');
      heroImage.style.backgroundImage = `url(${gallery.heroImage})`;

      heroImageContainer.appendChild(heroImage);

      const galleryTitle = document.createElement('div');
      galleryTitle.classList.add('gallery-title');
      galleryTitle.textContent = gallery.galleryTitle;

      const gallerySubtitle = document.createElement('div');
      gallerySubtitle.classList.add('gallery-subtitle');
      gallerySubtitle.textContent = gallery.gallerySubtitle || '';

      galleryTile.appendChild(heroImageContainer);
      galleryTile.appendChild(galleryTitle);
      galleryTile.appendChild(gallerySubtitle);

      galleryTile.addEventListener('click', () => {
        openGallery({
          name: gallery.name,
          galleryTitle: gallery.galleryTitle,
          gallerySubtitle: gallery.gallerySubtitle,
          galleryDescription: gallery['gallery-description']
        });
      });

      galleryContainer.appendChild(galleryTile);
    });

    hideLoading(galleryContainer); // Remove loading spinner
  }, 300);
}

// Open a subgallery (data-step 6)
function openGallery(gallery) {
  console.log(`Opening subgallery for gallery: ${gallery.name}`);

  document.querySelector('[data-step="6"]').classList.remove('hidden'); // Show subgallery
  document.querySelector('[data-step="7"]').classList.add('hidden'); // Hide dashboard
  scrollToElement('[data-step="6"]'); // Smooth scroll to subgallery

  renderSubGallery(gallery); // Load subgallery items
}

// Render subgallery items (data-step 6)
function renderSubGallery(gallery) {
  const subGalleryContainer = document.querySelector('.carousel-wrapper');
  const dotsContainer = document.querySelector('.carousel-dots');
  if (!subGalleryContainer || !dotsContainer) {
    console.error("Subgallery containers not found in DOM.");
    return;
  }

  subGalleryContainer.innerHTML = '';
  dotsContainer.innerHTML = '';

  fetch('data/processed_data_with_colors.json')
    .then(response => response.json())
    .then(data => {
      const matchingItems = data.filter(item =>
        item.gallery && item.gallery.includes(gallery.name)
      );

      if (matchingItems.length === 0) {
        subGalleryContainer.innerHTML = '<p>No items available for this gallery.</p>';
        return;
      }

      matchingItems.forEach((item, index) => {
        const img = document.createElement('img');
        img.src = `images/${item.filename}`;
        img.alt = item.title || 'Gallery Item';
        img.classList.add('carousel-image');
        if (index === 0) img.classList.add('active');
        subGalleryContainer.appendChild(img);

        const dot = document.createElement('span');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dotsContainer.appendChild(dot);

        img.addEventListener('click', () => openVisualizationDashboard(item));
        dot.addEventListener('click', () => setActiveImage(index, matchingItems.length));
      });

      initializeCarousel(matchingItems.length);
    })
    .catch(error => console.error('Error loading subgallery items:', error));
}

// Open the visualization dashboard (data-step 7)
function openVisualizationDashboard(item) {
  console.log(`Opening visualization dashboard for: ${item.title}`);

  document.querySelector('[data-step="7"]').classList.remove('hidden'); // Show dashboard
  scrollToElement('[data-step="7"]'); // Smooth scroll to dashboard

  populateImageDetails(item); // Populate dashboard
}

// Populate the dashboard with image details
function populateImageDetails(item) {
  const imageTitle = document.querySelector('.image-title');
  const imageDescription = document.querySelector('.image-description');
  const dashboardImage = document.querySelector('.dashboard-image img');

  if (imageTitle && imageDescription && dashboardImage) {
    imageTitle.textContent = item.title || 'Untitled';
    imageDescription.textContent = item.description || 'No description available.';
    dashboardImage.src = `images/${item.filename}`;
    dashboardImage.alt = item.title || 'Gallery Item';
  } else {
    console.error('Dashboard elements not found.');
  }
}

// Initialize carousel functionality for swiping and dragging
function initializeCarousel(totalImages) {
  const subGalleryContainer = document.querySelector('.carousel-wrapper');
  let isDragging = false;
  let startX = 0;
  let currentIndex = 0;

  // Handle drag start
  subGalleryContainer.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.pageX;
  });

  // Handle drag end
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Handle drag movement
  document.addEventListener('mousemove', e => {
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

// Set active image and dot in the carousel
function setActiveImage(index, totalImages) {
  const images = document.querySelectorAll('.carousel-image');
  const dots = document.querySelectorAll('.carousel-dot');
  const subGalleryContainer = document.querySelector('.carousel-wrapper');

  const offset = -index * 100; // Calculate offset
  subGalleryContainer.style.transform = `translateX(${offset}%)`;

  images.forEach((img, idx) => img.classList.toggle('active', idx === index));
  dots.forEach((dot, idx) => dot.classList.toggle('active', idx === index));
}
