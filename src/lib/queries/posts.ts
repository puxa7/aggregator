import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index";
import { feedFollows, posts } from "../db/schema";

export async function createPost(
    title: string,
    url: string,
    description: string | null,
    publishedAt: Date | null,
    feedId: string,
) {
    await db
        .insert(posts)
        .values({ title, url, description, publishedAt, feedId })
        .onConflictDoNothing();
}

export async function getPostsForUser(userId: string, limit: number) {
    // Pobierz ID feedów które śledzi użytkownik
    const follows = await db
        .select({ feedId: feedFollows.feedId })
        .from(feedFollows)
        .where(eq(feedFollows.userId, userId));

    if (follows.length === 0) return [];

    const feedIds = follows.map((f) => f.feedId);

    return db
        .select()
        .from(posts)
        .where(inArray(posts.feedId, feedIds))
        .orderBy(desc(posts.publishedAt))
        .limit(limit);
}