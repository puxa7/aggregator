import { setUser } from "../config.js"

export function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <name>`);
    }
    const userName = args[0];
    setUser(userName);
    console.log("User switched successfully!");
}