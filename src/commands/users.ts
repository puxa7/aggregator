import { createUser, getUser, deleteAllUsers, getUsers } from "src/lib/queries/users.js";
import { createFeed, getFeeds, createFeedFollow, getFeedByUrl, getFeedFollowsForUser, getFeedFollowByUserAndFeed, deleteFeedFollow } from "src/lib/queries/feeds.js";
import { setUser, readConfig } from "../config.js"
import { fetchFeed } from "src/rss.js";
import { printFeed } from "./helpers.js";
import { UserCommandHandler } from "./commands.js";

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
    await fetchFeed("https://www.wagslane.dev/index.xml");
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

