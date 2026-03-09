import { User } from "./helpers";
import { readConfig } from "../config.js";
import { getUser } from "src/lib/queries/users.js";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

export type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;

export type MiddlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): Promise<void> {
    registry[cmdName] = handler; //handler to funkcja
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...cmdArgs: string[]): Promise<void> {
    const handler = registry[cmdName];

    if (!handler) {
        throw new Error(`Unknown command: ${cmdName}`);
    }
    await handler(cmdName, ...cmdArgs);
}


export const middlewareLoggedIn: MiddlewareLoggedIn = (handler) => {
    return async (cmdName: string, ...args: string[]) => {
        const config = readConfig();
        const userName = config.currentUserName;
        const user = await getUser(userName);
        if (!user) {
            throw new Error(`User ${userName} not found`);
        }
        return handler(cmdName, user, ...args);
    };
};
