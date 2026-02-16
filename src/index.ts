import { type CommandsRegistry } from "./commands/commands.js";
import { registerCommand, runCommand } from "./commands/commands.js"
import { handlerLogin, handlerRegister, handlerReset } from "./commands/users.js";

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