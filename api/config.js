export const githubConfig = {
  owner: process.env.GITHUB_OWNER || 'Rob-Boss',
  repo: process.env.GITHUB_REPO || 'task-manager',
  pat: process.env.GITHUB_PAT,
  branch: process.env.GITHUB_BRANCH || 'main'
};

export async function githubFetch(path, options = {}) {
  const { owner, repo, pat, branch } = githubConfig;
  
  if (!pat) {
    throw new Error('Missing GITHUB_PAT environment variable.');
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  
  const headers = {
    'Authorization': `token ${pat}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Vercel-LCMP',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...options.headers
  };

  const res = await fetch(url, { 
    cache: 'no-store',
    ...options, 
    headers 
  });
  return res;
}
