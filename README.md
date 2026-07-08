# ⛺ Lantern Camp Marketing Portal (LCMP)

A premium, responsive, and responsive Bento Grid styled landing portal acting as a centralized homepage for all Lantern Camp internal trackers, documents, and analytics tools. 

---

## 🎨 Project Setup & Design Features

*   **Design System:** Styled to match the Scandinavian Wilderness branding guidelines of Lantern Camp (Fraunces serif headings, warm linen gradients, dark forest green accents, glassmorphic grids).
*   **Active Features:**
    *   **Live Opportunities Count:** Fetches live count of pending marketing opportunities from `https://lucys-whirled.vercel.app/api/opportunities`.
    *   **Media Slideshow:** Automatically cycles through high-quality photography selects on the media tile background.
    *   **Interactive Blueprint SVG:** Features a custom vector layout stenciled background for the press kit tile.

---

## 🌐 Deployment & Configuration

This project is configured as a standalone Vercel project served at **[lcmp.vercel.app](https://lcmp.vercel.app)**.

### Local Development
To serve and test the portal locally, run a local web server from this directory. For example, using Python:
```bash
python3 -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.
