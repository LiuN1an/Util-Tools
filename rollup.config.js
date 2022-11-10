import nodeResolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";
import json from "@rollup/plugin-json";

const env = process.env.NODE_ENV;

const extensions = [".js", ".ts", ".tsx", ".json"];

const config = {
  input: "src/index.ts",
  external: Object.keys(pkg.peerDependencies || {}).concat("react-dom"),
  output: {
    format: "umd",
    name: "util-tools",
    globals: {
      react: "React",
      "react-dom": "ReactDOM",
      mobx: "Mobx",
      "mobx-react-lite": "MobxReactLite",
    },
  },
  plugins: [
    nodeResolve({
      extensions,
      browser: true,
    }),
    babel({
      include: "src/**/*",
      exclude: "**/node_modules/**",
      babelHelpers: "runtime",
      extensions,
    }),
    json(),
    replace({
      "process.env.NODE_ENV": JSON.stringify(env),
      preventAssignment: true,
    }),
    commonjs(),
  ],
  onwarn: () => {
    return;
  },
};

if (env === "production") {
  config.plugins.push(
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    })
  );
}
export default config;
