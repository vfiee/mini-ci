import ora from "ora";
import chalk from "chalk";
import { preview as mini_preview } from "miniprogram-ci";
import Config from "./config";
import { ParsedArgs } from "minimist";
import { getLocalDate, get, voidFn } from "../utils";
import createProject from "./project";
import { onProgressUpdate } from "./upload";
import { PreviewOptions } from "../types";

function preview(confIns: Config): void {
  const { preview, project } = confIns.config;
  const mini_project = createProject(project);
  console.log(confIns.config);
  // return;
  const spinner = ora().start(chalk.yellow(`项目上传中... \n`));
  const progressFn = !!confIns.baseConfig.showStatusLog
    ? (eve) => onProgressUpdate(eve as MiniProgramCI.ITaskStatus)
    : voidFn;
  mini_preview({
    project: mini_project,
    ...preview,
    onProgressUpdate: progressFn,
  })
    .then(() => {
      spinner.succeed(
        chalk.green(`上传成功,${getPreviewSuccessMsg(preview)}\n`)
      );
      process.exit(0);
    })
    .catch((err) => {
      spinner.fail(chalk.red(`项目上传失败:${err} \n`));
      process.exit(1);
    });
}

function getPreviewSuccessMsg(config: PreviewOptions) {
  let { qrcodeFormat, qrcodeOutputDest } = config;
  return get(
    {
      terminal: `请扫描终端二维码体验`,
      image: `图片已生成,路径:${qrcodeOutputDest}`,
      base64: `图片base64已生成,路径:${qrcodeOutputDest}`,
    },
    qrcodeFormat,
    `上传成功`
  );
}

function init(_: Config, args: ParsedArgs) {
  let { help, h } = args;
  if (help || h) {
    logHelp();
  } else {
    preview(_);
  }
}

function logHelp() {
  console.log(`
Usage: mini-ci preview  [--options]

Options:
  --help, -h                                显示帮助文档.
  --version, -v                             显示mini-ci版本.
  --desc, -d                                自定义备注信息 (默认值:${getLocalDate()} 预览).
  --robot, -r                               指定使用CI机器ID,可选值[1-30],上传成功后,开发者信息显示: ci机器人1 (默认值:1)
  --qrcodeFormat, --qrFormat, --qrf         指定返回二维码的格式,可选 "terminal" "image" "base64" (默认:terminal)
  --qrcodeOutputDest, --qrDest, --qrd       指定二维码保存路径 (默认:${process.cwd()}/preview.jpg)
  --pagePath, --pp, --p                     预览页面路径
  --searchQuery, --sq, --q                  预览页面路径启动参数
  --es6                                     启用ES6.
  --es7                                     启用ES7.
  --minify                                  启用代码压缩.
  --codeProtect                             启用代码混淆.
  --minifyJS                                开启压缩JS代码.
  --minifyWXML                              开启压缩WXML代码.
  --minifyWXSS                              开启压缩WXSS代码.
  --autoPrefixWXSS                          开启自动补全WXSS.
  `);
}

export default init;
