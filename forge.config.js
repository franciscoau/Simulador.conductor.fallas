module.exports = {
  packagerConfig: {
    asar: true,
    name: "MOCK UP VIRTUAL",
    executableName: "MOCK UP VIRTUAL",
    appBundleId: "cl.simcar.mockupvirtual",
    appCategoryType: "public.app-category.education",
    // Ship only application files, not archives, documentation or other builds.
    ignore: [/^\/(?!package\.json$|main\.js$|index\.html$|splash\.html$|(?:sonidos|shared|vehicles)(?:\/|$)|icon\.png$)/]
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      platforms: ["win32"],
      config: { name: "mock_up_virtual", setupExe: "MOCK_UP_VIRTUAL_Setup.exe" }
    },
    { name: "@electron-forge/maker-zip", platforms: ["darwin", "win32"] }
  ]
};
