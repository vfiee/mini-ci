import {
  ConfigOptions,
  BaseObject,
  ProjectOptions,
  UploadOptions,
  PreviewOptions,
  BuildOptions,
  SourceMapOptions,
  GlobalConfig,
} from "../../types";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import { ParsedArgs } from "minimist";
import {
  getValueByKeys,
  getUserHomeDir,
  getLocalDate,
  get,
  runError,
} from "../../utils";

export class Config {
  private path: string;
  public envArgs: ParsedArgs;
  public config?: ConfigOptions | BaseObject;
  public globalConfig?: GlobalConfig;
  constructor(envArgs: ParsedArgs, isRoot: boolean = false) {
    this.envArgs = envArgs;
    this.path = this.getPath(isRoot);
    const _config = this.getConfig(isRoot);
    isRoot
      ? (this.globalConfig = _config as GlobalConfig)
      : (this.config = _config);
  }
  get cwd(): string {
    return process.cwd();
  }
  get rootConfigPath(): string {
    return `${getUserHomeDir()}/.mini-ci.json`;
  }
  get baseConfig(): BaseObject {
    return Object.assign(
      {},
      this.getDefBaseConf(),
      getValueByKeys(this.envArgs, [["showStatusLog", "sl"]])
    );
  }
  ls() {
    let keys = this.getRootConfigKeys();
    if (!keys.length) {
      runError({
        message: `全局配置中没有项目配置`,
      });
    }
    let _default = this.globalConfig["default"];
    keys = keys.map((key) => {
      let config = this.globalConfig[key];
      if (!!_default && key === _default) {
        key = `${chalk.green("*")}${key}`;
      }
      return ` ${key} --- ${JSON.stringify(config)} \n`;
    });
    console.log(keys.join(``));
  }
  get() {
    let { name } = this.envArgs;
    let current = this.globalConfig[name];
    if (!current) {
      runError({
        message: `全局配置中不存在${name}的项目`,
      });
    }
    console.log(chalk.yellow(JSON.stringify(current, null, 4)));
  }
  set() {
    let { name, default: isDefault, path: confPath } = this.envArgs;
    if (!name) {
      runError({
        message: `设置全局配置必须设置项目名name`,
      });
    } else if (!path) {
      runError({
        message: `设置全局配置必须设置配置路径`,
      });
    }
    try {
      let confIns = new Config({ _: [], file: confPath });
      this.globalConfig = {
        ...this.globalConfig,
        [name]: confIns.config,
      };
      this.setRootConfig();
      console.log(chalk.green(`🎉 配置成功`));
    } catch (error) {
      console.log(chalk.red(`配置失败 \n`, error));
      process.exit(1);
    }
    isDefault && this.use(name);
  }
  use(name?: string) {
    let { name: envName } = this.envArgs;
    const _name = name || envName;
    let keys = this.getRootConfigKeys();
    if (!keys.length || !keys.includes(_name)) {
      runError({
        message: `全局配置中没有${_name}项目`,
      });
    }
    this.globalConfig = {
      ...this.globalConfig,
      default: _name,
    };
    this.setRootConfig();
  }
  default() {
    let keys = this.getRootConfigKeys();
    let _default: string = this.globalConfig["default"] as string;
    if (!keys.length) {
      runError({
        message: `全局配置中没有项目配置`,
      });
    } else if (!_default) {
      runError({
        message: `全局配置中没有默认配置`,
      });
    }
    console.log(
      chalk.yellow(JSON.stringify(this.globalConfig[_default], null, 4))
    );
  }
  private setRootConfig() {
    fs.writeFileSync(
      this.rootConfigPath,
      JSON.stringify(this.globalConfig, null, 4)
    );
  }
  private getRootConfigKeys(filterKyes: string[] = ["default"]) {
    let keys = Object.keys(this.globalConfig);
    if (!keys.length) return keys;
    return keys.filter((key) => !filterKyes.includes(key));
  }
  private getPath(isRoot: boolean = false): string {
    if (isRoot) return this.rootConfigPath;
    let { file, f } = this.envArgs;
    let file_path = file || f;
    if (file_path) {
      file_path = path.isAbsolute(file_path)
        ? file_path
        : path.resolve(file_path);
      if (fs.existsSync(file_path)) {
        return file_path;
      }
      console.log(chalk.yellow(`${file_path} 文件不存在!`));
    }
    const paths: BaseObject[] = [
      {
        path: `${this.cwd}/mini-ci.json`,
        msg: `${this.cwd}/mini-ci.json 文件不存在`,
      },
      {
        path: `${this.rootConfigPath}`,
        msg: `${this.rootConfigPath} 文件不存在`,
      },
    ];
    let _path: string;
    for (let i = 0, len = paths.length; i < len; i++) {
      let { path: fPath, msg } = paths[i];
      if (!fPath || !fs.existsSync(fPath) || path.extname(fPath) !== ".json") {
        console.log(chalk.yellow(msg));
      } else {
        _path = fPath;
        break;
      }
    }
    if (!_path) {
      console.log(chalk.red(`配置文件路径不存在, 请配置后重试!`));
      process.exit(1);
    }
    console.log(`path:`, _path);
    return _path;
  }
  private getConfig(isRoot: boolean = false): ConfigOptions | BaseObject {
    let config: BaseObject;
    if (isRoot && !fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, "{}");
    }
    try {
      config = require(this.path);
    } catch (error) {
      console.error(chalk.red(`Can't read the config path:${this.path} \n`));
      process.exit(1);
    }
    return isRoot ? config : this.mergeConfig(config);
  }
  private mergeConfig(config: BaseObject): ConfigOptions {
    const project = this.getProjectConfig(config);
    const upload = this.getUploadConfig(config);
    const preview = this.getPreviewConfig(config);
    const build = this.getBuildConfig(config);
    const sourcemap = this.getSourcemapConfig(config);
    return { project, upload, preview, build, sourcemap };
  }
  private getProjectConfig(config: BaseObject): ProjectOptions {
    let { project } = config;
    return Object.assign(
      {},
      this.getDefProjectCof(),
      project,
      getValueByKeys(this.envArgs, [
        ["appid", "id"],
        ["projectPath", "proPath"],
        ["privateKeyPath", "priPath"],
        ["type", "t"],
        ["ignores", "ig"],
      ])
    );
  }
  private getUploadConfig(config: BaseObject): UploadOptions {
    const { setting = {}, ...args } = get(config, "upload", {});
    return Object.assign(
      {},
      this.getDefUploadConf(),
      {
        ...args,
        setting: {
          ...setting,
          ...getValueByKeys(this.envArgs, [
            "es6",
            "es7",
            "minify",
            "codeProtect",
            "minifyJS",
            "minifyWXML",
            "minifyWXSS",
            "autoPrefixWXSS",
          ]),
        },
      },
      getValueByKeys(this.envArgs, [
        "ver",
        "test",
        ["desc", "d"],
        ["robot", "r"],
      ])
    );
  }
  private getPreviewConfig(config: BaseObject): PreviewOptions {
    const { setting = {}, ...args } = get(config, "upload", {});
    return Object.assign(
      {},
      this.getDefPreviewConf(),
      {
        ...args,
        setting: {
          ...setting,
          ...getValueByKeys(this.envArgs, [
            "es6",
            "es7",
            "minify",
            "codeProtect",
            "minifyJS",
            "minifyWXML",
            "minifyWXSS",
            "autoPrefixWXSS",
          ]),
        },
      },
      getValueByKeys(this.envArgs, [
        ["desc", "d"],
        ["robot", "r"],
        ["qrcodeFormat", "qrFormat", "qrf"],
        ["qrcodeOutputDest", "qrDest", "qrd"],
        ["pagePath", "pp", "p"],
        ["searchQuery", "sq", "q"],
      ])
    );
  }
  private getBuildConfig(config: BaseObject): BuildOptions {
    return Object.assign(
      {},
      this.getDefBuildConf(),
      getValueByKeys(this.envArgs, ["igno"])
    );
  }
  private getSourcemapConfig(config: BaseObject): SourceMapOptions {
    return Object.assign(
      {},
      this.getDefSourcemapConf(),
      getValueByKeys(this.envArgs, [
        ["robot", "r"],
        ["sourceMapSavePath", "sp"],
      ])
    );
  }
  private getDefProjectCof(): BaseObject {
    return {
      type: "miniProgram",
    };
  }
  private getDefUploadConf(): BaseObject {
    return {
      robot: 1,
      desc: getLocalDate() + " 上传",
    };
  }
  private getDefPreviewConf(): BaseObject {
    let { qrcodeFormat } = getValueByKeys(this.envArgs, [
      ["qrcodeFormat", "qrFormat", "qrf"],
    ]);
    let isBase64 = qrcodeFormat === "base64";
    return {
      robot: 1,
      qrcodeFormat: "terminal",
      desc: getLocalDate() + " 预览",
      qrcodeOutputDest: `${this.cwd}/preview${isBase64 ? "" : ".jpg"}`,
    };
  }
  private getDefBaseConf(): BaseObject {
    return {
      showStatusLog: false,
    };
  }
  private getDefBuildConf(): BaseObject {
    return {};
  }
  private getDefSourcemapConf(): SourceMapOptions {
    return {
      robot: 1,
      sourceMapSavePath: `${this.cwd}/sourcemap.zip`,
    };
  }
}
export function logHelp() {
  console.log(`Usage: mini-ci config  [--options]

Commands:
  ls                           显示全部配置列表名称.
  set                          设置项目配置.
  get                          获取项目配置详情.
  use                          设置为默认(当前使用).
  default                      显示当前默认配置详情.

Options:
  --help, -h                   显示帮助文档.
  --version, -v                显示版本号.
  --name                       指定设置或获取配置的项目名称.
  --path                       指定设置项目配置的路径.
  --default                    设为默认(仅set命令时生效).
`);
}
const allowCommand = ["ls", "get", "set", "use", "default"];
function runConfig(_: Config) {
  let command = _.envArgs._[1];
  if (!command) {
    logHelp();
    process.exit(0);
  }
  if (allowCommand.includes(command)) {
    _[command]();
  } else {
    console.log(chalk.red(`command mini-ci config ${command} is not found!`));
  }
  process.exit();
}
export default runConfig;
