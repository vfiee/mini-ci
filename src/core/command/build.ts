import { ParsedArgs } from "minimist";
import ora from "ora";
import chalk from "chalk";
import { packNpm as mini_build } from "miniprogram-ci";
import Config from "../config";
import createProject from "../project";

function init(_: Config, args: ParsedArgs) {
  let { help, h } = args;
  if (help || h) {
    logHelp();
  } else {
    build(_);
  }
}

function build(confIns: Config) {
  const { build, project } = confIns.config;
  const mini_project = createProject(project);
  const spinner = ora().start(chalk.yellow(`项目构建中... \n`));
  mini_build(mini_project, build)
    .then((res) => {
      spinner.succeed(chalk.yellow(`项目构建成功`));
      console.log(res);
    })
    .catch((err) => {
      spinner.fail(chalk.red(`项目构建失败:${err} \n`));
      process.exit(1);
    });
}

function logHelp() {
  console.log(`
Usage: mini-ci upload  [--options]

Options:
  --help, -h                                显示帮助文档.
  --version, -v                             显示mini-ci版本.
  --igno                                    构建npm忽略的规则
  `);
}

export default init;
