import cp from 'child_process';
import { executeCommandWithArguments, isValidToRegex } from './cli-exec';
import { commandBuilder } from './cli-builder';

jest.mock('child_process');

jest.mock('./config');
jest.mock('./cli-builder');

// todo this feels a new file or helper ?!
describe('WHEN a string is validated against a regex', () => {
  // Arrange (GIVEN)
  const aValidRegexPattern: string = 'AValid';
  let actualValidationResult: boolean;

  describe('GIVEN a valid case incensitive multiline string AND a valid regex pattern', () => {
    it('THEN it should give a valid answer', async () => {
      // Arrange (GIVEN)
      const aValidCaseIncensitiveMultilineString: string = 'ThisIsAMultiline\r\nAnd\r\navalidString';

      // Act (WHEN)
      actualValidationResult = await isValidToRegex(aValidCaseIncensitiveMultilineString, aValidRegexPattern);

      // Assert (THEN)
      expect(actualValidationResult).toBe(true);
    });
  });

  describe('GIVEN an invalid string AND a valid regex pattern', () => {
    it('THEN it should give an invalid answer', async () => {
      // Arrange (GIVEN)
      const anInvalidString: string = 'ThisIsAnInValidString';

      // Act (WHEN)
      actualValidationResult = await isValidToRegex(anInvalidString, aValidRegexPattern);

      // Assert (THEN)
      expect(actualValidationResult).toBe(false);
    });
  });
});

describe('WHEN command will be executed', () => {
  let mockCommandBuilder: jest.MockedFn<typeof commandBuilder>;

  beforeEach(() => {
    mockCommandBuilder = commandBuilder as jest.MockedFn<typeof commandBuilder>;
    jest.doMock('child_process');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    jest.dontMock('child_process');

    mockCommandBuilder.mockClear();
    mockCommandBuilder.mockReset();
    mockCommandBuilder.mockRestore();
  });

  describe('GIVEN invalid arguments', () => {
    it('THEN the command execution will be rejected with an error from the command builder', async () => {
      // Arrange (GIVEN)
      const invalidArguments: string[] = [];
      const expectedError = new Error('expected error');

      mockCommandBuilder.mockImplementation(() => {
        throw expectedError;
      });

      // Act (WHEN)
      const actualValidationResult = executeCommandWithArguments(invalidArguments);

      // Assert (THEN)
      expect(commandBuilder).toHaveBeenLastCalledWith(invalidArguments);
      expect(cp.exec).not.toHaveBeenCalled();
      await expect(actualValidationResult).rejects.toThrow(expectedError);
    });
  });

  describe('GIVEN valid arguments', () => {
    // Arrange (GIVEN)
    const validArguments: string[] = ['hello world'];

    describe('AND GIVEN the ChildProcess execution fails', () => {
      it('THEN the command execution will be rejected with an error from the ChildProcess execution', async () => {
        // Arrange (GIVEN)
        const aValidExecutableCommand: string = `echo ${validArguments[0]}`;
        const expectedErrorFromChildProcess: Error = new Error('expected error from childprocess');
        jest.spyOn(cp, 'exec').mockImplementation(() => {
          throw expectedErrorFromChildProcess;
        });

        mockCommandBuilder.mockReturnValue(aValidExecutableCommand);
        //when(mockWorkspaceFolders).mockReturnValue(undefined);

        // Act (WHEN)
        const actualValidationResult = executeCommandWithArguments(validArguments);

        // Assert (THEN)
        expect(commandBuilder).toHaveBeenCalledTimes(1);
        expect(commandBuilder).toHaveBeenCalledWith(validArguments);
        expect(cp.exec).toHaveBeenCalledTimes(1);
        await expect(actualValidationResult).rejects.toThrow(expectedErrorFromChildProcess);
      });
    });

    describe('AND GIVEN a valid executable command line', () => {
      // todo: integration test
      it('THEN the command execution will resolve with a message', async () => {
        // Arrange (GIVEN)
        const aValidExecutableCommand: string = `echo ${validArguments[0]}`;
        const expectedResponse: string = validArguments[0];

        mockCommandBuilder.mockReturnValue(aValidExecutableCommand);

        jest.dontMock('child_process');

        // Act (WHEN)
        const actualValidationResult = executeCommandWithArguments(validArguments);

        // Assert (THEN)
        expect(commandBuilder).toHaveBeenCalledTimes(1);
        expect(commandBuilder).toHaveBeenCalledWith(validArguments);
        await expect(actualValidationResult).resolves.toContain(expectedResponse);
      });
    });
  });
});
