import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {

  const response = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator"
    }
  });

  const xmlString = await response.text();

  const parser = new XMLParser();

  const obiekt = parser.parse(xmlString);

  if (!obiekt.rss.channel) {
    throw new Error("Nie ma channel");
  }

  if (!obiekt.rss.channel.title || !obiekt.rss.channel.link || !obiekt.rss.channel.description) {
    throw new Error("Nie ma link lub title lub description");
  }

  if (!obiekt.rss.channel.item) {
    throw new Error("Nie ma item");
  }

  let items = [];


  if (Array.isArray(obiekt.rss.channel.item)) {
    items = obiekt.rss.channel.item;
  } else {
    items = [obiekt.rss.channel.item];
  }

  let validItems: RSSItem[] = [];

  for (const item of items) {

    if (!item.title ||
      !item.link ||
      !item.description ||
      !item.pubDate) {
      continue;
    } else {
      validItems.push(item);
    }

  }


  return {
    channel: {
      title: obiekt.rss.channel.title,
      link: obiekt.rss.channel.link,
      description: obiekt.rss.channel.description,
      item: validItems,
    }
  }
}
