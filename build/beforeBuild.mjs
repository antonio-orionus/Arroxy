// electron-builder lifecycle hook. Release builds bundle no FFmpeg: the app
// downloads the approved package at runtime (ADR 0010), so nothing is fetched
// here any more.
//
// Returning truthy makes electron-builder treat node_modules as "handled
// externally" and skip the prod-deps install/copy entirely
// (app-builder-lib/out/packager.js — _nodeModulesHandledExternally), which
// produces an asar with zero node_modules: main bundles everything it needs.
export default async function beforeBuild() {
  return true;
}
