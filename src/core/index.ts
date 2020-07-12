import path from "path";
import chalk from "chalk";
import minimist from "minimist";
import build, { logHelp as buildHelp } from "./command/build";
import preview, { logHelp as previewHelp } from "./command/preview";
import sourcemap, { logHelp as sourcemapHelp } from "./command/sourcemap";
import upload, { logHelp as uploadHelp } from "./command/upload";
import config, { Config, logHelp as configHelp } from "./command/config";
import proxy from "./command/proxy";
import { ActionMap } from "../types";
import { get } from "../utils";

const argv = process.argv.slice(2);
const args = minimist(argv);
let command = args._[0];
const pkg_path = path.resolve(__dirname, "../package.json");
const pkg = require(pkg_path);
const { help: v_help, h, version, v } = args;
const _version = chalk.yellow(`🥁 mini-ci v${pkg.version}`);

function init() {
  if (version || v || v_help || h || !command) {
    (version || v) && logVersion();
    (v_help || h || !command) && logHelp(command);
    process.exit(0);
  }
  const actionMap: ActionMap = {
    build,
    proxy,
    config,
    upload,
    preview,
    sourcemap,
  };
  let fn = get(actionMap, command);
  fn ? fn(new Config(args, command === "config")) : cmdNotFound(command);
}

function logVersion() {
  console.log(_version);
}
function logHelp(cmd: string) {
  if (!cmd) {
    miniHelp();
  } else {
    const helpMap = {
      build: buildHelp,
      upload: uploadHelp,
      preview: previewHelp,
      sourcemap: sourcemapHelp,
      config: configHelp,
      proxy,
    };
    get(helpMap, cmd, () => cmdNotFound(cmd))();
  }
}

function cmdNotFound(cmd: string) {
  console.error(
    chalk.red(`Unknown Command: '${cmd}'
  try the mini-ci -h command to see the supported commands
  `)
  );
  process.exit(1);
}
function miniHelp() {
  console.log(`${_version}

Usage: mini-ci [command]  [--options]

Commands:
  mini-ci build                上传代码，对应小程序开发者工具的上传.
  mini-ci upload               构建 npm，对应小程序开发者工具的: 菜单-工具-构建npm.
  mini-ci preview              预览代码，对应小程序开发者工具的预览.
  mini-ci proxy                代理，配置 miniprogram-ci 的网络请求代理方式 (tip:暂不支持).
  mini-ci sourcemap            获取最近上传版本的 sourceMap.
  mini-ci config               配置全局mini-ci.

Options:
  --help, -h                   显示帮助文档.
  --version, -v                显示mini-ci版本.
  --file, -f                   指定配置文件(json)路径,如果未指定,默认当前工作目录下的mini-ci.json 文件.
  `);
}

export default init;
