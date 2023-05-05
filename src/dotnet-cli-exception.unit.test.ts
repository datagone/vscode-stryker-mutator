import { MissingArgumentsException, InvalidArgumentsException } from './dotnet-cli-exception';

describe('DotNet Cli Exceptions', () => {
  describe('WHEN using a MissingArgumentsException', () => {
    describe('GIVEN a message is defined', () => {
      const message = 'Required arguments are missing';
      let exception: MissingArgumentsException;

      beforeEach(() => {
        exception = new MissingArgumentsException(message);
      });

      it('THEN its name should be "MissingArgumentsException"', () => {
        expect(exception.name).toBe('MissingArgumentsException');
      });

      it('Then should have the same message', () => {
        expect(exception.message).toBe(message);
      });
    });
  });

  describe('WHEN using a InvalidArgumentsException', () => {
    describe('Given a message is defined', () => {
      const message = 'Provided arguments are invalid';
      let exception: InvalidArgumentsException;

      beforeEach(() => {
        exception = new InvalidArgumentsException(message);
      });

      it('Then its name should be "InvalidArgumentsException"', () => {
        expect(exception.name).toBe('InvalidArgumentsException');
      });

      it('Then should have the same message', () => {
        expect(exception.message).toBe(message);
      });
    });
  });
});
