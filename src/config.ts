import os from 'os';
import path from 'path';
import { readFileSync } from 'node:fs';
import { writeFileSync } from 'node:fs';

type Config = {
    dbUrl: string;
    currentUserName?: string;
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
