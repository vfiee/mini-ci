import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import sourcemap from "rollup-plugin-sourcemaps";
import typescript from "rollup-plugin-typescript2";
import common from "@rollup/plugin-commonjs";
const pkg = require("./package.json");

const banner = `/*!
   * v-mini-ci v${pkg.version}
   * (c) 2020-${new Date().getFullYear()} vyron
   * Released under the MIT License.
   */`;

export default {
  input: "src/index.ts",
  output: {
    banner,
    format: "cjs",
    sourcemap: true,
    file: pkg.main,
    name: pkg.name,
  },
  external: ["miniprogram-ci", "path", "tty", "os"],
  include: ["src"],
  exclude: ["node_modules"],
  plugins: [
    json(),
    resolve(),
    sourcemap(),
    common(),
    typescript({ useTsconfigDeclarationDir: true }),
  ],
};
