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
  let code;
  mini_build(mini_project, {
    ...build,
    reporter: function (...args) {
      console.log(`构建信息:`, ...args, "\n");
    },
  })
    .then(() => {
      code = 0;
      spinner.succeed(chalk.yellow(`项目构建成功!`));
    })
    .catch((err) => {
      code = 1;
      spinner.fail(chalk.red(`项目构建失败:${err} \n`));
    })
    .finally(() => {
      process.exit(code);
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
