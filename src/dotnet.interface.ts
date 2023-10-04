interface IDotnet {
  isSdkInstalled(): Promise<boolean>;
  isStrykerToolInstalled(): Promise<boolean>;
  isDotnetManifestExists(): Promise<boolean>;

  installStrykerTool(): Promise<boolean>;
  updateStrykerTool(): Promise<boolean>;
  uninstallStrykerTool(): Promise<boolean>;

  initializeStrykerConfiguration(folderpath: string): Promise<string>;
}

export default IDotnet;
