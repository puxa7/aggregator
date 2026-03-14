import { createUser, getUser, deleteAllUsers, getUsers } from "src/lib/queries/users.js";
import {
  createFeed, getFeeds, createFeedFollow, getFeedByUrl,
  getFeedFollowsForUser, getFeedFollowByUserAndFeed, deleteFeedFollow,
  markFeedFetched, getNextFeedToFetch, deleteFeedByUrl,  
} from "src/lib/queries/feeds.js";import { setUser, readConfig } from "../config.js"
import { fetchFeed } from "src/rss.js";
import { printFeed } from "./helpers.js";
import { UserCommandHandler } from "./commands.js";
import { createPost, getPostsForUser } from "src/lib/queries/posts.js";


export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <name>`);
    }
    const userName = args[0];
    const uzytkownik = await getUser(userName);


    if (uzytkownik) {
        setUser(userName);
        console.log("User switched successfully!");

    } else {
        throw new Error(`User ${userName} doesn't exist!`)
    }
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <name>`);
    }

    const userName = args[0];
    const uzytkownik = await getUser(userName);

    if (!uzytkownik) {
        const utworzony = await createUser(userName);
        setUser(utworzony.name);
        console.log(`New user ${userName} succesfully added`);
        console.log(utworzony);

    } else {
        throw new Error(`User ${userName} already exist!`)
    }
}

export async function handlerReset(cmdName: string, ...args: string[]) {
    await deleteAllUsers();
    process.exit(0);
}

export async function handlerUsers(cmdName: string, ...args: string[]) {

    const users = await getUsers();

    const config = readConfig();

    for (const user of users) {
        if (user.name === config.currentUserName) {
            console.log(`${user.name} (current)`);
        } else {
            console.log(user.name);
        }
    }
    process.exit(0);
}

export async function handlerAgg(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <time_between_reqs>`);
    }

    const timeBetweenRequests = parseDuration(args[0]);
    console.log(`Collecting feeds every ${args[0]}`);

    scrapeFeeds().catch(handleError);

    const interval = setInterval(() => {
        scrapeFeeds().catch(handleError);
    }, timeBetweenRequests);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });
}

export const handlerAddFeed: UserCommandHandler = async (cmdName, user, ...args) => {
    if (args.length !== 2) {
        throw new Error(`usage: ${cmdName} <name> <url>`);
    }

    const [feedName, url] = args;
    const createdFeed = await createFeed(feedName, url, user.id);
    printFeed(createdFeed, user);

    const feed = await getFeedByUrl(url);
    if (!feed) {
        console.error("Feed not found for URL:", url);
        return;
    }

    const follow = await createFeedFollow(user.id, feed.id);
    console.log(`Now following "${follow.feedName}" as ${follow.userName}`);
};

export async function handlerFeeds(cmdName: string) {

    const result = await getFeeds();

    //console.log(result);

    for (const feed of result) {
        console.log(`Name of the feed: ${feed.feeds.name}`);
        console.log(`URL of the feed: ${feed.feeds.url}`);
        console.log(`User that created the feed : ${feed.users.name}`);
        console.log(``);
    }

}

export const handlerFollow: UserCommandHandler = async (cmdName, user, ...args) => {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <url>`);
    }

    const url = args[0];

    const feed = await getFeedByUrl(url);
    if (!feed) {
        console.error("Feed not found for URL:", url);
        return;
    }

    const alreadyFollowing = await getFeedFollowByUserAndFeed(user.id, feed.id);
    if (alreadyFollowing) {
        console.log(`Already following "${alreadyFollowing.feedName}" as ${alreadyFollowing.userName}`);
        return;
    }

    const follow = await createFeedFollow(user.id, feed.id);

    console.log(`Now following "${follow.feedName}" as ${follow.userName}`);
};

export const handlerUnfollow: UserCommandHandler = async (cmdName, user, ...args) => {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <url>`);
    }

    const url = args[0];
    await deleteFeedFollow(user.id, url);
    console.log(`Unfollowed feed at ${url}`);
};

export const handlerFollowing: UserCommandHandler = async (_cmdName, user) => {
    const zwrocone = await getFeedFollowsForUser();

    for (const zwr of zwrocone) {
        if (user.name === zwr.userName) {
            console.log(zwr);
        }
    }
};

function parseDuration(durationStr: string): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    if (!match) {
        throw new Error(`Invalid duration: ${durationStr}. Use formats like 1ms, 1s, 1m, 1h`);
    }
    const value = parseInt(match[1], 10);
    switch (match[2]) {
        case "ms": return value;
        case "s":  return value * 1000;
        case "m":  return value * 60 * 1000;
        case "h":  return value * 60 * 60 * 1000;
        default:   throw new Error(`Unknown unit: ${match[2]}`);
    }
}

async function scrapeFeeds() {
    const feed = await getNextFeedToFetch();
    if (!feed) {
        console.log("No feeds to fetch");
        return;
    }
    await markFeedFetched(feed.id);
    console.log(`Fetching feed: ${feed.name} (${feed.url})`);
    const rssFeed = await fetchFeed(feed.url);
    for (const item of rssFeed.channel.item) {
        let publishedAt: Date | null = null;
        try {
            const parsed = new Date(item.pubDate);
            if (!isNaN(parsed.getTime())) {
                publishedAt = parsed;
            }
        } catch {
            // zostaw null jeśli format nieznany
        }
        await createPost(
            item.title,
            item.link,
            item.description ?? null,
            publishedAt,
            feed.id,
        );
        console.log(`  Saved: ${item.title}`);
    }
}

function handleError(err: unknown) {
    if (err instanceof Error) {
        console.error(`Error: ${err.message}`);
    } else {
        console.error(`Error: ${err}`);
    }
}



export const handlerDeleteFeed: UserCommandHandler = async (_cmdName, user, ...args) => {
  if (args.length !== 1) throw new Error(`usage: deletefeed <url>`);
  const url = args[0];
  const feed = await getFeedByUrl(url);
  if (!feed) {
    console.log(`Feed not found: ${url}`);
    return;
  }
  if (feed.user_id !== user.id)  {
    throw new Error("You are not the owner of this feed");
  }
  await deleteFeedByUrl(url);
  console.log(`Deleted feed ${feed.name} (${url})`);
};

export const handlerBrowse: UserCommandHandler = async (_cmdName, user, ...args) => {
    const limit = args.length >= 1 ? parseInt(args[0], 10) : 2;
    if (isNaN(limit) || limit < 1) {
        throw new Error("limit must be a positive number");
    }
    const userPosts = await getPostsForUser(user.id, limit);
    if (userPosts.length === 0) {
        console.log("No posts found. Follow some feeds and run `agg` first.");
        return;
    }
    for (const post of userPosts) {
        console.log(`\n--- ${post.title}`);
        console.log(`    URL:         ${post.url}`);
        console.log(`    Published:   ${post.publishedAt?.toLocaleString() ?? "unknown"}`);
        if (post.description) {
            const snippet = post.description.slice(0, 120).replace(/\s+/g, " ");
            console.log(`    Description: ${snippet}...`);
        }
    }
};