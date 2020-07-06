export interface ActionMap {
  [key: string]: Function;
}

export interface BaseObject {
  [key: string]: any;
}

export enum ProjectType {
  miniGame = "miniGame",
  miniProgram = "miniProgram",
  miniGamePlugin = "miniGamePlugin",
  miniProgramPlugin = "miniProgramPlugin",
}

export interface ProjectOption {
  appid: string;
  type: ProjectType;
  projectPath: string;
  privateKey: string;
}

export interface Args {
  _: string[];
  [key: string]: string | boolean | string[];
}
