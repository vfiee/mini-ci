import chalk from "chalk";
import minimist from "minimist";
import build, { logHelp as buildHelp } from "command/build";
import preview, { logHelp as previewHelp } from "command/preview";
import sourcemap, { logHelp as sourcemapHelp } from "command/sourcemap";
import upload, { logHelp as uploadHelp } from "command/upload";
import config, {
  Config,
  GlobalConfig,
  logHelp as logConfigHelp,
} from "command/config";
import proxy from "command/proxy";
import { ActionMap } from "../types";
import { get } from "utils";

const args = minimist(process.argv.slice(2));
const command = args._[0];
const _version = chalk.yellow(
  `🥁 mini-ci v${require("../package.json").version}`
);

function init() {
  const { help: vHelp, h, version, v } = args;
  if (!command || version || v || vHelp || h) {
    (version || v) && logVersion();
    (vHelp || h || !command) && logHelp(command);
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
  const fn = get(actionMap, command);
  const _Config = command === "config" ? GlobalConfig : Config;
  fn ? fn(new _Config(args)) : cmdNotFound(command);
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
      config: logConfigHelp,
      proxy,
    };
    get(helpMap, cmd, () => cmdNotFound(cmd))();
  }
}

function cmdNotFound(cmd: string) {
  console.log(
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
  mini-ci upload               上传代码，对应小程序开发者工具的上传.
  mini-ci build                构建 npm，对应小程序开发者工具的: 菜单-工具-构建npm.
  mini-ci preview              预览代码，对应小程序开发者工具的预览.
  mini-ci proxy                代理，配置 miniprogram-ci 的网络请求代理方式 (tip:暂不支持).
  mini-ci sourcemap            获取最近上传版本的 sourceMap.
  mini-ci config               mini-ci全局配置.

Options:
  --help, -h                   显示帮助文档.
  --version, -v                显示mini-ci版本.
  --file, -f                   指定配置文件路径,如果未指定,则根据以下顺序查找,若全部没有,则查找全局配置,没有则报错!
                               查找顺序: .minicirc mini-ci.json minici.json package.json下的mini-ci字段 mini-ci.js
  `);
}

export default init;
