export const bindFn = (fn: Function, context: any, ...args: any) =>
  fn.bind(context, ...args);

export const hasOwnProperty: Function = Object.prototype.hasOwnProperty;
/**
 *
 * @param {string} path
 * @example
 * let paths = stringToPath("obj[3].paths.from")
 * console.log(paths); //  ["obj","[3]","paths","from"]
 *
 * @returns {array} 返回字符串的路径数组
 */
const propsReg: RegExp = /[^.[\]\s]+|\[\d+\]+/g;

function stringToPath(path: string): RegExpMatchArray {
  if (typeof path !== "string" || path === "") return [];
  const res = path.match(propsReg);
  return res || [];
}
export function get(
  object: object | null,
  path: string | string[] = ``,
  defValue: any
): any {
  if (object == null || typeof object !== "object") return object || defValue;
  let paths: string[] = Array.isArray(path) ? path : stringToPath(path);
  let result: any = object;
  for (let i = 0, len = paths.length; i < len; i++) {
    if (hasOwnProperty.call(result, paths[i])) {
      result = result[paths[i]];
      continue;
    }
    result = undefined;
    break;
  }
  return result === undefined ? defValue : result;
}
