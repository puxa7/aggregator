import {
  type CommandsRegistry,
  middlewareLoggedIn,
  registerCommand,
  runCommand,
} from "./commands/commands.js";
import  {
  handlerAddFeed,
  handlerLogin,
  handlerRegister,
  handlerReset,
  handlerUsers,
  handlerAgg,
  handlerFeeds,
  handlerFollow,
  handlerFollowing,
  handlerUnfollow,
} from "./commands/users.js";


async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("usage: cli <command> [args...]");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);
  const commandRegistry: CommandsRegistry = {};

  registerCommand(commandRegistry, "login", handlerLogin);
  registerCommand(commandRegistry, "register", handlerRegister);
  registerCommand(commandRegistry, "reset", handlerReset);
  registerCommand(commandRegistry, "users", handlerUsers);
  registerCommand(commandRegistry, "agg", handlerAgg);
  registerCommand(
    commandRegistry,
    "addfeed",
    middlewareLoggedIn(handlerAddFeed),
  );
  registerCommand(commandRegistry, "feeds", handlerFeeds);
  registerCommand(
    commandRegistry,
    "follow",
    middlewareLoggedIn(handlerFollow),
  );
  registerCommand(
    commandRegistry,
    "unfollow",
    middlewareLoggedIn(handlerUnfollow),
  );
  registerCommand(
    commandRegistry,
    "following",
    middlewareLoggedIn(handlerFollowing),
  );

  try {
    await runCommand(commandRegistry, cmdName, ...cmdArgs)
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error running command ${cmdName}: ${err.message}`);
    } else {
      console.error(`Error running command ${cmdName}: ${err}`);
    }
    process.exit(1);
  }

  process.exit(0)

}


main();