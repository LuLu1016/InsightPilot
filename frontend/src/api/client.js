export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function postJSON(path, body) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) throw new Error(`API调用失败: ${resp.status}`);
  return resp.json();
}



