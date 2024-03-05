import { InvalidDotNetSolutionFolderPathException, InvalidWorkspaceException } from './fs-helpers-exception';

describe('File System Helpers Exceptions', () => {
  describe('WHEN using a InvalidWorkspaceException', () => {
    describe('GIVEN a message is defined', () => {
      const message = 'The message within the exception';
      let exception: InvalidWorkspaceException;

      beforeEach(() => {
        exception = new InvalidWorkspaceException(message);
      });

      it('THEN its name should be "InvalidWorkspaceException"', () => {
        expect(exception.name).toBe('InvalidWorkspaceException');
      });

      it('Then should have the same message', () => {
        expect(exception.message).toBe(message);
      });
    });
  });

  describe('WHEN using a InvalidDotNetSolutionFolderPathException', () => {
    describe('GIVEN a message is defined', () => {
      const message = 'The message within the exception';
      let exception: InvalidDotNetSolutionFolderPathException;

      beforeEach(() => {
        exception = new InvalidDotNetSolutionFolderPathException(message);
      });

      it('THEN its name should be "InvalidDotNetSolutionFolderPathException"', () => {
        expect(exception.name).toBe('InvalidDotNetSolutionFolderPathException');
      });

      it('Then should have the same message', () => {
        expect(exception.message).toBe(message);
      });
    });
  });
});
