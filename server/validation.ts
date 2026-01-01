import { z } from "zod";

/**
 * Validation schemas untuk HTTP endpoint input
 * Menggunakan allowlist approach untuk mencegah injection attacks
 * Input berbahaya akan DITOLAK, bukan dibersihkan
 */

// Regex untuk allowlist karakter nama ruangan/nama pemain:
// - Izinkan karakter printable termasuk karakter non-ASCII, namun tolak tag HTML dan control characters.
// - Untuk menghindari masalah kompatibilitas dengan target TS, gunakan pola sederhana yang
//   tidak membutuhkan Unicode property escapes. Validation tambahan (DANGEROUS_PATTERNS dan HTML
//   checks) tetap akan menolak konten berbahaya.
const ROOM_NAME_PATTERN = /^[^\u0000-\u001F<>]{1,50}$/;

// Regex untuk password: huruf, angka, dan karakter khusus yang aman (tanpa query operators)
const PASSWORD_PATTERN = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;

// Daftar pattern berbahaya yang harus ditolak. Untuk mengurangi false positives,
// gunakan word boundaries pada keyword SQL sehingga kata-kata biasa seperti "from"
// atau "where" tidak otomatis ditolak when used in ordinary text.
const DANGEROUS_PATTERNS = [
  // SQL keywords (match whole words)
  /\bSELECT\b/i, /\bINSERT\b/i, /\bUPDATE\b/i, /\bDELETE\b/i, /\bDROP\b/i, /\bCREATE\b/i, /\bALTER\b/i,
  /\bEXEC(?:UTE)?\b/i, /\bUNION\b/i, /\bTABLE\b/i, /\bDATABASE\b/i,
  /\bSCHEMA\b/i, /\bTRUNCATE\b/i, /\bGRANT\b/i, /\bREVOKE\b/i,
  // NoSQL operators
  /\$ne/i, /\$gt/i, /\$lt/i, /\$gte/i, /\$lte/i, /\$in/i, /\$nin/i,
  /\$exists/i, /\$regex/i, /\$or/i, /\$and/i, /\$not/i, /\$nor/i,
  /\$where/i, /\$text/i, /\$search/i, /\$elemMatch/i,
  // Injection patterns
  /--/, /\/\*/, /\*\//, /';/, /";/, /\|\|/, /&&/,
  // Script tags dan event handlers
  /<script/i, /<\/script>/i, /javascript:/i, /onerror=/i, /onload=/i,
  /onclick=/i, /eval\(/i, /Function\(/i, /setTimeout\(/i, /setInterval\(/i,
  // Templating and operator characters that are suspicious in names
  /\$\{/, /\{\{/, /\}\}/, /\[\[/, /\]\]/,
];

/**
 * Custom Zod refinement untuk mengecek dangerous patterns
 */
function rejectDangerousPatterns(value: string): boolean {
  return !DANGEROUS_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * Custom Zod refinement untuk mengecek HTML/script tags
 */
function rejectHtmlTags(value: string): boolean {
  const htmlTagPattern = /<[^>]*>/g;
  return !htmlTagPattern.test(value);
}

/**
 * Schema untuk room name
 * - Max 50 karakter
 * - Mengizinkan huruf (termasuk non-ASCII), angka, spasi, dan tanda baca umum
 * - Tidak boleh mengandung keyword berbahaya, operator templating, atau HTML tags
 */
export const RoomNameSchema = z
  .string()
  .min(1, "Room name is required")
  .max(50, "Room name must be 50 characters or less")
  .refine((val) => val.trim().length > 0, "Room name cannot be only whitespace")
  .transform((v) => v.trim())
  .refine((val) => ROOM_NAME_PATTERN.test(val), "Room name contains invalid characters")
  .refine(rejectDangerousPatterns, "Room name contains invalid content")
  .refine(rejectHtmlTags, "Room name cannot contain HTML tags");

/**
 * Schema untuk host name (player name)
 * - Max 30 karakter
 * - Mengizinkan huruf (termasuk non-ASCII), angka, spasi, dan tanda baca umum
 * - Tidak boleh mengandung keyword berbahaya, operator templating, atau HTML tags
 */
export const HostNameSchema = z
  .string()
  .min(1, "Host name is required")
  .max(30, "Host name must be 30 characters or less")
  .refine((val) => val.trim().length > 0, "Host name cannot be only whitespace")
  .transform((v) => v.trim())
  .refine((val) => ROOM_NAME_PATTERN.test(val), "Host name contains invalid characters")
  .refine(rejectDangerousPatterns, "Host name contains invalid content")
  .refine(rejectHtmlTags, "Host name cannot contain HTML tags");

/**
 * Schema untuk room password
 * - Max 50 karakter
 * - Min 4 karakter (jika ada)
 * - Boleh mengandung karakter khusus yang aman
 * - Tidak boleh mengandung query operators atau keyword berbahaya
 */
export const RoomPasswordSchema = z
  .string()
  .min(4, "Password must be at least 4 characters")
  .max(50, "Password must be 50 characters or less")
  .refine(
    (val) => PASSWORD_PATTERN.test(val),
    "Password contains invalid characters"
  )
  .refine(rejectDangerousPatterns, "Password contains invalid content")
  .refine(rejectHtmlTags, "Password cannot contain HTML tags")
  .optional();

/**
 * Schema untuk create room request (HTTP POST /api/rooms)
 */
export const CreateRoomSchema = z.object({
  name: RoomNameSchema,
  hostName: HostNameSchema,
  isPrivate: z.boolean().optional().default(false),
  password: RoomPasswordSchema,
  maxPlayers: z.number().int().min(2).max(8).optional().default(4),
  settings: z
    .object({
      difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
      category: z.string().optional().default("all"),
      questionCount: z.number().int().min(5).max(25).optional().default(10),
    })
    .optional(),
});

/**
 * Helper function untuk validate input dan return error message yang aman
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): ValidationResult<T> {
  try {
    const data = schema.parse(input);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return generic error message untuk keamanan
      // Jangan expose detail validasi internal
      return {
        success: false,
        error: "Invalid input. Please check your input and try again.",
      };
    }
    return {
      success: false,
      error: "Validation failed",
    };
  }
}
