/**
 * POST /api/upload
 *
 * Multipart in: one or more files in the "files" field, plus a "bucket" text
 * field ("consult-photos" | "owner-photos").
 *
 * Returns: { uploads: { url?: string; base64?: string; mediaType: string }[] }
 *
 * Falls back to inline base64 when Supabase admin credentials or the bucket
 * are missing — callers can pass either url or base64 to /api/consult.
 */

import { ApiError } from "@/lib/api-types";
import { errorResponse, json } from "@/lib/api-response";
import { uploadPhotoBytes, type PhotoBucket } from "@/lib/storage";

const ALLOWED_BUCKETS: PhotoBucket[] = ["consult-photos", "owner-photos"];
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB per file
const MAX_FILES = 6;

/**
 * Sniff the first bytes of a buffer and return a recognised image MIME, or
 * null if the magic bytes don't match one of the four formats we accept.
 * MIME from the browser is attacker-controlled (untrusted multipart `type`),
 * so we don't trust File.type for security decisions.
 */
function sniffImageMime(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return "image/png";
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "image/jpeg";
  // GIF: 47 49 46 38 (GIF8)
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  )
    return "image/gif";
  // WebP: 52 49 46 46 .. .. .. .. 57 45 42 50  (RIFF....WEBP)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return "image/webp";
  return null;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData().catch(() => {
      throw new ApiError(400, "expected multipart/form-data with 'files'");
    });

    const bucketRaw = form.get("bucket");
    const bucket = (typeof bucketRaw === "string" ? bucketRaw : "consult-photos") as PhotoBucket;
    if (!ALLOWED_BUCKETS.includes(bucket)) {
      throw new ApiError(400, `bucket must be one of ${ALLOWED_BUCKETS.join(", ")}`);
    }

    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) throw new ApiError(400, "at least one file required");
    if (files.length > MAX_FILES) {
      throw new ApiError(400, `too many files (max ${MAX_FILES})`);
    }

    for (const f of files) {
      if (f.size === 0) throw new ApiError(400, `empty file: ${f.name}`);
      if (f.size > MAX_FILE_BYTES) {
        throw new ApiError(413, `file ${f.name} exceeds ${MAX_FILE_BYTES} bytes`);
      }
      if (!f.type.startsWith("image/")) {
        throw new ApiError(400, `file ${f.name} is not an image (type=${f.type})`);
      }
    }

    const uploads = await Promise.all(
      files.map(async (f) => {
        const buf = await f.arrayBuffer();
        const sniffed = sniffImageMime(new Uint8Array(buf, 0, Math.min(16, buf.byteLength)));
        if (!sniffed) {
          throw new ApiError(
            400,
            `file ${f.name} is not a recognised image (PNG/JPEG/GIF/WebP)`,
          );
        }
        // Use the sniffed MIME, not the client-claimed one.
        return uploadPhotoBytes(bucket, buf, sniffed);
      }),
    );

    return json({ uploads });
  } catch (err) {
    return errorResponse(err);
  }
}
