import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { feeds } from "../db/schema";

/*
gator=# SELECT * FROM feeds;
 id | created_at | updated_at | name | url | user_id 
----+------------+------------+------+-----+---------
(0 rows)

*/

export async function createFeed(name: string, url: string, userId: string){
    const [result] = await db.insert(feeds).values({name, url, user_id: userId}).returning();
    return result;
}

