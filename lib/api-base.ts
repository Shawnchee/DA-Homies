/**
 * Shared fetch wrappers for Next.js client-side API calls.
 */

export async function getJSON<T>(url: string): Promise<T> {
  const resp = await fetch(url);
  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(error || `GET ${url} failed with status ${resp.status}`);
  }
  return resp.json();
}

export async function postJSON<Req, Res>(url: string, body: Req): Promise<Res> {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(error || `POST ${url} failed with status ${resp.status}`);
  }
  return resp.json();
}

/** 
 * Multipart upload of one or more images to a Supabase Storage bucket. 
 * Matches the interface expected by app/(app)/consult/page.tsx.
 */
export async function uploadPhotos(
  files: File[],
  bucket: string = "consult-photos"
): Promise<{ uploads: { url: string }[] }> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  formData.append("bucket", bucket);

  const resp = await fetch("/api/storage/upload", {
    method: "POST",
    body: formData,
  });

  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(error || "Upload failed");
  }

  // The server returns { urls: string[] } or { uploads: { url: string }[] }
  // Based on the UI usage, we need the latter.
  const data = await resp.json();
  
  // Back-compat: if the API returns { urls: [] }, map it to the expected shape
  if (data.urls && !data.uploads) {
    return {
      uploads: data.urls.map((url: string) => ({ url }))
    };
  }

  return data as { uploads: { url: string }[] };
}
