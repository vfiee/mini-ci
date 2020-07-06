import {
  configOptions,
  CreateProjectOption,
  CreateUploadOption,
} from "../types/config";
import chalk from "chalk";
import { ParsedArgs } from "minimist";

class Config {
  path: string;
  project: CreateProjectOption;
  upload: CreateUploadOption;
  constructor(config: ParsedArgs) {
    let { file, f } = config;
    this.path = file || f || `${process.cwd()}/mini-ci.json`;
    let { project, upload } = this.getConfig();
    this.project = project;
    this.upload = upload;
  }
  private getConfig(): configOptions {
    let config: configOptions = this.getDefCof();
    try {
      config = require(this.path);
    } catch (error) {
      console.error(
        chalk.red(`Can't read the config path:${this.path}`),
        error
      );
      process.exit(1);
    }
    return config;
  }
  private getDefCof(): configOptions {
    const localDateString = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      weekday: "long",
      hour12: true,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    return {
      project: {
        appid: "",
        type: "miniProgram",
        projectPath: `${process.cwd()}/dist`,
      },
      upload: {
        test: true,
        version: "1.0.0",
        desc: `${localDateString} 上传`,
      },
    };
  }
}

export default Config;
