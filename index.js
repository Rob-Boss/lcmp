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

// 2. Fetch and Render Addison's To-Do List Tasks
async function fetchAddisonTasks() {
    const listEl = document.getElementById('addison-tasks-list');
    if (!listEl) return;

    const isLocal = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1');
    const apiEndpoint = isLocal ? 'https://lcmp.vercel.app/api/todo-image?file=addison-todo&format=json' : '/api/todo-image?file=addison-todo&format=json';

    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        const tasks = data.tasks || [];
        
        listEl.innerHTML = ''; // Clear skeleton/loading text

        if (tasks.length === 0) {
            listEl.innerHTML = '<div style="color: #738A80; font-size: 0.85rem; font-style: italic;">No active tasks on the list.</div>';
            return;
        }

        tasks.forEach(task => {
            const itemEl = document.createElement('div');
            itemEl.className = 'todo-item-portal';
            if (task.status === 'completed') {
                itemEl.classList.add('completed');
            }

            // Custom Checkbox representation in HTML
            let checkboxHtml = '';
            if (task.status === 'completed') {
                checkboxHtml = `
                    <svg class="todo-checkbox-portal" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="16" height="16" rx="4" fill="#1C352D" />
                        <path d="M5 8L7 10L11 5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                `;
            } else if (task.status === 'in-progress') {
                checkboxHtml = `
                    <svg class="todo-checkbox-portal" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="8" r="7" stroke="#C29D66" stroke-width="2" />
                        <path d="M 8 8 L 8 2.5 A 5.5 5.5 0 0 1 13.5 8 Z" fill="#C29D66" />
                    </svg>
                `;
            } else {
                checkboxHtml = `
                    <svg class="todo-checkbox-portal" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="3.25" stroke="#738A80" stroke-width="1.5" fill="none" />
                    </svg>
                `;
            }

            // Render text with prefix if present
            let textHtml = '';
            let targetUrl = '';

            if (task.prefix) {
                const prefixLower = task.prefix.toLowerCase();
                if (prefixLower.includes('redesign')) {
                    targetUrl = 'https://lanterncamp.com';
                } else if (prefixLower.includes('press kit')) {
                    targetUrl = 'https://lantern-digital-press-kit.vercel.app/outreach';
                }

                if (targetUrl) {
                    itemEl.classList.add('has-link');
                    itemEl.addEventListener('click', () => {
                        if (targetUrl.startsWith('http')) {
                            window.open(targetUrl, '_blank');
                        } else {
                            window.location.href = targetUrl;
                        }
                    });
                }

                textHtml = `
                    <span class="todo-text-portal">
                        <span class="todo-prefix-portal">${escapeHtml(task.prefix)}</span>
                        <span class="todo-desc-portal">${escapeHtml(task.cleanText.slice(task.prefix.length).trim())}</span>
                    </span>
                `;
            } else {
                textHtml = `<span class="todo-text-portal todo-desc-portal">${escapeHtml(task.cleanText)}</span>`;
            }

            itemEl.innerHTML = checkboxHtml + textHtml;
            listEl.appendChild(itemEl);
        });

    } catch (err) {
        console.warn('Unable to load Addison tasks.', err);
        listEl.innerHTML = '<div style="color: #8E846A; font-size: 0.85rem; font-style: italic;">Priority list temporarily offline.</div>';
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initializers
document.addEventListener('DOMContentLoaded', () => {
    fetchOpportunitiesCount();
    fetchAddisonTasks();
});
