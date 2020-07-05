export interface configOptions {
  project: CreateProjectOption;
  upload: CreateUploadOption;
}

export interface CreateProjectOption {
  appid: string;
  type: "miniProgram" | "miniProgramPlugin" | "miniGame" | "miniGamePlugin";
  projectPath: string;
  privateKeyPath?: string;
  ignores?: string[];
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
export interface CreateUploadOption {
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
  qrcodeFormat?: "base64" | "image" | "terminal";
  qrcodeOutputDest?: string;
  pagePath?: string;
  searchQuery?: string;
}
