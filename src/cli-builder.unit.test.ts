import { dotnetCommand, strykerDotnetToolInstallationLocation } from './config';
import { InvalidArgumentsException, MissingArgumentsException } from './dotnet-cli-exception';
import { commandBuilder } from './cli-builder';

jest.mock('./config');

describe('WHEN Building a cli Command', () => {
  let mockDotnetCommand: jest.MockedFn<typeof dotnetCommand>;
  let mockStrykerInstallationlocation: jest.MockedFn<typeof strykerDotnetToolInstallationLocation>;

  const A_CLI_NAME: string = 'a-cli-name';

  beforeEach(() => {
    // Arrange (GIVEN)
    jest.clearAllMocks();
    jest.resetAllMocks();

    mockDotnetCommand = dotnetCommand as jest.MockedFn<typeof dotnetCommand>;
    mockDotnetCommand.mockReturnValue(A_CLI_NAME);

    mockStrykerInstallationlocation = strykerDotnetToolInstallationLocation as jest.MockedFn<
      typeof strykerDotnetToolInstallationLocation
    >;
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
      expect(mockDotnetCommand).not.toBeCalled();
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
      expect(mockDotnetCommand).not.toBeCalled();
    });
  });

  describe('GIVEN the argument "--version" is used', () => {
    it('THEN should return the cli name followed by "--version" without the location argument', () => {
      // Arrange (GIVEN)
      const versionArgument: string = '--version';
      const args: string[] = [versionArgument];

      const expectedBuildedCommand: string = `${A_CLI_NAME} ${versionArgument}`;

      // Act (WHEN)
      const commandResults: string = commandBuilder(args);

      // Assert (THEN)
      expect(mockDotnetCommand).toHaveBeenCalledTimes(1);
      expect(commandResults).toBe(expectedBuildedCommand);
      expect(mockStrykerInstallationlocation).not.toBeCalled();
    });
  });

  describe('GIVEN the argument "tool" is used', () => {
    it('THEN should return the cli name followed by "tool" with the location argument to be called', () => {
      // Arrange (GIVEN)
      const toolArgument: string = 'tool';
      const args: string[] = [toolArgument];

      // the location argument must be arranged here
      mockStrykerInstallationlocation.mockReturnValue('global');

      const expectedBuildedCommandStartsWith: string = `${A_CLI_NAME} ${toolArgument} --global`;

      // Act (WHEN)
      const commandResults: string = commandBuilder(args);

      // Assert (THEN)
      expect(mockDotnetCommand).toHaveBeenCalledTimes(1);
      expect(commandResults).toContain(expectedBuildedCommandStartsWith);
      expect(mockStrykerInstallationlocation).toBeCalled();
    });
  });

  describe('GIVEN the argument "new" is used', () => {
    it('THEN should return the cli name followed by "new" without the location argument', () => {
      // Arrange (GIVEN)
      const argumentNew: string = 'new';
      const args: string[] = [argumentNew];

      const expectedBuildedCommand: string = `${A_CLI_NAME} ${argumentNew}`;

      // Act (WHEN)
      const commandResults: string = commandBuilder(args);

      // Assert (THEN)
      expect(mockDotnetCommand).toHaveBeenCalledTimes(1);
      expect(commandResults).toBe(expectedBuildedCommand);
      expect(mockStrykerInstallationlocation).not.toBeCalled();
    });
  });

  describe('GIVEN the argument "stryker" is used', () => {
    it('THEN should return the cli name followed by "stryker" without the location argument', () => {
      // Arrange (GIVEN)
      const strykerArgument: string = 'stryker';
      const args: string[] = [strykerArgument];

      const expectedBuildedCommand: string = `${A_CLI_NAME} ${strykerArgument}`;

      // Act (WHEN)
      const commandResults: string = commandBuilder(args);

      // Assert (THEN)
      expect(mockDotnetCommand).toHaveBeenCalledTimes(1);
      expect(commandResults).toBe(expectedBuildedCommand);
      expect(mockStrykerInstallationlocation).not.toBeCalled();
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
      expect(mockDotnetCommand).toHaveBeenCalledTimes(1);
      expect(commandResults).toBe(expectedBuildedCommand);
    });
  });

  describe('GIVEN a supported first argument is used AND other arguments are legits', () => {
    const aSupportedFirstArgument: string = 'tool';

    describe('AND GIVEN the dotnet-stryker tool is installed globally', () => {
      it('THEN should return the cli name followed by the unescaped arguments with the "--global" flag', () => {
        // Arrange (GIVEN)
        mockStrykerInstallationlocation.mockReturnValue('global');

        const otherLegitimateArguments: string[] = ['legitArg1', 'legitArg2'];
        const args: string[] = [aSupportedFirstArgument];
        args.push(...otherLegitimateArguments);

        const expectedBuildedCommand: string = `${A_CLI_NAME} ${aSupportedFirstArgument} ${otherLegitimateArguments.join(
          ' ',
        )} --global`;

        // Act (WHEN)
        const commandResults: string = commandBuilder(args);

        // Assert (THEN)
        expect(mockDotnetCommand).toHaveBeenCalledTimes(1);
        expect(commandResults).toBe(expectedBuildedCommand);
      });
    });

    describe('AND GIVEN the dotnet-stryker tool is installed locally', () => {
      it('THEN should return the cli name followed by the unescaped arguments with the "--local" flag', () => {
        // Arrange (GIVEN)
        mockStrykerInstallationlocation.mockReturnValue('local');

        const otherLegitimateArguments: string[] = ['legitArg1', 'legitArg2'];
        const args: string[] = [aSupportedFirstArgument];
        args.push(...otherLegitimateArguments);

        const expectedBuildedCommand: string = `${A_CLI_NAME} ${aSupportedFirstArgument} ${otherLegitimateArguments.join(
          ' ',
        )} --local`;

        // Act (WHEN)
        const commandResults: string = commandBuilder(args);

        // Assert (THEN)
        expect(mockDotnetCommand).toHaveBeenCalledTimes(1);
        expect(commandResults).toBe(expectedBuildedCommand);
      });
    });
  });
});
