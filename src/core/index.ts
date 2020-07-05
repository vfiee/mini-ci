import path from "path";
import chalk from "chalk";
import minimist from "minimist";
import help from "./help";
import build from "./build";
import preview from "./preview";
import proxy from "./proxy";
import sourcemap from "./sourcemap";
import upload from "./upload";
import Config from "./config";
import { ActionMap } from "../types";
import { get } from "../utils";

const argv = process.argv.slice(2);
const args = minimist(argv);
let command = args._[0];
const pkg_path = path.resolve(__dirname, "../package.json");
const pkg = require(pkg_path);
const { help: v_help, h, _, version, v, path: v_Path } = args;
const config = new Config(v_Path);

export default () => {
  const actionMap: ActionMap = {
    help,
    build,
    proxy,
    upload,
    preview,
    sourcemap,
  };
  if (!command) {
    if (version | v) {
      logVersion();
      return;
    }
    (v_help || h || _.length === 0) && (command = "help");
  }
  !!command &&
    get(actionMap, command, () => commandNotFound(command))(args, config);
};

function logVersion() {
  console.log(chalk.yellow(`🥁mini-ci v${pkg.version}`));
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
