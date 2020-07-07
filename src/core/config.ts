import {
  configOptions,
  CreateProjectOption,
  CreateUploadOption,
} from "../types";
import chalk from "chalk";
import { ParsedArgs } from "minimist";
import { BaseObject } from "../types";

class Config {
  path: string;
  project: CreateProjectOption;
  upload: CreateUploadOption;
  config: BaseObject;
  constructor(config: ParsedArgs) {
    let { file, f } = config;
    this.path = file || f || `${process.cwd()}/mini-ci.json`;
    let { project, upload } = this.getConfig(config);
    this.project = project;
    this.upload = upload;
  }
  private getConfig(args: ParsedArgs): configOptions {
    let config: configOptions;
    try {
      config = require(this.path);
    } catch (error) {
      console.error(
        chalk.red(`Can't read the config path:${this.path}`),
        error
      );
      process.exit(1);
    }
    let { project = {}, upload = {} } = config;
    config.project = {
      ...project,
      ...this.getProjectEnv(args),
    } as CreateProjectOption;
    config.upload = {
      ...upload,
      ...this.getUploadOrPreviewEnv(args),
    } as CreateUploadOption;
    return config;
  }
  private getProjectEnv(project): object {
    let {
      appid,
      id,
      projectPath,
      proPath,
      privateKeyPath,
      priPath,
      type,
      t,
      ignores,
      ig,
    } = project;
    return this.getBaseEnv({
      type: type || t,
      appid: appid || id,
      ignores: ignores || ig,
      projectPath: projectPath || proPath,
      privateKeyPath: privateKeyPath || priPath,
    });
  }
  private getUploadOrPreviewEnv(upload): object {
    let {
      // 上传配置
      ver: version,
      desc,
      d,
      robot,
      r,
      test,
      qrcodeFormat,
      qrf,
      qrcodeOutputDest,
      qro,
      pagePath,
      searchQuery,
      sq,
      es6,
      es7,
      minify,
      codeProtect,
      minifyJS,
      minifyWXML,
      minifyWXSS,
      autoPrefixWXSS,
    } = upload;
    return this.getBaseEnv({
      test,
      version,
      pagePath,
      desc: desc || d,
      robot: robot || r,
      searchQuery: searchQuery || sq,
      qrcodeFormat: qrcodeFormat || qrf,
      qrcodeOutputDest: qrcodeOutputDest || qro,
      setting: {
        es6: !!es6,
        es7: !!es7,
        minify: !!minify,
        codeProtect: !!codeProtect,
        minifyJS: !!minifyJS,
        minifyWXML: !!minifyWXML,
        minifyWXSS: !!minifyWXSS,
        autoPrefixWXSS: !!autoPrefixWXSS,
      },
    });
  }
  private getBaseEnv(obj: object): object {
    let keys = Object.keys(obj);
    if (!keys.length) return {};
    for (let i = 0, len = keys.length; i < len; i++) {
      let curr = obj[keys[i]];
      if (typeof curr === "object" && !Array.isArray(curr)) {
        this.getBaseEnv(curr);
        continue;
      }
      if (obj[keys[i]] === undefined) {
        delete obj[keys[i]];
      }
    }
    return obj;
  }
}

export default Config;
