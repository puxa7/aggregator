import { type CommandsRegistry } from "./config.js"
import { registerCommand } from "./config.js";
import { handlerLogin } from "./config.js";
import { runCommand } from "./config.js";


function main() {




  try {
    const registry: CommandsRegistry = {};

   registerCommand(registry, "login", handlerLogin);

    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.error("No command provided.");
      process.exit(1);
    }

    const cmdName = args[0];
    const cmdArgs = args.slice(1);
    
    runCommand(registry, cmdName, ...cmdArgs);

    
    
  } catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}






}

main();