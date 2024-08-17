module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-typescript"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./"],
        extensions: [".ts", ".js"],
        alias: {
          "@": "./src",
          "@types": "./src/types",
          "@constants": "./src/constants",
          "@utils": "./src/utils",
        },
      },
    ],
  ],
};
