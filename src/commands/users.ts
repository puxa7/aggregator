import { createUser, getUser, deleteAllUsers, getUsers } from "src/lib/queries/users.js";
import { createFeed, getFeeds, createFeedFollow, getFeedByUrl,getFeedFollowsForUser } from "src/lib/queries/feeds.js";
import { setUser, readConfig } from "../config.js"
import { fetchFeed } from "src/rss.js";
import { printFeed } from "./helpers.js";
import { userInfo } from "node:os";
import { feedFollows } from "src/lib/db/schema.js";

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

export default async function handlerAddFeed(cmdName: string, ...args: string[]) {
    if (args.length !== 2) {
        throw new Error(`usage: ${cmdName} <name> <url>`);
    }

    const name = args[0];
    const url = args[1];

    const userObiekt = await getUser(readConfig().currentUserName);

    const zwrocone = await createFeed(name, url, userObiekt.id);
    printFeed(zwrocone, userObiekt);
   
    
}

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

export async function handlerFollow(cmdName: string, ...args: string[]) {

    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <url>`);
    }

    const config = readConfig();
    const user = await getUser(config.currentUserName);

    if (!user) throw new Error("No user selected");

    const url = args[0];

    const feed = await getFeedByUrl(url);
    if (!feed) {
        console.error("Feed not found for URL:", url);
    }

    const follow = await createFeedFollow(user.id, feed.id);

    ///
    //console.log("name of the feed");

    ///
    //console.log("current user");

    console.log(`Now following "${follow.feedName}" as ${follow.userName}`);
}

export async function handlerFollowing(cmdName: string){

    const config = readConfig();
    const user = await getUser(config.currentUserName);

    if (!user) throw new Error("No user selected");
    const zwrocone = await getFeedFollowsForUser();

    for(const zwr of zwrocone){
        if (user.name === zwr.userName)
        console.log(zwr);  
    }

    


    
}