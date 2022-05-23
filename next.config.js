module.exports = {
  reactStrictMode: true,
  webpack: (config) => {

    // Since Webpack 5 doesn't enable WebAssembly by default, we should do it manually
    config.experiments = { asyncWebAssembly: true, layers: true }

    config.resolve.fallback = {
      ...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
        // by next.js will be dropped. Doesn't make much sense, but how it is
      fs: false, // the solution
    };

    return config
  }
};