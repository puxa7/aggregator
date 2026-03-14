# Gator – RSS Feed Aggregator CLI

A powerful command-line tool for managing and aggregating RSS feeds. Fetch posts from multiple feeds, follow them by user, and browse aggregated content directly from your terminal.

## Features

- **User Management**: Register, login, and manage multiple users
- **RSS Feed Management**: Add, remove, and browse RSS feeds
- **Continuous Aggregation**: Automatic background feed scraping with configurable intervals
- **Feed Following**: Users can follow specific feeds
- **Post Browsing**: View the latest posts from followed feeds
- **Database Persistence**: All data stored in PostgreSQL

## Requirements

- **Node.js** 18+ (with npm)
- **PostgreSQL** 12+ running locally or accessible via network
- **npm** 9+ (typically included with Node.js)

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

Ensure PostgreSQL is running, then create the database:

```bash
sudo -u postgres psql
CREATE DATABASE gator;
\q
```

Verify the connection string in `drizzle.config.ts` matches your PostgreSQL setup (default: `postgres://postgres:postgres@localhost:5432/gator?sslmode=disable`).

### 3. Run Database Migrations

```bash
npm run migrate
```

This creates all necessary tables: `users`, `feeds`, `feed_follows`, and `posts`.

### 4. Configure the Application

The application stores config in `~/.gatorconfig.json`. It will be created automatically after your first login.

**First time setup:**
```bash
npm start register myusername
```

This creates a new user and stores the config file in your home directory.

## Running the Application

### General Usage

```bash
npm start <command> [args...]
```

### Example Workflow

```bash
# 1. Register a new user
npm start register alice

# 2. Add an RSS feed
npm start addfeed "Tech News" https://techcrunch.com/feed/

# 3. Follow the feed
npm start follow https://techcrunch.com/feed/

# 4. Start aggregating feeds (runs continuously, press Ctrl+C to stop)
npm start agg 1m

# 5. In another terminal, browse the latest posts
npm start browse 5

# 6. View user's followed feeds
npm start following
```

## Available Commands

### User Management

| Command | Usage | Description |
|---------|-------|-------------|
| `register` | `register <username>` | Create a new user and set as current |
| `login` | `login <username>` | Switch to an existing user |
| `users` | `users` | List all users (marks current user with `(current)`) |
| `reset` | `reset` | Delete all users and data from database |

### Feed Management

| Command | Usage | Description |
|---------|-------|-------------|
| `addfeed` | `addfeed <name> <url>` | Add a new RSS feed and automatically follow it |
| `feeds` | `feeds` | List all available feeds in the database |
| `follow` | `follow <url>` | Subscribe to a feed URL |
| `unfollow` | `unfollow <url>` | Unsubscribe from a feed URL |
| `following` | `following` | List all feeds the current user follows |
| `deletefeed` | `deletefeed <url>` | Delete a feed (owner only) |

### Content Aggregation

| Command | Usage | Description |
|---------|-------|-------------|
| `agg` | `agg <time_between_reqs>` | Start continuous feed fetching loop (see below) |
| `browse` | `browse [limit]` | View latest posts from followed feeds (default: 2 posts) |

### Aggregation Command Details

The `agg` command runs an infinite loop that fetches RSS feeds and saves posts to the database.

**Time Format:**
- `1ms` – milliseconds
- `10s` – seconds
- `5m` – minutes
- `2h` – hours

**Example:**
```bash
# Fetch feeds every 1 minute
npm start agg 1m

# Fetch feeds every 30 seconds
npm start agg 30s
```

**Output:**
```
Collecting feeds every 1m
Fetching feed: Tech News (https://techcrunch.com/feed/)
  Saved: AI startup raises $100M Series B
  Saved: New JavaScript framework released
...
```

**Graceful Shutdown:**
Press `Ctrl+C` to stop the aggregation loop safely.

## Recommended RSS Feeds to Test

```bash
npm start addfeed "TechCrunch" https://techcrunch.com/feed/
npm start addfeed "Hacker News" https://news.ycombinator.com/rss
npm start addfeed "Boot.dev Blog" https://www.boot.dev/blog/index.xml
```

Then follow them and start aggregating!

## Browsing Posts

Once posts are fetched, view them with:

```bash
# Show latest 2 posts (default)
npm start browse

# Show latest 10 posts
npm start browse 10
```

Output example:
```
--- Formulas for Pi
    URL:         https://mathworld.wolfram.com/PiFormulas.html
    Published:   3/14/2026, 3:45:11 PM
    Description: <p>Article URL: <a href="https://mathworld.wolfram.com/PiFormulas.html">...

--- Meta weighing 20% workforce layoffs
    URL:         https://www.foxbusiness.com/technology/meta-eyes-massive-20-workforce-cut...
    Published:   3/14/2026, 3:43:44 PM
    Description: <p>Article URL: <a href="...
```

## Database Schema

The application uses PostgreSQL with the following tables:

- **users** – User accounts with timestamps
- **feeds** – RSS feed URLs and metadata (includes `last_fetched_at` to avoid duplicate fetches)
- **feed_follows** – Junction table linking users to feeds
- **posts** – Individual posts fetched from feeds (includes `published_at` for sorting)

## Development Notes

- Posts are automatically deduplicated by URL (won't create duplicates on re-fetch)
- RSS feed publish dates are parsed flexibly to handle various date formats
- The aggregator respects feed timestamps to avoid unnecessary re-fetching
- All timestamps are stored in UTC

## Troubleshooting

### `Feed not found` or connection errors

Verify PostgreSQL is running and the connection string in `drizzle.config.ts` is correct:

```bash
psql -h localhost -U postgres -d gator
```

### Permission denied on `.gatorconfig.json`

The config file is stored in your home directory. Ensure you have write permissions:

```bash
ls -la ~/.gatorconfig.json
chmod 644 ~/.gatorconfig.json
```

### Posts not appearing after `agg`

1. Verify you've followed at least one feed: `npm start following`
2. Let the `agg` command run for the specified interval
3. Use `npm start browse` to check for posts

## License

ISC
