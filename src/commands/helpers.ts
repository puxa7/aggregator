import { users, feeds } from "src/lib/db/schema";

export type User = typeof users.$inferSelect;
export type Feed = typeof feeds.$inferSelect;

export function printFeed(feed: Feed, user: User) {
  console.log("Dodany feed:");
  console.log("  Id:", feed.id);
  console.log("  Nazwa:", feed.name);
  console.log("  URL:", feed.url);
  console.log("  Użytkownik:", user.name);
  console.log("  user_id:", feed.user_id);
  console.log("  created_at:", feed.createdAt);
  console.log("  updated_at:", feed.updatedAt);
}