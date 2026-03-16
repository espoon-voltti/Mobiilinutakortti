module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find and configure fork-ts-checker-webpack-plugin for TypeScript 5 compatibility
      const forkTsCheckerPlugin = webpackConfig.plugins.find(
        (plugin) => plugin.constructor.name === 'ForkTsCheckerWebpackPlugin'
      );
      
      if (forkTsCheckerPlugin && forkTsCheckerPlugin.options) {
        // Disable TypeScript profiling to avoid "Cannot set property mark" error with TS 5
        forkTsCheckerPlugin.options.logger = {
          ...forkTsCheckerPlugin.options.logger,
          infrastructure: 'silent',
          issues: 'console',
        };
        
        // Configure TypeScript options
        if (forkTsCheckerPlugin.options.typescript) {
          forkTsCheckerPlugin.options.typescript = {
            ...forkTsCheckerPlugin.options.typescript,
            // Disable performance profiling that causes issues with TS 5
            profile: false,
            diagnosticOptions: {
              semantic: true,
              syntactic: true,
            },
          };
        }
      }
      
      return webpackConfig;
    },
  },
};
