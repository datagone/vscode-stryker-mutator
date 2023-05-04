import cp from 'child_process';

import { executeCommandWithArguments, isValidToRegex } from './cli-exec';
import { commandBuilder } from './cli-builder';
import {
  Uri,
  /*mockAsRelativePath,*/ /*mockWorkspaceFolders,*/ workspace,
  mockGetWorkspaceFolder,
} from '../__mocks__/vscode';

import { when } from 'jest-when';
import path from 'path';

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

    // describe('AND GIVEN an invalid executable command', () => {
    //   // todo: integration test
    //   it('THEN the command execution will be rejected with an error from the ChildProcess execution', async () => {
    //     // Arrange (GIVEN)
    //     const anInvalidExecutable: string = 'invalidExecutable';
    //     const anInvalidCommandToExecute: string = `${anInvalidExecutable} ${validArguments[0]}`;

    //     const expectedErrorResponsePattern: string = `${anInvalidCommandToExecute}\\s'${anInvalidExecutable}'`;
    //     const expextedErrorRegExpMessage: RegExp = new RegExp(expectedErrorResponsePattern, 'gmi');

    //     mockCommandBuilder.mockReturnValue(anInvalidCommandToExecute);

    //     jest.dontMock('child_process');

    //     // Act (WHEN)
    //     const actualValidationResult = () => executeCommandWithArguments(validArguments);

    //     // Assert (THEN)
    //     await expect(actualValidationResult).rejects.toThrowError(expextedErrorRegExpMessage);
    //     expect(commandBuilder).toHaveBeenCalledTimes(1);
    //     expect(commandBuilder).toHaveBeenCalledWith(validArguments);
    //   });
    // });

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

      //       it('THEN the command execution will be launch in a CWD', async () => {
      //         // Arrange (GIVEN)
      //         const aValidExecutableCommand: string = `echo ${validArguments[0]}`;
      //         const expectedResponse: string = validArguments[0];

      //         // const folderPath: Uri = Uri.file('./workspace');
      //         // const testFolder = {uri: { path: folderPath.path, fsPath: folderPath.fsPath }, name: 'workspace', index: 0};
      //         // mockWorkspaceFolders.mockReturnValue(() => [testFolder]);
      //         // workspace.workspaceFolders.get.mockReturnValue(mockWorkspaceFolders);

      //         //when(mockAsRelativePath).calledWith('.').mockReturnValue('./workspace');

      // //        const aTestProjectFolder = './ASolutionFolder/ASolution.Tests';
      // //        const expectedSolutionTestsFolder: Uri = Uri.file(path.join(aTestProjectFolder));
      // //        mockGetWorkspaceFolder.mockReturnValue({
      // //          uri: {
      // //            path: expectedSolutionTestsFolder.path,
      // //            fsPath: expectedSolutionTestsFolder.path,
      // //          },
      // //        });

      //         // const original = jest.requireActual('child_process');
      //         // const execMock = jest.spyOn(cp, 'exec').mockImplementation((
      //         //     // command: string,
      //         //     // options: (fs.ObjectEncodingOptions & cp.ExecOptions) | undefined | null,
      //         //     // callback?: (error: cp.ExecException | null, stdout: string | Buffer, stderr: string | Buffer) => void
      //         //     command,
      //         //     options,
      //         //     callback?
      //         //   ) => {
      //         //     console.log('options:', options);
      //         //     const cwd = options?.hasOwnProperty('cwd') ? options.cwd : process.cwd();
      //         //     return callback ? original.exec(command, { ...options, cwd }, callback) : original.exec(command, { ...options, cwd });
      //         //   });

      //         // jest.mock('util', () => ({
      //         //   promisify: jest.fn(() => execMock),
      //         // }));

      //         // const execMock = jest.fn();
      //         // //const originalExec = cp.exec;
      //         // // cp.exec = execMock;
      //         // (cp.exec as jest.MockedFunction<typeof cp.exec>).mockImplementation(execMock);

      //         // jest.doMock('child_process');
      //         // const execMock = jest.spyOn(cp, 'exec');

      //         // const folderPath: Uri = Uri.file('./workspace');
      //         // const testFolder = {uri: { path: folderPath.path }, name: 'workspace', index: 0};
      //         // //when(mockWorkspaceFolders).mockReturnValue([testFolder]);
      //         // //when(workspace.workspaceFolders).mockReturnValue([{uri: new Uri({ path: '/workspace' }), name: 'workspace', index: 0},{uri: new Uri({ path: '/workspace1' }), name: 'workspace1', index: 1}]);
      //         // //.mockReturnValue([{uri: new Uri({ path: '/workspace' }), name: 'workspace', index: 0}]);
      //         // //when(mockWorkspaceFolders).mockReturnValue([testFolder]);
      //         // // when(workspace.workspaceFolders).mockReturnValue([testFolder]);//.mockReturnValue([{uri: new Uri({ path: '/workspace' }), name: 'workspace', index: 0}]);

      //         // mockWorkspaceFolders.mockImplementation(() => [testFolder]);//.mockReturnValue([testFolder]);
      //         // workspace.workspaceFolders.mockReturnValue(mockWorkspaceFolders);

      //         // // const promisifySpy = jest.spyOn(util, 'promisify');
      //         // // const cwd = expect.any(String);

      //         mockCommandBuilder.mockReturnValue(aValidExecutableCommand);

      // // TODO : WTF???????????????????
      // // TODO : WTF???????????????????
      // jest.doMock('child_process');
      // // TODO : WTF???????????????????
      // // TODO : WTF???????????????????

      //         // Act (WHEN)
      //         const actualValidationResult = executeCommandWithArguments(validArguments);

      //         await expect(actualValidationResult).resolves.toContain(expectedResponse);
      //         // Assert (THEN)
      //         expect(commandBuilder).toHaveBeenCalledTimes(1);
      //         expect(commandBuilder).toHaveBeenCalledWith(validArguments);

      //         //expect(mockAsRelativePath).toHaveBeenCalled();
      // //        expect(mockGetWorkspaceFolder).toHaveBeenCalled();
      //         // expect(mockWorkspaceFolders).toHaveBeenCalledTimes(1);
      //         // expect(workspace.workspaceFolders.get).toHaveBeenCalledTimes(1);

      //         // expect(execMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ cwd: aTestProjectFolder }), expect.anything());
      //         // expect(promisifySpy).toHaveBeenCalledWith(cp.exec, { cwd });

      //         //cp.exe = originalExec;
      //       });
    });
  });
});
