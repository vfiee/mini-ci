import {
  ConfigOptions,
  BaseObject,
  ProjectOptions,
  UploadOptions,
} from "../types";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import { ParsedArgs } from "minimist";
import { getValueByKeys, getUserHomeDir, getLocalDate, get } from "../utils";

class Config {
  private path: string;
  private envArgs: ParsedArgs;
  config: ConfigOptions;
  constructor(envArgs: ParsedArgs) {
    this.envArgs = envArgs;
    this.path = this.getPath();
    this.config = this.getConfig();
  }
  private getPath(isRoot: boolean = false): string {
    const userHome = getUserHomeDir();
    if (isRoot) return userHome;
    let { file, f } = this.envArgs;
    const cwd = process.cwd();
    const projectConfig = `${cwd}/mini-ci.json`;
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
    return { project, upload };
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
        ["ignore", "ig"],
      ])
    );
  }
  private getUploadConfig(config: BaseObject): UploadOptions {
    let { setting = {}, ...args } = get(config, "upload", {});
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
  private getDefProjectCof(): BaseObject {
    return {};
  }
  private getDefUploadConf(): BaseObject {
    return {
      desc: getLocalDate() + " 上传",
    };
  }
}

export default Config;
