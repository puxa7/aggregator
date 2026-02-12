export type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler; //handler to funkcja
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...cmdArgs: string[]): void {
    const handler = registry[cmdName];

    if (!handler) {
        throw new Error(`Unknown command: ${cmdName}`);
    }
    handler(cmdName, ...cmdArgs);
}