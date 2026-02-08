import { readConfig } from "./config.js"
import { setUser } from "./config.js";


function main() {
  setUser("Maciej");
  console.log(readConfig())
}

main();