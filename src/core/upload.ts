import { upload as mini_upload } from "miniprogram-ci";
import createProject from "./project";
import { BaseObject } from "../types/index";
import Config from "./config";
import ora, { Ora } from "ora";
import chalk from "chalk";
import { ParsedArgs } from "minimist";

const spinnerMap: Map<string, Ora> = new Map();
function onProgressUpdate(progress: MiniProgramCI.ITaskStatus): void {
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

function upload(config: Config, args: BaseObject) {
  let { project, upload } = config;
  const mini_project = createProject(project);
  const spinner = ora().start(chalk.yellow(`项目上传中... \n`));
  mini_upload({
    project: mini_project,
    ...upload,
    onProgressUpdate,
  })
    .then((res) => {
      spinner.succeed(chalk.green(`项目上传成功 \n`));
    })
    .catch((err) => {
      spinner.fail(chalk.red(`项目上传失败:${err} \n`));
    })
    .finally(() => {
      process.exit();
    });
}

function logHelp() {
  console.log(`
Usage: mini-ci upload  [--options]

Options:
  --help, -h                   显示帮助文档.
  --version, -v                显示mini-ci版本.
  --file, -f                   指定配置文件路径,如果未指定,默认取当前工作目录下的
                                mini-ci.json 文件.
  `);
}

function init(_: Config, args: ParsedArgs) {
  let { help, h } = args;
  if (help || h) {
    logHelp();
  } else {
    upload(_, args);
  }
}

export default init;
