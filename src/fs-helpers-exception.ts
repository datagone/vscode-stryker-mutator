export class InvalidWorkspaceException extends Error {
  name = 'InvalidWorkspaceException';

  constructor(message: string) {
    super(message);
  }
}

export class InvalidDotNetSolutionFolderPathException extends Error {
  name = 'InvalidDotNetSolutionFolderPathException';

  constructor(message: string) {
    super(message);
  }
}
