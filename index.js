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
            countContainer.style.background = 'rgba(140, 59, 59, 0.08)'; // Highlight style (Terracotta)
            countValEl.style.color = '#8C3B3B';
            if (document.querySelector('#tile-opportunities .pulse-dot')) {
                document.querySelector('#tile-opportunities .pulse-dot').style.backgroundColor = '#8C3B3B';
            }
        } else {
            countValEl.textContent = 'Queue Clean';
            countContainer.style.background = 'rgba(53, 69, 53, 0.08)'; // Quiet style (Forest Green)
            countValEl.style.color = '#354535';
            if (document.querySelector('#tile-opportunities .pulse-dot')) {
                document.querySelector('#tile-opportunities .pulse-dot').style.backgroundColor = '#354535';
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
