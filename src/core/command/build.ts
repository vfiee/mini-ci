import ora from "ora";
import chalk from "chalk";
import { packNpm as miniBuild } from "miniprogram-ci";
import { Config } from "./config";
import createProject from "../project";

function build(confIns: Config) {
  const { build, project } = confIns.config;
  const miniProject = createProject(project);
  const spinner = ora().start(chalk.yellow(`项目构建中... \n`));
  let code;
  miniBuild(miniProject, {
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

export function logHelp() {
  console.log(`
  Usage: mini-ci upload  [--options]

  Options:
    --help, -h                                显示帮助文档.
    --version, -v                             显示mini-ci版本.
    --igno                                    构建npm忽略的规则
    
  Preset:
    --name                       项目名称(全局配置)
  `);
}

export default build;
