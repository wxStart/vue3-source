const minumist = require("minimist");
const execa = require("execa");

const args = minumist(process.argv.slice(2));
// 获取构建参数
const target = args._.length ? args._[0] : "reactivity";
const formats = args.f || "global";
const sourcemap = args.s || false;

// 开启子进程
execa(
  "rollup",
  [
    "-wc", ///
    "--environment",
    [
      `TARGET:${target}`,
      `FORMATS:${formats}`,
      sourcemap ? "SOURCE_MAP:true" : "",
    ]
      .filter(Boolean)
      .join(","),
  ],
  {
    stdio: "inherit",
  }
);

// pnpm run  dev
// dev.js  ---> rollup打包  ---> rollup.config.js
