const webpack = require("webpack");
const path = require("path");

module.exports = {
  devServer: (devServerConfig) => {
    devServerConfig.onBeforeSetupMiddleware = (devServer) => {
      devServer.app.use((req, res, next) => {
        if (req.url.endsWith(".wasm")) {
          res.setHeader("Content-Type", "application/wasm");
        }
        next();
      });
    };
    return devServerConfig;
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.plugins = [
        ...(webpackConfig.plugins || []),
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
      ];

      webpackConfig.resolve.alias = {
        ...(webpackConfig.resolve.alias || {}),
        "process/browser": path.resolve(__dirname, "node_modules/process/browser.js"),
      };

      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: require.resolve("path-browserify"),
        os: false,
        process: require.resolve("process/browser"),
        buffer: require.resolve("buffer/"),
        stream: require.resolve("stream-browserify"),
        util: require.resolve("util/"),
      };

      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === "ModuleScopePlugin"
      );
      if (scopePluginIndex !== -1) {
        webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      }

      return webpackConfig;
    },
  },
};
