import { Uri } from 'vscode';

interface IStrykerConfiguration {
  initializeBasicConfiguration(folderUri: Uri): Promise<string>;
  createStrykerConfigurationFile(folderUri: Uri): Promise<string>;
}

export default IStrykerConfiguration;
