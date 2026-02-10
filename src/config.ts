import os from 'os';
import path from 'path';
import { readFileSync } from 'node:fs';
import { writeFileSync } from 'node:fs';

type Config = {
    dbUrl: string;
    currentUserName?: string;
}

type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandsRegistry = Record<string, CommandHandler>;




export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler){
    registry[cmdName] = handler;
}

//handler to inaczej "obsługiwacz"


export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]){
    if (!(cmdName in registry)) {
        throw Error("Unknown command");
    }

    registry[cmdName](cmdName, ...args);

}

export function handlerLogin(cmdName: string, ...args: string[]){
    if (args.length === 0){
        throw Error("Command login requires a username.");
    }
    setUser(args[0]);
    console.log(`User set to ${args[0]}`);
}

export function setUser(name: string) {
    const odczytanyCfg = readConfig();
    writeConfig({ dbUrl: odczytanyCfg.dbUrl, currentUserName: name });
}

function getConfigFilePath(): string {
    return path.join(os.homedir(), '.gatorconfig.json');
}

export function readConfig(): Config {

    const obiekt = readFileSync(getConfigFilePath(), "utf-8");

    return validateConfig(obiekt);
}

function writeConfig(cfg: Config): void {
    const nowyObj = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName,
    }
    writeFileSync(getConfigFilePath(), JSON.stringify(nowyObj), "utf-8")
}

function validateConfig(rawConfig: any): Config {
    const xd = JSON.parse(rawConfig);

    if (typeof xd.db_url !== "string") {
        throw Error("Validation failed");
        
    }
    if (xd.current_user_name !== undefined){
        if (typeof xd.current_user_name !== "string"){
            throw Error("Validation failed");
        }
    }

    if (xd.current_user_name !== undefined){
        return {dbUrl:xd.db_url, currentUserName: xd.current_user_name};
    }else{
        return {dbUrl:xd.db_url};
    }
    

}
