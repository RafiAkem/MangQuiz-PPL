import { RoomNameSchema } from "../server/validation";

const samples = [
  "Battle Arena",
  "Grocery from Home",
  "Where to go?",
  "admin$room",
  "<script>alert(1)</script>",
  "  ",
  "Комната №1",
  "スペシャルルーム",
  "Room #1 (Alpha)",
  "SELECT * FROM users",
];

for (const s of samples) {
  const res = RoomNameSchema.safeParse(s);
  console.log({ sample: s, ok: res.success, error: res.success ? null : res.error.issues.map((i) => i.message) });
}