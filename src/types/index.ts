export type ActionMap = {
  [key: string]: Function;
};

export type BaseObject = {
  [key: string]: any;
};

type MiniProjectType =
  | "miniProgram"
  | "miniProgramPlugin"
  | "miniGame"
  | "miniGamePlugin";

export interface ProjectOptions {
  appid: string;
  ignores?: string[];
  projectPath: string;
  privateKeyPath: string;
  type: MiniProjectType;
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
type Robot =
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
interface BaseOptions {
  version: string;
  desc?: string;
  setting?: MiniCompileOption;
  robot?: Robot;
}

export interface UploadOptions extends BaseOptions {
  test?: boolean;
}

type QRcodeFormatType = "terminal" | "image" | "base64";
export interface PreviewOptions extends BaseOptions {
  pagePath?: string;
  searchQuery: string;
  qrcodeOutputDest: string;
  qrcodeFormat: QRcodeFormatType;
}

export interface BuildOptions {
  ignores?: string[];
}

export interface SourceMapOptions {
  robot: Robot;
  sourceMapSavePath: string;
}

export interface ErrorOptions {
  message: string;
}

export type PathData = {
  src: string;
  isRoot?: boolean;
};

type CheckError = {
  error: boolean;
  message: string;
  fn?: Function;
};

export type CheckOptions = CheckError[];

export type ConfigOptions = {
  project: ProjectOptions;
  upload: UploadOptions;
  preview: PreviewOptions;
  build: BuildOptions;
  sourcemap: SourceMapOptions;
  showStatusLog?: boolean;
};

export type GlobalConfigOptions = Map<string, ConfigOptions | string>;
