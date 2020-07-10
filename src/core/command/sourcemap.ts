import { ParsedArgs } from "minimist";
import ora from "ora";
import chalk from "chalk";
import { getDevSourceMap as mini_sourcemap } from "miniprogram-ci";
import Config from "../config";
import createProject from "../project";

function init(_: Config, args: ParsedArgs) {
  let { help, h } = args;
  if (help || h) {
    logHelp();
  } else {
    sourcemap(_);
  }
}

function sourcemap(confIns: Config) {
  const { sourcemap, project } = confIns.config;
  const mini_project = createProject(project);
  const spinner = ora().start(chalk.yellow(`拉取sourcemap中... \n`));
  mini_sourcemap({
    project: mini_project,
    ...sourcemap,
  })
    .then(() => {
      spinner.succeed(
        chalk.yellow(`ourcemap拉取成功! 路径:${confIns.cwd}/sourcemap.zip`)
      );
      process.exit(0);
    })
    .catch((err) => {
      spinner.fail(chalk.red(`sourcemap拉取失败:${err} \n`));
      process.exit(1);
    });
}

function logHelp() {
  console.log(`
Usage: mini-ci  sourmap  [--options]

Options:
  --help, -h                                显示帮助文档.
  --version, -v                             显示mini-ci版本.
  --robot,-r                                指定使用哪一个 ci 机器人，可选值：1 ~ 30 (默认: 1)
  --sourceMapSavePath, -sp                  保存sourcemap的路径 (默认: ${process.cwd()}/sourcemap.zip)
  `);
}

export default init;
