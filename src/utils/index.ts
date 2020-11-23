import os from "os";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import { BaseObject, ErrorOptions, CheckOptions } from "types";

export const hasOwnProperty: Function = Object.prototype.hasOwnProperty;
const propsReg: RegExp = /[^.[\]\s]+|\[\d+\]+/g;
/**
 *
 * @param {string} path
 * @example
 * let paths = stringToPath("obj[3].paths.from")
 * console.log(paths); //  ["obj","[3]","paths","from"]
 *
 * @returns {array} 返回字符串的路径数组
 *
 */
function stringToPath(path: string): RegExpMatchArray {
  if (typeof path !== "string" || path === "") return [];
  const res = path.match(propsReg);
  return res || [];
}
/**
 *
 * @param {objec|array} object 目标对象
 * @param {string} path 要获取属性的路径
 * @param {any} defValue 解析值为 `undefined`,则返回 `defValue`
 */
export function get(
  object: object | null,
  path: string | string[] = ``,
  defValue?: any
): any {
  if (object == null || typeof object !== "object") return object || defValue;
  let paths: string[] = Array.isArray(path) ? path : stringToPath(path);
  let result: any = object;
  for (let i = 0, len = paths.length; i < len; i++) {
    if (result[paths[i]] !== void 0) {
      result = result[paths[i]];
      continue;
    }
    result = void 0;
    break;
  }
  return result === void 0 ? defValue : result;
}

/**
 *
 * @returns 中国当地时间 格式为 YYYY-MM-DD hh:mm:ss
 *
 */
export function getLocalDate(): string {
  const date = new Date();
  const year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate(),
    hours = date.getHours(),
    minutes = date.getMinutes(),
    seconds = date.getSeconds();
  return (
    year +
    `-` +
    prefixNum(month) +
    `-` +
    prefixNum(day) +
    " " +
    prefixNum(hours) +
    ":" +
    prefixNum(minutes) +
    ":" +
    prefixNum(seconds)
  );
}

/**
 *
 * @param {number} value 需要添加前缀的值
 * @param {number} len 期望值转为字符串的长度
 * @returns {string} value 转换后的值
 *
 * @example
 * const result = prefixnum(6,2);
 * console.log(result); // 06
 *
 * const res = prefixNum(100,2);
 * console.log(res); // 100
 *
 *
 * const res = prefixNum(100,4);
 * console.log(res); // 0100
 *
 */

export function prefixNum(value: number, len: number = 2): string {
  let diff: number = len - value.toString().length;
  return diff > 0 ? `${"0".repeat(diff)}${value}` : value.toString();
}

/**
 *
 * @param {object} value 待解析的对象
 * @param {array} keys 需要解析的key
 * @param {Function} filterFn 结果的转换
 * @returns {object} 解析后的对象
 *
 * @example
 * const object = {x:1,y:2,z:3,keys:["key","value"]};
 *
 * const res = getValueByKeys(object,["x","y","keys"]);
 *
 * console.log(res); // {x:1,y:2,keys:["key","value"]}
 *
 */
export function getValueByKeys(
  value: object,
  keys: (string | string[])[] = [],
  filterFn: Function = (v: any) => v !== void 0
): BaseObject {
  if (keys.length === 0) return value;
  return keys.reduce((res, key) => {
    if ((key as any) instanceof Array) {
      let v = getFirstNoUndefinedValue(
        getValueByKeys(value, key as string[]),
        key as string[]
      ) as never;
      filterFn(v) && (res[key[0]] = v);
      return res;
    }
    if (value.hasOwnProperty(key as string)) {
      filterFn(value[key as string]) &&
        (res[key as string] = value[key as string]);
    }
    return res;
  }, {} as never) as BaseObject;
}

export function getFirstNoUndefinedValue(
  value: [] | object,
  sortKeys?: string[]
): any {
  const isArray = Array.isArray(value);
  let keys: [] = (isArray
    ? value
    : sortKeys
    ? sortKeys
    : Object.keys(value)) as [];
  if (!keys) return "";
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = isArray ? i : keys[i];
    if (value[key] !== undefined) {
      return value[key];
    }
  }
}

export function getUserHomeDir(): string {
  function homedir() {
    const env = process.env;
    const home = env.HOME;
    const user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;
    if (process.platform === "win32") {
      return env.USERPROFILE || "" + env.HOMEDRIVE + env.HOMEPATH || home || "";
    }
    if (process.platform === "darwin") {
      return home || (user ? "/Users/" + user : "");
    }
    if (process.platform === "linux") {
      return (
        home || (process.getuid() === 0 ? "/root" : user ? "/home/" + user : "")
      );
    }
    return home || "";
  }
  return typeof os.homedir === "function" ? os.homedir() : homedir();
}

export function voidFn(): void {}

export function runError(opiton: ErrorOptions): void {
  console.log(chalk.red(opiton.message));
  process.exit(1);
}

export function isObject(value: any): boolean {
  const type: string = typeof value;
  return value !== null && type === "object";
}

export function compact(value: [] | object): [] | object {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (!isObject(value)) return value;
  let keys = Object.keys(value);
  if (keys.length <= 0) return value;
  let res = {};
  for (let i = 0, len = keys.length; i < len; i++) {
    let item = value[keys[i]];
    if (Array.isArray(item) || isObject(item)) {
      res[keys[i]] = compact(item);
    } else if (!!item) {
      res[keys[i]] = item;
    }
  }
  return res;
}

export function flatCollection(
  collection: object,
  isDepth: boolean = false,
  skipKeys?: string[]
): object {
  const _isObject = isObject(collection);
  if (!_isObject) return collection;
  const hasSkipKeys = skipKeys && skipKeys.length;
  let res: BaseObject = {};
  for (const key in collection) {
    if (!hasOwnProperty.call(collection, key)) {
      continue;
    } else if (hasSkipKeys && skipKeys.includes(key)) {
      res[key] = collection[key];
      continue;
    }
    if (isDepth && isObject(collection[key])) {
      res = {
        ...res,
        ...flatCollection(collection[key], isDepth, skipKeys),
      };
    } else {
      res[key] = collection[key];
    }
  }
  return res;
}
export function exitIfError(options: CheckOptions): void {
  options.forEach((option) => {
    const { error, message, fn } = option;
    if (error) {
      !!option.message && console.error(chalk.red(message));
      process.exit(1);
    }
    fn && fn();
  });
}

export const getAbsolutePath = (_path: string): string => {
  if (!_path) return _path;
  return path.isAbsolute(_path) ? _path : path.resolve(_path);
};

export const getRcConfig = (src: string): BaseObject => {
  let config: BaseObject;
  try {
    config = JSON.parse(fs.readFileSync(src, "utf-8"));
  } catch (error) {
    config = {};
  }
  return config;
};
