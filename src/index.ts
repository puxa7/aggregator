import { type CommandsRegistry, CommandHandler } from "./commands/commands.js";
import { registerCommand, runCommand } from "./commands/commands.js"
import { handlerLogin } from "./commands/users.js";

function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("usage: cli <command> [args...]");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);
  const commandRegistry: CommandsRegistry = {};

  registerCommand(commandRegistry, "login", handlerLogin)


  try {
    runCommand(commandRegistry, cmdName, ...cmdArgs)
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error running command ${cmdName}: ${err.message}`);
    } else {
      console.error(`Error running command ${cmdName}: ${err}`);
    }
    process.exit(1);
  }

}


main();