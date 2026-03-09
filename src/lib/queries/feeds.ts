import { and, eq } from "drizzle-orm";
import { db } from "../db/index";
import { feedFollows, feeds, users } from "../db/schema";

export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db.insert(feeds).values({ name, url, user_id: userId }).returning();
    return result;
}

export async function getFeeds() {
    const result = await db.select().from(feeds).innerJoin(users, eq(feeds.user_id, users.id));
    return result;
}

export async function getFeedByUrl(url: string) {
    const [feed] = await db.select().from(feeds).where(eq(feeds.url, url));

    return feed ?? null;
}

export async function createFeedFollow(userId: string, feedId: string) {
    const [newFeedFollow] = await db.insert(feedFollows).values({ userId, feedId }).returning();

    const [row] = await db
        .select({
            id: feedFollows.id,
            createdAt: feedFollows.createdAt,
            updatedAt: feedFollows.updatedAt,
            userId: feedFollows.userId,
            feedId: feedFollows.feedId,
            userName: users.name,
            feedName: feeds.name,
        })
        .from(feedFollows)
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .where(eq(feedFollows.id, newFeedFollow.id));

    return row;

}

export async function getFeedFollowByUserAndFeed(userId: string, feedId: string) {
    const [follow] = await db
        .select({
            id: feedFollows.id,
            createdAt: feedFollows.createdAt,
            updatedAt: feedFollows.updatedAt,
            userId: feedFollows.userId,
            feedId: feedFollows.feedId,
            userName: users.name,
            feedName: feeds.name,
        })
        .from(feedFollows)
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feedId)));

    return follow ?? null;
}

export async function getFeedFollowsForUser() {

    const user_and_rss = await db
        .select({ userName: users.name, feedName: feeds.name })
        .from(feedFollows)
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id));

    return user_and_rss;

}

export async function deleteFeedFollow(userId: string, feedUrl: string) {
    const feed = await getFeedByUrl(feedUrl);
    if (!feed) {
        throw new Error(`Feed with URL ${feedUrl} not found`);
    }
    await db
        .delete(feedFollows)
        .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feed.id)));
}