// client.ts: the only file that calls fetch. Every request to the server goes through here.

// Gets a URL and returns its JSON. Throws if the server answers with an error status.
export async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }
  const data: unknown = await response.json();
  return data;
}
