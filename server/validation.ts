import { z } from "zod";

/**
 * Validation schemas untuk HTTP endpoint input
 * Menggunakan allowlist approach untuk mencegah injection attacks
 * Input berbahaya akan DITOLAK, bukan dibersihkan
 */

// Regex untuk allowlist karakter: huruf, angka, spasi, dash, underscore
const ALPHANUMERIC_SPACE_DASH_UNDERSCORE = /^[a-zA-Z0-9\s\-_]+$/;

// Regex untuk password: huruf, angka, dan karakter khusus yang aman (tanpa query operators)
const PASSWORD_PATTERN = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;

// Daftar pattern berbahaya yang harus ditolak
const DANGEROUS_PATTERNS = [
  // SQL keywords
  /SELECT/i, /INSERT/i, /UPDATE/i, /DELETE/i, /DROP/i, /CREATE/i, /ALTER/i,
  /EXEC/i, /EXECUTE/i, /UNION/i, /WHERE/i, /FROM/i, /TABLE/i, /DATABASE/i,
  /SCHEMA/i, /TRUNCATE/i, /GRANT/i, /REVOKE/i,
  // NoSQL operators
  /\$ne/i, /\$gt/i, /\$lt/i, /\$gte/i, /\$lte/i, /\$in/i, /\$nin/i,
  /\$exists/i, /\$regex/i, /\$or/i, /\$and/i, /\$not/i, /\$nor/i,
  /\$where/i, /\$text/i, /\$search/i, /\$elemMatch/i,
  // Injection patterns
  /--/, /\/\*/, /\*\//, /';/, /";/, /\|\|/, /&&/,
  // Script tags dan event handlers
  /<script/i, /<\/script>/i, /javascript:/i, /onerror=/i, /onload=/i,
  /onclick=/i, /eval\(/i, /Function\(/i, /setTimeout\(/i, /setInterval\(/i,
  // Query operators
  /\$/, /\{\{/, /\}\}/, /\[\[/, /\]\]/,
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
 * - Hanya huruf, angka, spasi, dash, underscore (allowlist)
 * - Tidak boleh mengandung keyword berbahaya atau HTML tags
 */
export const RoomNameSchema = z
  .string()
  .min(1, "Room name is required")
  .max(50, "Room name must be 50 characters or less")
  .refine(
    (val) => ALPHANUMERIC_SPACE_DASH_UNDERSCORE.test(val),
    "Room name can only contain letters, numbers, spaces, dashes, and underscores"
  )
  .refine(rejectDangerousPatterns, "Room name contains invalid content")
  .refine(rejectHtmlTags, "Room name cannot contain HTML tags");

/**
 * Schema untuk host name (player name)
 * - Max 30 karakter
 * - Hanya huruf, angka, spasi, dash, underscore (allowlist)
 * - Tidak boleh mengandung keyword berbahaya atau HTML tags
 */
export const HostNameSchema = z
  .string()
  .min(1, "Host name is required")
  .max(30, "Host name must be 30 characters or less")
  .refine(
    (val) => ALPHANUMERIC_SPACE_DASH_UNDERSCORE.test(val),
    "Host name can only contain letters, numbers, spaces, dashes, and underscores"
  )
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
