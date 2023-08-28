import { dotnetCommand } from './config';
import { InvalidArgumentsException, MissingArgumentsException } from './dotnet-cli-exception';
import { commandBuilder } from './cli-builder';

jest.mock('./config');

describe('WHEN Building a cli Command', () => {
  let mockDotnetCommand: jest.MockedFn<typeof dotnetCommand>;

  const A_CLI_NAME: string = 'a-cli-name';

  beforeEach(() => {
    // Arrange (GIVEN)
    mockDotnetCommand = dotnetCommand as jest.MockedFn<typeof dotnetCommand>;
    mockDotnetCommand.mockReturnValue(A_CLI_NAME);
  });

  describe('GIVEN no arguments', () => {
    it('THEN should throw a missing arguments exception', () => {
      // Arrange (GIVEN)
      const emptyArgs: string[] = [];

      // Act (WHEN)
      const commandResults = () => commandBuilder(emptyArgs);

      // Assert (THEN)
      expect(commandResults).toThrow(MissingArgumentsException);
      expect(commandResults).toThrowError('No arguments provided.');
      expect(dotnetCommand).not.toBeCalled();
    });
  });

  describe('GIVEN an unsupported argument is used', () => {
    it('THEN should throw an invalid argument exception', () => {
      // Arrange (GIVEN)
      const anUnsupportedArgument: string = 'anArgument';
      const args: string[] = [anUnsupportedArgument];

      // Act (WHEN)
      const commandResults = () => commandBuilder(args);

      // Assert (THEN)
      expect(commandResults).toThrow(InvalidArgumentsException);
      expect(commandResults).toThrowError(`The sub-command '${args[0]}' is not supported.`);
      expect(dotnetCommand).not.toBeCalled();
    });
  });

  describe('GIVEN the argument "--version" is used', () => {
    it('THEN should return the cli name followed by "--version"', () => {
      // Arrange (GIVEN)
      const versionArgument: string = '--version';
      const args: string[] = [versionArgument];

      const expectedBuildedCommand: string = `${A_CLI_NAME} ${versionArgument}`;

      // Act (WHEN)
      const commandResults: string = commandBuilder(args);

      // Assert (THEN)
      expect(dotnetCommand).toHaveBeenCalledTimes(1);
      expect(commandResults).toBe(expectedBuildedCommand);
    });
  });

  describe('GIVEN the argument "tool" is used', () => {
    it('THEN should return the cli name followed by "tool"', () => {
      // Arrange (GIVEN)
      const toolArgument: string = 'tool';
      const args: string[] = [toolArgument];

      const expectedBuildedCommand: string = `${A_CLI_NAME} ${toolArgument}`;

      // Act (WHEN)
      const commandResults: string = commandBuilder(args);

      // Assert (THEN)
      expect(dotnetCommand).toHaveBeenCalledTimes(1);
      expect(commandResults).toBe(expectedBuildedCommand);
    });
  });

  describe('GIVEN the argument "stryker" is used', () => {
    it('THEN should return the cli name followed by "stryker"', () => {
      // Arrange (GIVEN)
      const strykerArgument: string = 'stryker';
      const args: string[] = [strykerArgument];

      const expectedBuildedCommand: string = `${A_CLI_NAME} ${strykerArgument}`;

      // Act (WHEN)
      const commandResults: string = commandBuilder(args);

      // Assert (THEN)
      expect(dotnetCommand).toHaveBeenCalledTimes(1);
      expect(commandResults).toBe(expectedBuildedCommand);
    });
  });

  describe('GIVEN a supported argument is used AND a possible injection attacks', () => {
    it('THEN should return the cli name followed by the escaped arguments', () => {
      // Arrange (GIVEN)
      const aSupportedArgument: string = 'stryker';
      const anInjectionAttack: string[] = ['-v', '5.0;', 'echo', 'hello world;'];
      const args: string[] = [aSupportedArgument];
      args.push(...anInjectionAttack);

      const expectedBuildedCommand: string = `${A_CLI_NAME} ${aSupportedArgument} -v '5.0;' echo 'hello world;'`;

      // Act (WHEN)
      const commandResults: string = commandBuilder(args);

      // Assert (THEN)
      expect(dotnetCommand).toHaveBeenCalledTimes(1);
      expect(commandResults).toBe(expectedBuildedCommand);
    });
  });

  describe('GIVEN a supported first argument is used AND other arguments are legits', () => {
    it('THEN should return the cli name followed by the unescaped arguments', () => {
      // Arrange (GIVEN)
      const aSupportedFirstArgument: string = 'tool';
      const otherLegitimateArguments: string[] = ['--list', 'global'];
      const args: string[] = [aSupportedFirstArgument];
      args.push(...otherLegitimateArguments);

      const expectedBuildedCommand: string = `${A_CLI_NAME} ${aSupportedFirstArgument} ${otherLegitimateArguments.join(
        ' '
      )}`;

      // Act (WHEN)
      const commandResults: string = commandBuilder(args);

      // Assert (THEN)
      expect(dotnetCommand).toHaveBeenCalledTimes(1);
      expect(commandResults).toBe(expectedBuildedCommand);
    });
  });
});
