/**
 * Lantern Camp Marketing Portal — Interactive Logic
 */

// Navigation Helper
function navigateTo(url) {
    if (url) {
        window.open(url, '_blank');
    }
}

// 1. Opportunities Active Counter Fetch
async function fetchOpportunitiesCount() {
    const countValEl = document.getElementById('opps-count-val');
    const countContainer = document.getElementById('opps-count-container');
    const apiEndpoint = 'https://lucys-whirled.vercel.app/api/opportunities';

    try {
        const response = await fetch(apiEndpoint, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        const opportunities = data.opportunities || [];
        
        // Count active leads (Pending Approval)
        const pendingCount = opportunities.filter(opp => opp.statusText === 'Pending Approval').length;
        
        if (pendingCount > 0) {
            countValEl.textContent = `${pendingCount} Pending Review`;
            countContainer.style.background = 'rgba(194, 94, 58, 0.15)'; // Highlight style
            countValEl.style.color = '#C25E3A';
            if (document.querySelector('#tile-opportunities .pulse-dot')) {
                document.querySelector('#tile-opportunities .pulse-dot').style.backgroundColor = '#C25E3A';
            }
        } else {
            countValEl.textContent = 'Queue Clean';
            countContainer.style.background = 'rgba(61, 82, 69, 0.15)'; // Quiet style
            countValEl.style.color = '#3D5245';
            if (document.querySelector('#tile-opportunities .pulse-dot')) {
                document.querySelector('#tile-opportunities .pulse-dot').style.backgroundColor = '#3D5245';
            }
        }
    } catch (err) {
        console.warn('Unable to reach live opportunities count. Falling back to default display.', err);
        // Graceful fallback for offline development or server downtime
        countValEl.textContent = 'Active Leads Queue';
        if (countContainer) {
            countContainer.style.background = 'rgba(142, 132, 106, 0.1)';
            countValEl.style.color = '#8E846A';
        }
        const pulse = document.querySelector('#tile-opportunities .pulse-dot');
        if (pulse) pulse.style.display = 'none';
    }
}

// 2. Media Card Slideshow Background Cycle
const slideshowImages = [
    'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80', // Premium Cabin in Woods
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80', // Campfire and Tall Pine Trees
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80'  // Misty Forest Ridge View
];

let currentSlideIndex = 0;

function runMediaSlideshow() {
    const slideshowEl = document.getElementById('media-slideshow');
    if (!slideshowEl) return;

    // Set initial image
    slideshowEl.style.backgroundImage = `url('${slideshowImages[currentSlideIndex]}')`;

    // Rotate every 5 seconds
    setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % slideshowImages.length;
        
        // Preload next image to avoid flashing white space
        const tempImg = new Image();
        tempImg.src = slideshowImages[currentSlideIndex];
        tempImg.onload = () => {
            slideshowEl.style.backgroundImage = `url('${slideshowImages[currentSlideIndex]}')`;
        };
    }, 5000);
}

// Initializers
document.addEventListener('DOMContentLoaded', () => {
    fetchOpportunitiesCount();
    runMediaSlideshow();
});
