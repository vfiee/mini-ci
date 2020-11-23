import ora from "ora";
import chalk from "chalk";
import { getDevSourceMap as miniSourcemap } from "miniprogram-ci";
import { Config } from "./config";
import createProject from "../project";

function sourcemap(confIns: Config) {
  const { sourcemap, project } = confIns.config;
  const miniProject = createProject(project);
  const spinner = ora().start(chalk.yellow(`拉取sourcemap中... \n`));
  let code: number;
  miniSourcemap({
    project: miniProject,
    ...sourcemap,
  })
    .then(() => {
      code = 0;
      spinner.succeed(
        chalk.yellow(`sourcemap拉取成功! 路径: ${sourcemap.sourceMapSavePath}`)
      );
    })
    .catch((err) => {
      code = 1;
      spinner.fail(chalk.red(`sourcemap拉取失败:${err} \n`));
    })
    .finally(() => {
      process.exit(code);
    });
}

export function logHelp() {
  console.log(`
  Usage: mini-ci  sourmap  [--options]

  Options:
    --help, -h                                显示帮助文档.
    --version, -v                             显示mini-ci版本.
    --robot,-r                                指定使用哪一个 ci 机器人，可选值：1 ~ 30 (默认: 1)
    --sourceMapSavePath, -sp                  保存sourcemap的路径 (默认: ${process.cwd()}/sourcemap.zip)

  Preset:
    --name                       项目名称(全局配置)
  `);
}

export default sourcemap;
