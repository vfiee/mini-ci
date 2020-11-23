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
  exitIfError,
  getAbsolutePath,
  getLocalDate,
  getRcConfig,
} from "utils";
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
} from "types";

enum ProjectJsonType {
  ProjectJson = "package.json",
  MiniConfigJson = "project.config.json",
}

const ROOT_CONFIG_PATH: string = `${getUserHomeDir()}/.mini-ci.json`;
const SEARCH_CONFIG_PATHS: Array<PathData> = [
  {
    src: ".minicirc",
  },
  {
    src: "mini-ci.json",
  },
  {
    src: "minici.json",
  },
  {
    src: "package.json",
  },
  {
    src: "mini-ci.js",
  },
  {
    src: ROOT_CONFIG_PATH,
    isRoot: true,
  },
];
export class Config {
  envArgs: ParsedArgs;
  config: ConfigOptions;
  projectPath: string;
  private isRoot: boolean;
  constructor(envArgs: ParsedArgs) {
    this.envArgs = envArgs;
    this.isRoot = envArgs._.length === 0;
    this.config = this.getConfig(this.getPath());
  }

  get baseConfig(): BaseObject {
    return Object.assign(
      {},
      this.getDefBaseConf(),
      getValueByKeys(this.envArgs, [["showProgressLog", "spl"]])
    );
  }

  /**
   * 按照顺序加载配置
   * json
   * mini-ci.json>minici.json>minicirc>package.json/mini-ci字段
   *
   * others(require)
   * mini-ci.js>mini-ci.ts
   *
   */
  private getPath(): PathData {
    const { file, f } = this.envArgs;
    let filePath = file || f;
    if (filePath) {
      // 自定义路径
      filePath = getAbsolutePath(file || f);
      if (fs.existsSync(filePath)) {
        return { isRoot: false, src: filePath };
      }
      console.log(
        chalk.yellow(
          `Warn: The specified config path ${filePath} does not exist!`
        )
      );
    }
    // 查找路径
    let projectPath: PathData;
    for (let i = 0; i < SEARCH_CONFIG_PATHS.length; i++) {
      const obsPath = getAbsolutePath(SEARCH_CONFIG_PATHS[i].src);
      if (fs.existsSync(obsPath)) {
        if (
          SEARCH_CONFIG_PATHS[i].src === "package.json" &&
          typeof require(obsPath)["mini-ci"] !== "object"
        ) {
          continue;
        }
        projectPath = SEARCH_CONFIG_PATHS[i];
        break;
      }
    }
    if (!projectPath) {
      console.log(
        chalk.red(
          `Error: The config file was not found, please try again after configuration!`
        )
      );
      process.exit(1);
    }
    return projectPath;
  }

  private getConfig(options: PathData): ConfigOptions {
    const { isRoot, src } = options;
    let config: BaseObject;
    const getConfigContent = (src) => {
      const configExtName = path.extname(src);
      const absPath = getAbsolutePath(src);
      // const isJsonConfig = src === "minicirc" || configExtName === "json";
      const isJsConfig = configExtName === "js" || configExtName === "ts";
      const config =
        src === ".minicirc" ? getRcConfig(absPath) : require(absPath);

      return isJsConfig
        ? config
        : src === "package.json"
        ? config["mini-ci"]
        : config;
    };
    try {
      config = isRoot
        ? flatCollection(this.getRootPathDefConfig(), true, ["setting"])
        : getConfigContent(src);
    } catch (error) {
      exitIfError([
        {
          error: true,
          message: `Can't read the config path:${path}\n${error}`,
        },
      ]);
    }
    this.setProjectPath(config.projectPath);
    return this.mergeConfig(config);
  }

  private setProjectPath(projectPath: string) {
    exitIfError([
      {
        error: !projectPath,
        message: `The project path must be configured!`,
      },
      {
        error: !fs.existsSync(projectPath),
        message: `The configured projectPath ${projectPath} does not exist!`,
      },
    ]);
    this.projectPath = projectPath;
  }

  private getRootPathDefConfig() {
    const { name } = this.envArgs;
    const globalConf = new GlobalConfig({ _: [] });
    return globalConf.getProjectConfig(name);
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
    const { appid, type, projectPath, privateKeyPath } = config;
    const projectConfig = Object.assign(
      {},
      this.getDefProjectCof(),
      compact({ appid, type, projectPath, privateKeyPath }),
      getValueByKeys(this.envArgs, [
        ["appid", "id"],
        ["projectPath", "proPath"],
        ["privateKeyPath", "keyPath"],
        ["type", "t"],
        ["ignores", "ig"],
      ])
    ) as ProjectOptions;
    console.log(`projectConfig:`, projectConfig);
    return projectConfig;
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
    const { ignores } = config;
    return Object.assign(
      this.getDefBuildConf(),
      compact({ ignores }),
      getValueByKeys(this.envArgs, ["ignores"])
    ) as BuildOptions;
  }

  private getSourcemapConfig(config: BaseObject): SourceMapOptions {
    const { robot, sourceMapSavePath } = config;
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
    const { setting = {} } = config;
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

  private getJson(type: ProjectJsonType): BaseObject {
    let count: number = 0;
    const SERCH_MAX = 3;
    const searchJson = (): BaseObject => {
      let res: BaseObject = {};
      if (count >= SERCH_MAX) return res;
      try {
        res = require(path.resolve(
          this.projectPath,
          "../".repeat(count),
          type
        ));
      } catch (error) {
        count++;
        return searchJson();
      }
      return res;
    };
    return searchJson();
  }

  private getDefBaseConf(): BaseObject {
    return {
      // 是否显示上传或预览的进度log
      showProgressLog: false,
    };
  }

  private getDefProjectCof(): BaseObject {
    const { appid = "" } = this.getJson(ProjectJsonType.MiniConfigJson);
    return { appid, type: "miniProgram" };
  }

  private getDefUploadConf(): BaseObject {
    const { version = "" } = this.getJson(ProjectJsonType.ProjectJson);
    const res: BaseObject = { robot: 1 };
    if (!this.isRoot) {
      res.desc = `${getLocalDate()} 上传`;
      version && (res.version = version);
    }
    return res;
  }

  private getDefPreviewConf(): BaseObject {
    const { qrcodeFormat } = getValueByKeys([
      ["qrcodeFormat", "qrFormat", "qrf"],
    ]);
    const res: BaseObject = {
      robot: 1,
      qrcodeFormat: qrcodeFormat || "terminal",
    };
    if (!this.isRoot) {
      res.desc = `${getLocalDate()} 预览`;
    }
    if (!!qrcodeFormat && qrcodeFormat !== "terminal") {
      res.qrcodeOutputDest = `${this.projectPath}/${
        qrcodeFormat === "base64" ? `preview-base64` : `preview.jpg`
      }`;
    }
    return res;
  }

  private getDefBuildConf(): BaseObject {
    return {};
  }

  private getDefSourcemapConf(): BaseObject {
    const { sourceMapSavePath = "" } = getValueByKeys([
      ["sourceMapSavePath", "sp"],
    ]);
    return {
      robot: 1,
      sourceMapSavePath:
        sourceMapSavePath || `${this.projectPath}/sourcemap.zip`,
    };
  }
}
export class GlobalConfig {
  envArgs: ParsedArgs;
  private defKey: string;
  private config: GlobalConfigOptions;

  constructor(args: ParsedArgs) {
    this.envArgs = args;
    this.defKey = "_default";
    this.config = this.init();
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
    if (!fs.existsSync(ROOT_CONFIG_PATH)) this.createEmptyGlobalConfigFile();
    let globalFileData: BaseObject;
    try {
      globalFileData = require(ROOT_CONFIG_PATH);
    } catch (error) {
      runError({ message: `Error reading file ${ROOT_CONFIG_PATH}!` });
    }
    return this.jsonToMap(globalFileData);
  }

  private createEmptyGlobalConfigFile(): void {
    fs.writeFileSync(ROOT_CONFIG_PATH, "{}");
  }

  private jsonToMap(data: BaseObject): GlobalConfigOptions {
    const keys = Object.keys(data);
    const map = new Map();
    if (!keys) return map;
    for (const key in data) {
      map.set(key, data[key]);
    }
    return map;
  }

  private mapToJson(data: GlobalConfigOptions): BaseObject {
    if (!(data instanceof Map))
      runError({
        message: `Expect to accept Map, but received ${typeof data}`,
      });
    const res: BaseObject = {};
    data.forEach((value, key) => {
      res[key] = value;
    });
    return res;
  }

  private saveToFile(
    path?: string,
    data?: BaseObject,
    callback?: () => void
  ): void {
    fs.writeFileSync(
      path || ROOT_CONFIG_PATH,
      JSON.stringify(data || this.mapToJson(this.config), null, 4)
    );
    callback && callback();
    process.exit(0);
  }

  private isDefaultProject(projectName: string): boolean {
    return (
      projectName &&
      this.defaultProjectName &&
      projectName === this.defaultProjectName
    );
  }

  getProjectConfig(projectName?: string, message?: string): ConfigOptions {
    exitIfError([
      {
        error: !!projectName && !this.config.has(projectName),
        message: message || `Project ${projectName} does not exist!`,
      },
      {
        error: !projectName && !this.defaultProjectName,
        message: "There is no default project configuration!",
      },
    ]);
    return this.config.get(
      projectName || this.defaultProjectName
    ) as ConfigOptions;
  }

  ls() {
    exitIfError([
      {
        error: this.isEmpty,
        message: `Project configuration is empty, please try again after configuration`,
      },
    ]);
    const datas: string[] = [];
    this.config.forEach((data, key: string) => {
      if (key === this.defKey) return;
      key = this.isDefaultProject(key) ? `${chalk.green("*")}${key} ` : key;
      datas.push(`${key}:${JSON.stringify(data)}`);
    });
    console.log(datas.join("\n \n"));
  }

  set(_name?: string) {
    const { name, n, default: isDef, def, path, p } = this.envArgs;
    const projectName: string = _name || name || n;
    const isDefault: boolean = isDef || def;
    const filePath: string = getAbsolutePath(path || p);
    const isFilePathExists: boolean = !!filePath && fs.existsSync(filePath);
    exitIfError([
      {
        error: !projectName,
        message: `Project name is missing! try 'mini-ci config set --name=projectName' to set project name!`,
      },
      {
        error: !filePath,
        message: `Project configuration file path is required! try "mini-ci config set --path=configPath" to set project configuration file path!`,
      },
      {
        error: !isFilePathExists,
        message: `Project configuration file does not exist, the path is : ${filePath}, Please check and try again!`,
      },
    ]);
    const confIns = new Config({ _: [], file: filePath });
    this.config.set(projectName, confIns.config);
    isDefault && this.config.set(this.defKey, projectName);
    console.log(chalk.green(`Project ${projectName} configuration succeeded!`));
    this.saveToFile();
  }

  get(_name?: string) {
    const { name, n } = this.envArgs;
    const projectName = _name || name || n;
    exitIfError([
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
    const { name, n } = this.envArgs;
    const projectName = name || n;
    exitIfError([
      {
        error: this.isEmpty,
        message: `Project configuration is empty, please try again after configuration`,
      },
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
    this.saveToFile();
  }

  clear() {
    this.config.clear();
    console.log(chalk.green(`Configuration cleared successfully!`));
    this.saveToFile();
  }

  default() {
    const { name, n } = this.envArgs;
    const projectName = name || n;
    exitIfError([
      {
        error: this.isEmpty,
        message: `Project configuration is empty, please try again after configuration`,
      },
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
      this.saveToFile();
    } else {
      this.get(this.defaultProjectName);
    }
  }

  export() {
    const { name, n, path: _path, p } = this.envArgs;
    const projectName = name || n;
    let exportPath = _path || p;
    exitIfError([
      {
        error: this.isEmpty,
        message: `There is no project to be exported, project config is empty!`,
      },
      {
        error: !!projectName && !this.config.has(projectName),
        message: `There is not project ${projectName} can be exported!`,
      },
      {
        error: !projectName && !this.defaultProjectName,
        message: `There is no default project can be exported! Try "mini-ci export --name=projectName" to set project name.`,
      },
      {
        error: !!exportPath && exportPath === ROOT_CONFIG_PATH,
        message: "The export path can't be the same as the default root path!",
      },
    ]);
    const config = this.getProjectConfig(projectName);
    if (!exportPath) {
      exportPath = path.resolve(
        config.project.projectPath,
        "export-mini-ci.json"
      );
    }
    this.saveToFile(exportPath, flatCollection(config, true), () => {
      console.log(
        chalk.green(
          `The project ${
            projectName || this.defaultProjectName
          } configuration is exported successfully, the path is ${exportPath}`
        )
      );
    });
  }
}
export function logHelp() {
  console.log(`Usage: mini-ci config command [--options]

Commands:
  ls                           显示全局配置列表.
  set                          设置项目配置.
  get                          获取项目配置详情.
  delete                       删除对象项目配置.
  default                      显示当前默认配置详情.
  export                       导出配置信息.
  default                      显示或设置为默认配置.
  clear                        清空项目配置.

Options:
  --help, -h                   显示帮助文档.
  --version, -v                显示版本号.
  --name                       指定设置或获取配置的项目名称.
  --path                       指定设置项目配置的路径.
  --default                    设为默认(only for set).
`);
}
function runConfig(_: GlobalConfig) {
  const command = _.envArgs._[1];
  if (!command) {
    logHelp();
    process.exit(0);
  }
  const allowCommand = [
    "ls",
    "get",
    "set",
    "delete",
    "clear",
    "default",
    "export",
  ];
  exitIfError([
    {
      error: !allowCommand.includes(command),
      message: chalk.red(`mini-ci config ${command} is not found!`),
      fn: () => {
        _[command]();
        process.exit(1);
      },
    },
  ]);
}
export default runConfig;
