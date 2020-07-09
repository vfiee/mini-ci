export interface ActionMap {
  [key: string]: Function;
}

export interface BaseObject {
  [key: string]: any;
}

export interface ConfigOptions {
  project: ProjectOptions;
  upload: UploadOptions;
}

export interface ProjectOptions {
  appid: string;
  ignores?: string[];
  projectPath: string;
  privateKeyPath?: string;
  type: "miniProgram" | "miniProgramPlugin" | "miniGame" | "miniGamePlugin";
}

export interface MiniCompileOption {
  es6?: boolean;
  es7?: boolean;
  minify?: boolean;
  codeProtect?: boolean;
  minifyJS?: boolean;
  minifyWXML?: boolean;
  minifyWXSS?: boolean;
  autoPrefixWXSS?: boolean;
}
export interface UploadOptions {
  version: string;
  setting?: MiniCompileOption;
  desc?: string;
  robot?:
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23
    | 24
    | 25
    | 26
    | 27
    | 28
    | 29
    | 30;
  // onProgressUpdate?: (task: MiniProgramCI.ITaskStatus | string) => void;
  test?: boolean;
}
