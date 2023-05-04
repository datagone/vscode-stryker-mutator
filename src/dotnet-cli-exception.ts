export class MissingArgumentsException extends Error {
  name = 'MissingArgumentsException';

  constructor(message: string) {
    super(message);
  }
}

export class InvalidArgumentsException extends Error {
  name = 'InvalidArgumentsException';

  constructor(message: string) {
    super(message);
  }
}
