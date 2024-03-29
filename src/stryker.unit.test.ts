import { Uri } from '../__mocks__/vscode';
import { strykerCommand, strykerConfigFilePath, strykerOptionalParameters } from './config';
import { commandRunner } from './stryker';
import { makeReusableTerminal, runCommand } from './terminal';

jest.mock('./terminal');
jest.mock('./config');

const mockTerminal = jest.fn();
const mockRunCommandReturn = jest.fn();
const mockStrykerCommand = strykerCommand as jest.MockedFn<typeof strykerCommand>;
const mockStrykerConfigFilePath = strykerConfigFilePath as jest.MockedFn<typeof strykerConfigFilePath>;
const mockStrykerOptionalParameters = strykerOptionalParameters as jest.MockedFn<typeof strykerOptionalParameters>;
(makeReusableTerminal as jest.Mock).mockReturnValue(mockTerminal);
(runCommand as jest.Mock).mockReturnValue(mockRunCommandReturn);

describe('Stryker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Command runner', () => {
    describe('Currying a reusable terminal', () => {
      it('should return a command runner func with a reusable terminal', () => {
        const res = commandRunner();

        expect(makeReusableTerminal).toHaveBeenCalledWith({ name: 'Stryker' });
        expect(res).toEqual(expect.any(Function));
      });
    });
    describe('Curried command runner function', () => {
      const commandCalledWithinTerminal = 'a terminal';
      const commandFileParameter = { file: new Uri({ path: '/path/to/file.cs' }) };
      const commandFileAndRangeParameters = { file: new Uri({ path: '/path/to/file.cs' }), range: '1..10' };
      const expectedMutateFileParameter = '**\\file.cs';
      const expectedMutateFileSelectionRangeParameter = '{1..10}';

      beforeEach(() => {
        // Arrange (GIVEN)
        mockTerminal.mockReturnValueOnce(commandCalledWithinTerminal);
        mockStrykerCommand.mockReturnValueOnce('a/command');
      });

      afterEach(() => {
        // Assert (THEN)
        expect(makeReusableTerminal).toHaveBeenCalledWith({ name: 'Stryker' });
        expect(strykerConfigFilePath).toHaveBeenCalled();
        expect(strykerCommand).toHaveBeenCalled();
        expect(mockTerminal).toHaveBeenCalled();
        expect(runCommand).toHaveBeenCalledWith('a terminal');
      });

      it('should execute a Stryker command with a custom config file path', () => {
        // Arrange (GIVEN)
        mockStrykerConfigFilePath.mockReturnValueOnce('a/config/file/path.json');
        // Act (WHEN)
        commandRunner()(commandFileParameter);
        // Assert (THEN)
        expect(mockRunCommandReturn).toHaveBeenCalledWith(
          `a/command --mutate "${expectedMutateFileParameter}" --config-file a/config/file/path.json`,
        );
      });
      it('should execute a Stryker command with optional parameters', () => {
        // Arrange (GIVEN)
        const expectedParameters = '--optional-parameter value';
        mockStrykerOptionalParameters.mockReturnValueOnce(expectedParameters);
        // Act (WHEN)
        commandRunner()(commandFileParameter);
        // Assert (THEN)
        expect(mockRunCommandReturn).toHaveBeenCalledWith(
          `a/command --mutate "${expectedMutateFileParameter}" ${expectedParameters}`,
        );
      });
      it('should execute a Stryker command without a custom config file path', () => {
        // Act (WHEN)
        commandRunner()(commandFileAndRangeParameters);
        // Assert (THEN)
        expect(mockRunCommandReturn).toHaveBeenCalledWith(
          `a/command --mutate "${expectedMutateFileParameter}${expectedMutateFileSelectionRangeParameter}"`,
        );
      });
      it('should execute a Stryker command without a line range', () => {
        // Act (WHEN)
        commandRunner()(commandFileParameter);
        // Assert (THEN)
        expect(mockRunCommandReturn).toHaveBeenCalledWith(`a/command --mutate "${expectedMutateFileParameter}"`);
      });
      it('should execute a Stryker command to mutate a folder for underneath .cs files', () => {
        // Act (WHEN)
        commandRunner()({ file: new Uri({ path: '/path/to/folder' }) });
        // Assert (THEN)
        expect(mockRunCommandReturn).toHaveBeenCalledWith('a/command --mutate "**\\folder\\*"');
      });
      it('should execute a Stryker command with the solution parameter', () => {
        // Act (WHEN)
        commandRunner()({ file: new Uri({ path: '/path/to/solutionFile.sln' }) });
        // Assert (THEN)
        expect(mockRunCommandReturn).toHaveBeenCalledWith('a/command --solution "solutionFile.sln"');
      });
      it('should execute a Stryker command with the project parameter', () => {
        // Act (WHEN)
        commandRunner()({ file: new Uri({ path: '/path/to/projectFile.csproj' }) });
        // Assert (THEN)
        expect(mockRunCommandReturn).toHaveBeenCalledWith('a/command --project "projectFile.csproj"');
      });
      it('should execute a Stryker command with the tests project parameter', () => {
        // Act (WHEN)
        commandRunner()({ file: new Uri({ path: '/path/to/projectFile.Tests.csproj' }) });
        // Assert (THEN)
        expect(mockRunCommandReturn).toHaveBeenCalledWith('a/command --test-project "projectFile.Tests.csproj"');
      });
      it('should execute a Stryker command with the test project parameter', () => {
        // Act (WHEN)
        commandRunner()({ file: new Uri({ path: '/path/to/projectFile.Test.csproj' }) });
        // Assert (THEN)
        expect(mockRunCommandReturn).toHaveBeenCalledWith('a/command --test-project "projectFile.Test.csproj"');
      });
      it('should execute a Stryker command to run over all the workspace', () => {
        // Act (WHEN)
        commandRunner()({});
        // Assert (THEN)
        expect(mockRunCommandReturn).toHaveBeenCalledWith('a/command');
      });
    });
  });
});
