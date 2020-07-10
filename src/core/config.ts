import {
  ConfigOptions,
  BaseObject,
  ProjectOptions,
  UploadOptions,
  PreviewOptions,
  BuildOptions,
  SourceMapOptions,
} from "../types";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import { ParsedArgs } from "minimist";
import { getValueByKeys, getUserHomeDir, getLocalDate, get } from "../utils";

class Config {
  private path: string;
  private envArgs: ParsedArgs;
  public config: ConfigOptions;
  constructor(envArgs: ParsedArgs) {
    this.envArgs = envArgs;
    this.path = this.getPath();
    this.config = this.getConfig();
  }
  get cwd() {
    return process.cwd();
  }
  get baseConfig(): BaseObject {
    return Object.assign(
      {},
      this.getDefBaseConf(),
      getValueByKeys(this.envArgs, [["showStatusLog", "sl"]])
    );
  }
  private getPath(isRoot: boolean = false): string {
    const userHome = getUserHomeDir();
    if (isRoot) return userHome;
    let { file, f } = this.envArgs;
    const cwd = process.cwd();
    const projectConfig = `${this.cwd}/mini-ci.json`;
    if (file || f) {
      return path.resolve(cwd, file || f);
    } else if (fs.existsSync(projectConfig)) {
      return projectConfig;
    }
    return userHome;
  }
  private getConfig(): ConfigOptions {
    let config: BaseObject;
    try {
      config = require(this.path);
    } catch (error) {
      console.error(
        chalk.red(`Can't read the config path:${this.path}`),
        error
      );
      process.exit(1);
    }
    return this.mergeConfig(config);
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

export default Config;
