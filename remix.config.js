/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverDependenciesToBundle: ["graphql-request"],
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "cjs",
  future: {
    v2_meta: true,
    v2_errorBoundary: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
    unstable_cssModules: true,
    unstable_cssSideEffectImports: true,
    unstable_dev: true,
    unstable_postcss: true,
    unstable_tailwind: false,
  },
};