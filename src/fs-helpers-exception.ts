export class InvalidWorkspaceException extends Error {
  name = 'InvalidWorkspaceException';

  constructor(message: string) {
    super(message);
  }
}
