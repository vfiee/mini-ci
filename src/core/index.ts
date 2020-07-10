import path from "path";
import chalk from "chalk";
import minimist from "minimist";
import help from "./command/help";
import build from "./command/build";
import preview from "./command/preview";
import proxy from "./command/proxy";
import sourcemap from "./command/sourcemap";
import upload from "./command/upload";
import Config from "./config";
import { ActionMap } from "../types";
import { get } from "../utils";

const argv = process.argv.slice(2);
const args = minimist(argv);
let command = args._[0];
const pkg_path = path.resolve(__dirname, "../package.json");
const pkg = require(pkg_path);
const { help: v_help, h, _, version, v } = args;

export default () => {
  const actionMap: ActionMap = {
    help,
    build,
    proxy,
    upload,
    preview,
    sourcemap,
  };
  if (version | v) {
    logVersion();
    return;
  }
  if (!command) {
    (v_help || h || _.length === 0) && (command = "help");
  }
  const config = new Config(args);
  !!command &&
    get(actionMap, command, () => commandNotFound(command))(config, args);
};

function logVersion() {
  console.log(chalk.yellow(` 🥁 mini-ci v${pkg.version}`));
}

function commandNotFound(cmd: string) {
  console.error(
    chalk.red(`
    Unknown Command: '${cmd}'
    try the mini-ci -h command to see the supported commands
  `)
  );
  process.exit(1);
}
