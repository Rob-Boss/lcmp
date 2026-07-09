import { githubFetch } from './config.js';

function wrapText(text, maxChars = 55) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function formatEstDate(date) {
  const options = {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleString('en-US', options) + ' EDT';
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get filename from query params (default to addison-todo.md)
  let fileName = req.query.file || 'addison-todo.md';
  if (!fileName.endsWith('.md')) {
    fileName += '.md';
  }

  const filePath = `tasks/${fileName}`;

  try {
    // 1. Fetch current file from GitHub
    const fetchRes = await githubFetch(filePath);
    
    if (fetchRes.status === 404) {
      return serveErrorSvg(res, `File not found: ${filePath}`);
    }
    
    if (!fetchRes.ok) {
      return serveErrorSvg(res, `Failed to load tasks from GitHub`);
    }

    const fileData = await fetchRes.json();
    const markdown = Buffer.from(fileData.content, 'base64').toString('utf-8').replace(/\r/g, '');

    // 2. Parse Markdown Checklist Items
    const lines = markdown.split('\n');
    const tasks = [];
    
    for (const line of lines) {
      const taskMatch = line.match(/^[\*\-]\s+\[([ x\/])\]\s+(.+)$/i);
      if (taskMatch) {
        const rawMark = taskMatch[1];
        let status = 'pending';
        if (rawMark === '/') status = 'in-progress';
        else if (rawMark.toLowerCase() === 'x') status = 'completed';

        const rawText = taskMatch[2].trim();
        
        // Extract bold title prefix if present
        const boldMatch = rawText.match(/^\*\*([^*]+)\*\*(.*)$/);
        let prefix = '';
        let body = '';
        let cleanText = '';
        
        if (boldMatch) {
          prefix = boldMatch[1].trim();
          body = boldMatch[2].trim();
          cleanText = prefix + ' ' + body;
        } else {
          cleanText = rawText;
        }

        tasks.push({
          status,
          cleanText,
          prefix,
          body
        });
      }
    }

    // 3. Render SVG (Scandinavian Editorial Light Theme)
    const svgWidth = 600;
    const itemSpacing = 16;
    const lineHeight = 20;
    
    let currentY = 85; 
    const renderedItemsG = [];

    for (const task of tasks) {
      const textLines = wrapText(task.cleanText, 62);
      const itemHeight = textLines.length * lineHeight;
      const checkboxY = currentY + 5; 

      // Render Checkbox / Indicator SVG
      let checkboxSvg = '';
      if (task.status === 'completed') {
        checkboxSvg = `
          <!-- Completed Checkbox (Forest Green fill) -->
          <rect x="22" y="${checkboxY - 13}" width="16" height="16" rx="4" fill="#1C352D" stroke="#1C352D" stroke-width="1.5" />
          <path d="M 26 ${checkboxY - 6} L 29 ${checkboxY - 3} L 34 ${checkboxY - 9}" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        `;
      } else if (task.status === 'in-progress') {
        checkboxSvg = `
          <!-- In Progress Checkbox (Soft gold circle/pie) -->
          <circle cx="30" cy="${checkboxY - 5}" r="8" fill="none" stroke="#C29D66" stroke-width="2" />
          <path d="M 30 ${checkboxY - 5} L 30 ${checkboxY - 11} A 6 6 0 0 1 36 ${checkboxY - 5} Z" fill="#C29D66" />
        `;
      } else {
        checkboxSvg = `
          <!-- Pending Checkbox (Muted gray-green border) -->
          <rect x="22" y="${checkboxY - 13}" width="16" height="16" rx="4" fill="none" stroke="#738A80" stroke-width="1.5" />
        `;
      }

      // Render Text lines
      let textLinesSvg = '';
      for (let i = 0; i < textLines.length; i++) {
        const lineY = currentY + (i * lineHeight);
        
        if (task.status === 'completed') {
          // Completed task text (Muted green-gray, line-through)
          textLinesSvg += `<text x="52" y="${lineY}" fill="#738A80" font-family="system-ui, -apple-system, sans-serif" font-size="13.5" opacity="0.5" text-decoration="line-through">${escapeXml(textLines[i])}</text>`;
        } else {
          // Active task text (Bold prefix in Deep Pine, body in deep charcoal)
          if (i === 0 && task.prefix && textLines[0].startsWith(task.prefix)) {
            const restOfFirstLine = textLines[0].slice(task.prefix.length);
            textLinesSvg += `
              <text x="52" y="${lineY}" font-family="system-ui, -apple-system, sans-serif" font-size="13.5">
                <tspan font-weight="600" fill="#1C352D">${escapeXml(task.prefix)}</tspan>
                <tspan fill="#1A2521">${escapeXml(restOfFirstLine)}</tspan>
              </text>
            `;
          } else {
            textLinesSvg += `<text x="52" y="${lineY}" fill="#1A2521" font-family="system-ui, -apple-system, sans-serif" font-size="13.5">${escapeXml(textLines[i])}</text>`;
          }
        }
      }

      renderedItemsG.push(`
        <g class="lc-todo-item">
          ${checkboxSvg}
          ${textLinesSvg}
        </g>
      `);

      currentY += itemHeight + itemSpacing;
    }

    if (tasks.length === 0) {
      renderedItemsG.push(`
        <text x="52" y="${currentY}" fill="#738A80" font-family="system-ui, -apple-system, sans-serif" font-size="13.5" font-style="italic">
          No active tasks on this list.
        </text>
      `);
      currentY += 30;
    }

    const svgHeight = currentY + 45;

    // Build overall SVG using warm sand background and pine accents
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" fill="none">
  <!-- Clean Warm Off-White Background container -->
  <rect width="${svgWidth}" height="${svgHeight}" rx="8" fill="#FBFAF8" stroke="#E5E9E7" stroke-width="1.5" />

  <!-- Header -->
  <text x="22" y="32" fill="#738A80" font-family="system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="600" letter-spacing="1.5">LANTERN CAMP</text>
  <text x="22" y="52" fill="#1C352D" font-family="system-ui, -apple-system, sans-serif" font-size="15.5" font-weight="700">${escapeXml(fileName.replace('.md', '').replace('-todo', ' to-do list').toUpperCase())}</text>
  <line x1="22" y1="62" x2="${svgWidth - 22}" y2="62" stroke="#E5E9E7" stroke-width="1" />

  <!-- Task Items -->
  ${renderedItemsG.join('\n')}

  <!-- Footer -->
  <line x1="22" y1="${svgHeight - 35}" x2="${svgWidth - 22}" y2="${svgHeight - 35}" stroke="#E5E9E7" stroke-width="1" />
  <text x="22" y="${svgHeight - 18}" fill="#738A80" font-family="system-ui, -apple-system, sans-serif" font-size="9.5">LIVE SYNCED: ${formatEstDate(new Date())}</text>
  <text x="${svgWidth - 36}" y="${svgHeight - 18}" fill="#738A80" font-family="system-ui, -apple-system, sans-serif" font-size="9.5" text-anchor="end">LIVE EMAIL AUTO-SYNC</text>
  <circle cx="${svgWidth - 26}" cy="${svgHeight - 21}" r="3" fill="#2D5A27" />
</svg>
    `.trim();

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).send(svg);

  } catch (error) {
    console.error(error);
    serveErrorSvg(res, error.message || 'Internal Server Error');
  }
}

function serveErrorSvg(res, message) {
  const errorSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="80" fill="none">
  <rect width="600" height="80" rx="8" fill="#FDF8F8" stroke="#E8C2C2" stroke-width="1.5" />
  <text x="20" y="32" fill="#8C3B3B" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" letter-spacing="1">ERROR GENERATING WIDGET</text>
  <text x="20" y="55" fill="#5C2D2D" font-family="system-ui, -apple-system, sans-serif" font-size="13">${escapeXml(message)}</text>
</svg>
  `.trim();
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).send(errorSvg);
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}
