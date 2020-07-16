import {
  ConfigOptions,
  BaseObject,
  ProjectOptions,
  UploadOptions,
  PreviewOptions,
  BuildOptions,
  SourceMapOptions,
  PathData,
  GlobalConfigOptions,
  CheckOptions
} from "../../types";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import { ParsedArgs } from "minimist";
import {
  getValueByKeys,
  getUserHomeDir,
  runError,
  compact,
  flatCollection,
} from "../../utils";
export class Config {
  envArgs: ParsedArgs;
  config: ConfigOptions;
  constructor(envArgs: ParsedArgs) {
    this.envArgs = envArgs;
    this.config = this.getConfig(this.getPath());
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
  private getPath(): PathData {
    let { file, f } = this.envArgs;
    let file_path = file || f;
    if (file_path) {
      file_path = path.isAbsolute(file_path)
        ? file_path
        : path.resolve(file_path);
      if (fs.existsSync(file_path)) {
        return {
          path: file_path,
          isRoot: false,
        };
      }
      console.log(chalk.yellow(`提醒: ${file_path} 文件不存在!`));
    }
    let paths: BaseObject[] = [
      {
        path: `${this.cwd}/mini-ci.json`,
        msg: `提醒: ${this.cwd}/mini-ci.json 文件不存在!`,
      },
      {
        isRootPath: true,
        path: `${this.rootConfigPath}`,
        msg: `提醒: ${this.rootConfigPath} 文件不存在!`,
      },
    ];
    let _path: string;
    let _isRoot: boolean;
    for (let i = 0, len = paths.length; i < len; i++) {
      let { path: fPath, msg, isRootPath } = paths[i];
      if (!fPath || !fs.existsSync(fPath) || path.extname(fPath) !== ".json") {
        console.log(chalk.yellow(msg));
        continue;
      }
      _path = fPath;
      _isRoot = isRootPath;
      break;
    }
    if (!_path) {
      console.log(chalk.red(`配置文件路径不存在, 请配置后重试!`));
      process.exit(1);
    }
    return {
      path: _path,
      isRoot: !!_isRoot,
    };
  }
  private getConfig(options: PathData): ConfigOptions {
    let { isRoot, path } = options;
    let config: BaseObject;
    const pathError = (path) =>
      runError({ message: `Can't read the config path:${path} \n` });
    if (!path || !fs.existsSync(path)) {
      pathError(path);
    }
    try {
      config = isRoot
        ? flatCollection(this.getRootPathDefConfig(), true, ["setting"])
        : require(path);
    } catch (error) {
      pathError(path);
    }
    return this.mergeConfig(config);
  }
  private getRootPathDefConfig() {
    let globalConf = new GlobalConfig({ _: [] });
    return globalConf.getDefaultProjectConfig();
  }
  private mergeConfig(config: BaseObject): ConfigOptions {
    return {
      project: this.getProjectConfig(config),
      upload: this.getUploadConfig(config),
      preview: this.getPreviewConfig(config),
      build: this.getBuildConfig(config),
      sourcemap: this.getSourcemapConfig(config),
    };
  }
  private getProjectConfig(config: BaseObject): ProjectOptions {
    let { appid, type, projectPath, privateKeyPath } = config;
    return Object.assign(
      {},
      this.getDefProjectCof(),
      compact({ appid, type, projectPath, privateKeyPath }),
      getValueByKeys(this.envArgs, [
        ["appid", "id"],
        ["projectPath", "proPath"],
        ["privateKeyPath", "priPath"],
        ["type", "t"],
        ["ignores", "ig"],
      ])
    ) as ProjectOptions;
  }
  private getUploadConfig(config: BaseObject): UploadOptions {
    const { version, desc, robot } = config;
    return Object.assign(
      {},
      this.getDefUploadConf(),
      compact({
        version,
        desc,
        robot,
        setting: this.getSettingsConfig(config),
      }),
      getValueByKeys(this.envArgs, [
        "ver",
        "test",
        ["desc", "d"],
        ["robot", "r"],
      ])
    ) as UploadOptions;
  }
  private getPreviewConfig(config: BaseObject): PreviewOptions {
    const {
      desc,
      robot,
      qrcodeFormat,
      qrcodeOutputDest,
      pagePath,
      searchQuery,
    } = config;
    return Object.assign(
      {},
      this.getDefPreviewConf(),
      compact({
        desc,
        robot,
        qrcodeFormat,
        qrcodeOutputDest,
        pagePath,
        searchQuery,
        setting: this.getSettingsConfig(config),
      }),
      getValueByKeys(this.envArgs, [
        ["desc", "d"],
        ["robot", "r"],
        ["qrcodeFormat", "qrFormat", "qrf"],
        ["qrcodeOutputDest", "qrDest", "qrd"],
        ["pagePath", "pp", "p"],
        ["searchQuery", "sq", "q"],
      ])
    ) as PreviewOptions;
  }
  private getBuildConfig(config: BaseObject): BuildOptions {
    let { ignores } = config;
    return Object.assign(
      this.getDefBuildConf(),
      compact({ ignores }),
      getValueByKeys(this.envArgs, ["ignores"])
    ) as BuildOptions;
  }
  private getSourcemapConfig(config: BaseObject): SourceMapOptions {
    let { robot, sourceMapSavePath } = config;
    return Object.assign(
      {},
      this.getDefSourcemapConf(),
      compact({ robot, sourceMapSavePath }),
      getValueByKeys(this.envArgs, [
        ["robot", "r"],
        ["sourceMapSavePath", "sp"],
      ])
    ) as SourceMapOptions;
  }
  private getSettingsConfig(config: BaseObject): BaseObject {
    let { setting = {} } = config;
    return compact({
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
    });
  }
  private getDefProjectCof(): BaseObject {
    return { type: "miniProgram" };
  }
  private getDefUploadConf(): BaseObject {
    return { robot: 1 };
  }
  private getDefPreviewConf(): BaseObject {
    return {
      robot: 1,
      qrcodeFormat: "terminal",
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
  private getDefSourcemapConf(): BaseObject {
    return { robot: 1 };
  }
}
export function logHelp() {
  console.log(`Usage: mini-ci config  [--options]

Commands:
  ls                           显示全部配置列表名称.
  set                          设置项目配置.
  get                          获取项目配置详情.
  use                          设置为默认(当前使用).
  delete                       删除对象项目配置.
  default                      显示当前默认配置详情.

Options:
  --help, -h                   显示帮助文档.
  --version, -v                显示版本号.
  --name                       指定设置或获取配置的项目名称.
  --path                       指定设置项目配置的路径.
  --default                    设为默认(仅set命令时生效).
`);
}
function runConfig(_: GlobalConfig) {
  let command = _.envArgs._[1];
  if (!command) {
    logHelp();
    process.exit(0);
  }
  const allowCommand = [
    "ls",
    "get",
    "set",
    "use",
    "delete",
    "clear",
    "default",
  ];
  if (allowCommand.includes(command)) {
    _[command]();
  } else {
    console.log(chalk.red(`mini-ci config ${command} is not found!`));
  }
  process.exit();
}
export class GlobalConfig {
  defKey: string;
  envArgs: ParsedArgs;
  private config: GlobalConfigOptions;
  constructor(args: ParsedArgs) {
    this.envArgs = args;
    this.defKey = "_default";
    this.config = this.init();
  }
  get path(): string {
    return `${getUserHomeDir()}/.mini-ci.json`;
  }
  get isEmpty(): boolean {
    return this.config.size === 0;
  }
  get defaultProjectName(): string {
    return this.config.get(this.defKey) as string;
  }
  private init(): GlobalConfigOptions {
    return this.getGlobalConfigFile();
  }
  private getGlobalConfigFile(): GlobalConfigOptions {
    if (!fs.existsSync(this.path)) this.createEmptyGlobalConfigFile();
    let globalFileData: BaseObject;
    try {
      globalFileData = require(this.path);
    } catch (error) {
      runError({ message: `读取 ${this.path} 文件发生错误!` });
    }
    return this.jsonToMap(globalFileData);
  }
  private createEmptyGlobalConfigFile(): void {
    fs.writeFileSync(this.path, "{}");
  }
  private jsonToMap(data: BaseObject): GlobalConfigOptions {
    const keys = Object.keys(data);
    let map = new Map();
    if (!keys) return map;
    for (const key in data) {
      map.set(key, data[key]);
    }
    return map;
  }
  private mapToJson(data: GlobalConfigOptions): BaseObject {
    if (!(data instanceof Map))
      runError({ message: `期望接受一个 Map 类型, 但接收到 ${typeof data}` });
    let res: BaseObject = {};
    data.forEach((value, key) => {
      res[key] = value;
    });
    return res;
  }
  private getAbsolutePath(_path: string): string {
    return path.isAbsolute(_path) ? _path : path.resolve(_path);
  }
  private configToJsonFile(): void {
    fs.writeFileSync(
      this.path,
      JSON.stringify(this.mapToJson(this.config), null, 4)
    );
    process.exit(0);
  }
  private exitIfError(options: CheckOptions): void {
    options.forEach(({ error, message }) => error && runError({ message }));
  }
  private isDefaultProject(projectName: string): boolean {
    return (
      projectName &&
      this.defaultProjectName &&
      projectName === this.defaultProjectName
    );
  }
  getDefaultProjectConfig(): ConfigOptions {
    if (!this.defaultProjectName) return;
    return this.config.get(this.defaultProjectName) as ConfigOptions;
  }
  ls() {
    if (this.isEmpty)
      this.exitIfError([
        {
          error: this.isEmpty,
          message: `Project configuration is empty, please try again after configuration`,
        },
      ]);
    let datas: string[] = [];
    this.config.forEach((data, key: string) => {
      if (key === this.defKey) return;
      key = !!this.isDefaultProject(key) ? `${chalk.green("*")}${key} ` : key;
      datas.push(`${key}:${JSON.stringify(data)}`);
    });
    console.log(datas.join("\n \n"));
  }
  set(_name?: string) {
    let { name, n, default: isDef, def, path, p } = this.envArgs;
    const projectName: string = _name || name || n;
    const isDefault: boolean = isDef || def;
    const filePath: string = this.getAbsolutePath(path || p);
    const isFilePathExists: boolean = fs.existsSync(filePath);
    this.exitIfError([
      {
        error: !projectName,
        message: `Project name is missing! try 'mini-ci config set --name=projectName' to set project name !`,
      },
      {
        error: !filePath || !isFilePathExists,
        message: !filePath
          ? `Project configuration file path is required! try "mini-ci config set --path=configPath" to set project configuration file path!`
          : !isFilePathExists
          ? `Project configuration file does not exist, the path is : ${filePath}, Please check and try again!`
          : "",
      },
    ]);
    const confIns = new Config({ _: [], file: filePath });
    this.config.set(projectName, confIns.config);
    isDefault && this.config.set(this.defKey, projectName);
    console.log(chalk.green(`Project ${projectName} configuration succeeded!`));
    this.configToJsonFile();
  }
  get(_name?: string) {
    let { name, n } = this.envArgs;
    const projectName = _name || name || n;
    this.exitIfError([
      {
        error: this.isEmpty,
        message: `Project configuration is empty, please try again after configuration`,
      },
      {
        error: !projectName,
        message: `Project name is missing! try 'mini-ci config get --name=projectName' to set project name !`,
      },
      {
        error: !this.config.has(projectName),
        message: `There is no ${chalk.yellow(
          projectName
        )} project in the configuration!`,
      },
    ]);
    console.log(
      chalk.yellow(
        `${
          this.isDefaultProject(projectName) ? "default:" : ""
        } ${JSON.stringify(this.config.get(projectName), null, 4)}`
      )
    );
    process.exit(0);
  }
  delete() {
    let { name, n } = this.envArgs;
    const projectName = name || n;
    this.exitIfError([
      {
        error: !projectName,
        message: `Project name is missing! try 'mini-ci config delete --name=projectName' to set project name !`,
      },
      {
        error: !this.config.has(projectName),
        message: `There is no ${chalk.yellow(
          projectName
        )} project in the configuration!`,
      },
    ]);
    this.config.delete(projectName);
    this.isDefaultProject(projectName) && this.config.delete(this.defKey);
    console.log(chalk.green(`Project ${projectName} deleted successfully!`));
    this.configToJsonFile();
  }
  clear() {
    this.config.clear();
    console.log(chalk.green(`Configuration cleared successfully!`));
    this.configToJsonFile();
  }
  default() {
    let { name, n } = this.envArgs;
    const projectName = name || n;
    this.exitIfError([
      {
        error: !!projectName && !this.config.has(projectName),
        message: `There is no ${projectName} project in the configuration`,
      },
      {
        error: this.isDefaultProject(projectName),
        message: `The default project is already ${projectName}`,
      },
    ]);
    if (projectName) {
      this.config.set(this.defKey, projectName);
      console.log(
        chalk.green(
          `Set up successfully, the default project is ${projectName}`
        )
      );
      this.configToJsonFile();
    } else {
      this.get(this.defaultProjectName);
    }
  }
  test() {
    console.log(this.defaultProjectName);
  }
}
export default runConfig;
