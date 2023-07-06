const path = require("path");

const ts = require("rollup-plugin-typescript2");
const json = require("@rollup/plugin-json");
const commonjs = require("@rollup/plugin-commonjs");
const { nodeResolve } = require("@rollup/plugin-node-resolve");

const packageFormats = process.env.FORMATS && process.env.FORMATS.split(","); // ['global']
const sourcemap = process.env.SOURCE_MAP; // true/false

// const target = process.env.TARGET; // 'reactivity'或者是其他模块的名字

// 找到打包目录
const packagesDir = path.resolve(__dirname, "packages");
const packageDir = path.resolve(packagesDir, process.env.TARGET);
// console.log(packageDir)
const resolve = (p) => path.resolve(packageDir, p);

const pkg = require(resolve("package.json"));
const name = path.basename(packageDir); // target 目标

// 不同的 format 输出的事不同的
const outputConfig = {
  "esm-bundler": {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: "es",
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: "cjs",
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: "iife",
  },
};

const packageConfigs = packageFormats || pkg.buildOptions.formats; 

// 创建rollup的配置
function createConfig(format, output) {
  output.sourcemap = sourcemap;
  output.exports = "named";
  let external = []; // 外部模块，那些模块不需要打包
  if (format === "global") {
    output.name = pkg.buildOptions.name;
  } else {
    external = [...Object.keys(pkg.dependencies)];
  }
  return {
    input: resolve(`src/index.ts`),
    output,
    external,
    plugins: [
      json(),
      ts(), // 讲ts转为js
      commonjs(),
      nodeResolve(),
    ],
  };
}

module.exports = packageConfigs.map((format) =>
  createConfig(format, outputConfig[format])
);
