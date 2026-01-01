# Dokumentasi Perbaikan Input Validation HTTP Endpoint

## 1. Kondisi Sebelum Perbaikan

### Mekanisme Validasi yang Ada

Sebelum perbaikan, endpoint HTTP `POST /api/rooms` hanya melakukan validasi dasar berupa pengecekan keberadaan (existence check):

```typescript
app.post("/api/rooms", (req, res) => {
  const { name, hostName, isPrivate, password, maxPlayers, settings } = req.body;

  if (!name || !hostName) {
    return res.status(400).json({ error: "Room name and host name are required" });
  }
  
  // Input langsung diproses tanpa validasi lebih lanjut
  // ...
});
```

### Risiko Keamanan yang Teridentifikasi

1. **SQL/NoSQL Injection**: 
   - Input seperti `name: "'; DROP TABLE rooms; --"` atau `hostName: "{$ne: null}"` dapat dieksploitasi jika ada database operations yang tidak aman.
   - Query operators seperti `$`, `{}`, `[]` dapat digunakan untuk memanipulasi query operations.

2. **XSS (Cross-Site Scripting)**:
   - Input seperti `name: "<script>alert('XSS')</script>"` atau `hostName: "onerror=alert(1)"` dapat dieksekusi di browser client jika data ditampilkan tanpa sanitization.

3. **Command Injection**:
   - Karakter khusus seperti `;`, `||`, `&&` dapat digunakan untuk injection attacks.

4. **Buffer Overflow / DoS**:
   - Tidak ada pembatasan panjang input, memungkinkan input sangat panjang yang dapat menyebabkan memory issues atau DoS.

5. **HTML/JavaScript Injection**:
   - Tag HTML dan event handlers dapat disuntikkan melalui input fields.

### Contoh Input Berbahaya yang Dapat Melewati Validasi Lama

```javascript
// SQL Injection
POST /api/rooms
{
  "name": "'; DROP TABLE rooms; --",
  "hostName": "Player1"
}

// NoSQL Injection
POST /api/rooms
{
  "name": "My Room",
  "hostName": "{$ne: null}"
}

// XSS
POST /api/rooms
{
  "name": "<script>alert('XSS')</script>",
  "hostName": "Player1"
}

// Command Injection
POST /api/rooms
{
  "name": "Room; rm -rf /",
  "hostName": "Player1"
}

// Buffer Overflow
POST /api/rooms
{
  "name": "a".repeat(10000),
  "hostName": "Player1"
}
```

## 2. Kondisi Sesudah Perbaikan

### Perilaku Sistem Setelah Validasi

Setelah perbaikan, semua input pada endpoint `POST /api/rooms` **harus melewati validasi Zod schema** sebelum diproses:

1. **Input yang Valid**: Input yang memenuhi semua kriteria (format, panjang, karakter yang diizinkan) akan diproses secara normal.

2. **Input yang Tidak Valid**: Input yang mengandung karakter berbahaya, melebihi panjang maksimum, atau tidak sesuai format akan **DITOLAK** dengan error message yang generic dan aman.

3. **Rejection, Bukan Sanitization**: Input berbahaya tidak dibersihkan atau di-modify, melainkan langsung ditolak. Ini mencegah partial injection atau bypass melalui sanitization.

### Contoh Perilaku Baru

**✅ Input Valid:**
```javascript
POST /api/rooms
{
  "name": "My Game Room",
  "hostName": "Player1",
  "password": "secure123"
}
// Response: 200 OK - Room created successfully
```

**❌ Input dengan SQL Injection:**
```javascript
POST /api/rooms
{
  "name": "'; DROP TABLE --",
  "hostName": "Player1"
}
// Response: 400 Bad Request - "Invalid input. Please check your input and try again."
```

**❌ Input dengan XSS:**
```javascript
POST /api/rooms
{
  "name": "<script>alert(1)</script>",
  "hostName": "Player1"
}
// Response: 400 Bad Request - "Invalid input. Please check your input and try again."
```

**❌ Input Terlalu Panjang:**
```javascript
POST /api/rooms
{
  "name": "a".repeat(100),
  "hostName": "Player1"
}
// Response: 400 Bad Request - "Invalid input. Please check your input and try again."
```

**❌ Input dengan Query Operators:**
```javascript
POST /api/rooms
{
  "name": "My Room",
  "hostName": "$ne"
}
// Response: 400 Bad Request - "Invalid input. Please check your input and try again."
```

## 3. Cara Perbaikan

### 3.1 Penggunaan Zod Schema

**File**: `server/validation.ts`

Menggunakan Zod sebagai **single source of truth** untuk validasi. Schema dibuat untuk setiap tipe input:

```typescript
// Schema untuk room name (max 50 karakter)
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

// Schema untuk host name (max 30 karakter)
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

// Schema untuk password (4-50 karakter, optional)
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

// Schema untuk create room request
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
```

### 3.2 Pembatasan Panjang Input

Setiap schema memiliki batasan panjang yang ketat:

| Input Type | Min Length | Max Length |
|------------|------------|------------|
| `name` (roomName) | 1 | 50 |
| `hostName` | 1 | 30 |
| `password` | 4 | 50 |

Validasi panjang dilakukan di level Zod schema menggunakan `.min()` dan `.max()`.

### 3.3 Pendekatan Allowlist Karakter

Menggunakan **allowlist approach** (bukan blacklist) untuk menentukan karakter yang diizinkan:

**Room Name & Host Name**:
```typescript
const ALPHANUMERIC_SPACE_DASH_UNDERSCORE = /^[a-zA-Z0-9\s\-_]+$/;
```
- ✅ **Diizinkan**: Huruf (a-z, A-Z), angka (0-9), spasi, dash (-), underscore (_)
- ❌ **Ditolak**: Semua karakter lain

**Password**:
```typescript
const PASSWORD_PATTERN = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
```
- ✅ **Diizinkan**: Huruf, angka, dan karakter khusus yang aman
- ❌ **Ditolak**: Query operators ($, {}, [])

### 3.4 Penolakan Input Berbahaya

Input berbahaya **DITOLAK** melalui custom Zod refinements, bukan di-sanitize:

**Dangerous Patterns yang Ditolak**:
```typescript
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
```

**Custom Refinement Functions**:
- `rejectDangerousPatterns()`: Mengecek apakah input mengandung pattern berbahaya
- `rejectHtmlTags()`: Mengecek apakah input mengandung HTML tags

### 3.5 Integrasi ke HTTP Endpoint

**File**: `server/routes.ts`

**Sebelum**:
```typescript
app.post("/api/rooms", (req, res) => {
  const { name, hostName, ... } = req.body;
  if (!name || !hostName) {
    return res.status(400).json({ error: "Room name and host name are required" });
  }
  // Langsung diproses tanpa validasi lebih lanjut
});
```

**Sesudah**:
```typescript
import { CreateRoomSchema, validateInput } from "./validation";

app.post("/api/rooms", (req, res) => {
  // Validasi input menggunakan Zod schema
  const validation = validateInput(CreateRoomSchema, req.body);
  
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }

  // Input sudah divalidasi, aman untuk digunakan
  const { name, hostName, ... } = validation.data;
  // Hanya diproses jika validasi berhasil
});
```

### 3.6 Error Handling yang Aman

Error messages yang dikembalikan adalah **generic** dan tidak mengungkap detail validasi internal:

```typescript
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): ValidationResult<T> {
  try {
    const data = schema.parse(input);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return generic error, jangan expose detail validasi
      return {
        success: false,
        error: "Invalid input. Please check your input and try again.",
      };
    }
    return { success: false, error: "Validation failed" };
  }
}
```

Ini mencegah attacker mengetahui pola validasi yang digunakan dan mencoba bypass.

## 4. Manfaat Perbaikan

### 4.1 Keamanan Aplikasi

1. **Pencegahan Injection Attacks**:
   - SQL/NoSQL injection dicegah melalui penolakan keyword dan operator query
   - Command injection dicegah melalui allowlist karakter
   - Script injection dicegah melalui penolakan HTML tags dan JavaScript patterns

2. **Pencegahan XSS**:
   - HTML tags dan event handlers ditolak sebelum masuk ke sistem
   - Input berbahaya tidak pernah mencapai client-side rendering

3. **Pembatasan Input**:
   - Panjang input dibatasi untuk mencegah buffer overflow dan DoS
   - Format input dikontrol ketat melalui allowlist

4. **Defense in Depth**:
   - Validasi dilakukan di entry point (HTTP endpoint)
   - Input berbahaya ditolak sebelum masuk ke processing layer

### 4.2 Stabilitas Sistem

1. **Konsistensi Data**:
   - Semua data yang masuk sistem memiliki format yang konsisten
   - Mengurangi kemungkinan error karena data tidak valid

2. **Predictable Behavior**:
   - Sistem selalu menolak input yang tidak valid dengan cara yang sama
   - Tidak ada edge cases karena input yang "sebagian valid"

3. **Resource Protection**:
   - Pembatasan panjang input mencegah memory exhaustion
   - Mencegah DoS melalui input yang sangat panjang

4. **Error Handling yang Robust**:
   - Error handling yang konsisten di endpoint
   - Tidak ada crash karena input yang tidak terduga

### 4.3 Kemudahan Maintenance

1. **Single Source of Truth**:
   - Semua aturan validasi terpusat di `server/validation.ts`
   - Perubahan aturan validasi hanya perlu dilakukan di satu tempat

2. **Type Safety**:
   - Zod schemas memberikan type inference untuk TypeScript
   - Compile-time checking untuk memastikan validasi digunakan dengan benar

3. **Dokumentasi Implisit**:
   - Schemas berfungsi sebagai dokumentasi aturan validasi
   - Developer dapat melihat dengan jelas apa yang diizinkan dan tidak diizinkan

4. **Testability**:
   - Schemas dapat di-test secara terpisah
   - Validasi logic terpisah dari business logic, memudahkan unit testing

5. **Extensibility**:
   - Mudah menambahkan schema baru untuk input type baru
   - Mudah menambahkan refinement baru untuk pattern berbahaya baru

## Ringkasan Implementasi

### Files yang Dibuat/Dimodifikasi

1. **`server/validation.ts`** (NEW):
   - Zod schemas untuk HTTP endpoint input
   - Custom refinement functions untuk penolakan pattern berbahaya
   - Helper function `validateInput()` untuk validasi dengan error handling yang aman

2. **`server/routes.ts`** (MODIFIED):
   - Import validation schemas
   - Validasi di HTTP POST `/api/rooms`
   - **TIDAK menyentuh WebSocket handlers**

### Dependencies yang Digunakan

- **Zod** (sudah ada): Library untuk schema validation
- **Native JavaScript**: Regex patterns dan string operations untuk allowlist dan pattern matching

### Tidak Ada Dependency Baru

Semua perbaikan menggunakan library yang sudah ada di project (`zod`), tanpa menambahkan dependency baru.

### Scope Perbaikan

- ✅ **Hanya HTTP endpoint** `POST /api/rooms` yang diperbaiki
- ✅ **Tidak menyentuh WebSocket** handlers atau message validation
- ✅ **Fokus pada input validation** untuk `name`, `hostName`, dan `password`

