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

// Initializers
document.addEventListener('DOMContentLoaded', () => {
    fetchOpportunitiesCount();
});
