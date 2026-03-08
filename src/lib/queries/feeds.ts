import { ConsoleLogWriter, eq, sql } from "drizzle-orm";
import { db } from "../db/index";
import { feedFollows, feeds, users } from "../db/schema";

/*
gator=# SELECT * FROM feeds;
 id | created_at | updated_at | name | url | user_id 
----+------------+------------+------+-----+---------
(0 rows)

*/

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

export async function getFeedFollowsForUser() {
    /*Ta funkcja powinna znaleźć wszystkie kanały RSS, które śledzi konkretny użytkownik.
     W wyniku ma być nazwa użytkownika oraz nazwa kanału RSS.*/

    /*SELECT users.name, feeds.name FROM feed_follows
    INNER JOIN users
    ON feed_follows.user_id = users.id
    INNER JOIN feeds
    ON feed_follows.feed_id = feeds.id;*/



     /* const user_and_rss = await db.execute(sql`
      SELECT users.name, feeds.name FROM feed_follows
        INNER JOIN users
        ON feed_follows.user_id = users.id
        INNER JOIN feeds
        ON feed_follows.feed_id = feeds.id;
        `);*/

    const user_and_rss = await db
        .select({ userName: users.name, feedName: feeds.name })
        .from(feedFollows)
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id));

    

    return user_and_rss;

}