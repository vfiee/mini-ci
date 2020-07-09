import { upload as mini_upload } from "miniprogram-ci";
import createProject from "./project";
import Config from "./config";
import ora, { Ora } from "ora";
import chalk from "chalk";
import { ParsedArgs } from "minimist";
import { getLocalDate, voidFn } from "../utils";

const spinnerMap: Map<string, Ora> = new Map();
export function onProgressUpdate(progress: MiniProgramCI.ITaskStatus): void {
  let { message, status, id } = progress;
  const spinner = spinnerMap.has(id)
    ? spinnerMap.get(id)
    : ora(chalk.bgGrey(message));
  if (status === "doing") {
    spinner.start(`\n`);
  } else if (status === "done") {
    spinner.succeed(chalk.green(`${message}上传成功!`));
  } else {
    spinner.fail(chalk.red(`上传失败:${message}`));
  }
}

function upload(confIns: Config) {
  let { project, upload } = confIns.config;
  const mini_project = createProject(project);
  const spinner = ora().start(chalk.yellow(`项目上传中... \n`));
  const progressFn = !!confIns.baseConfig.showStatusLog
    ? (eve) => onProgressUpdate(eve as MiniProgramCI.ITaskStatus)
    : voidFn;
  mini_upload({
    project: mini_project,
    ...upload,
    onProgressUpdate: progressFn,
  })
    .then(() => {
      spinner.succeed(
        chalk.green(`项目上传成功! 点击查看: https://mp.weixin.qq.com \n`)
      );
      process.exit(0);
    })
    .catch((err) => {
      spinner.fail(chalk.red(`项目上传失败:${err} \n`));
      process.exit(1);
    });
}

function logHelp() {
  console.log(`
Usage: mini-ci upload  [--options]

Options:
  --help, -h                   显示帮助文档.
  --version, -v                显示mini-ci版本.
  --ver                        自定义版本号.
  --desc, -d                   自定义备注信息 (默认值:${getLocalDate()} 上传).
  --robot, -r                  指定使用CI机器ID,可选值[1-30],上传成功后,开发者信息显示: ci机器人1 (默认值:1)
  --test                       开启测试 (默认:false).
  --es6                        启用ES6.
  --es7                        启用ES7.
  --minify                     启用代码压缩.
  --codeProtect                启用代码混淆.
  --minifyJS                   开启压缩JS代码.
  --minifyWXML                 开启压缩WXML代码.
  --minifyWXSS                 开启压缩WXSS代码.
  --autoPrefixWXSS             开启自动补全WXSS.
  `);
}

function init(_: Config, args: ParsedArgs) {
  let { help, h } = args;
  if (help || h) {
    logHelp();
  } else {
    upload(_);
  }
}

export default init;
