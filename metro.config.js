const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const config = {
  resolver: {
    resolveRequest: (context, moduleImport, platform) => {
      // jose reaches the bundle via @copilotkit/shared -> @segment/analytics-node.
      // Its Node build imports node:* modules that Hermes can't bundle.
      if (moduleImport === "jose" || moduleImport.startsWith("jose/")) {
        return context.resolveRequest(
          { ...context, unstable_conditionNames: ["browser"] },
          moduleImport,
          platform,
        );
      }
      return context.resolveRequest(context, moduleImport, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
