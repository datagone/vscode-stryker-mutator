import { dotnetCommand, strykerCommand, strykerConfigFilePath, strykerOptionalParameters } from './config';
import { workspace, mockGet } from '../__mocks__/vscode';

jest.mock('./fs-helpers');

const mockConfig = (key: string, value: unknown) =>
  mockGet.mockImplementationOnce((k: string) => {
    if (k === key) return value;
  });

describe('Config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Stryker config file path', () => {
    afterEach(() => {
      // Assert (THEN)
      expect(workspace.getConfiguration).toHaveBeenCalledWith();
      expect(mockGet).toHaveBeenCalledWith('stryker-mutator-net.stryker.configFile');
    });

    it('should return an undefined object when nothing is present in config', () => {
      // ACT (WHEN)
      const res = strykerConfigFilePath();
      // Assert (THEN)
      expect(res).toBeUndefined();
    });
    it('should return value from config when configFile is set', () => {
      // Arrange (GIVEN)
      mockConfig('stryker-mutator-net.stryker.configFile', 'custom config');
      // ACT (WHEN)
      const res = strykerConfigFilePath();
      // Assert (THEN)
      expect(res).toEqual('custom config');
    });
  });

  describe('Stryker command', () => {
    const expectedCommand: string = 'dotnet stryker';

    beforeEach(() => {});

    afterEach(() => {
      // Assert (THEN)
      expect(workspace.getConfiguration).toHaveBeenCalledWith();
      expect(mockGet).toHaveBeenCalledWith('stryker-mutator-net.dotnet.commandPath');
    });

    it('should return node command when nothing is present in config', () => {
      // Act (WHEN)
      const res = strykerCommand();

      // Assert (THEN)
      expect(res).toEqual(expectedCommand);
    });
    it('should return value from config when command is set', () => {
      const customCommand = 'custom-command';
      mockConfig('stryker-mutator-net.dotnet.commandPath', customCommand);

      // Act (WHEN)
      const res = strykerCommand();

      // Assert (THEN)
      expect(res).toEqual(`${customCommand} stryker`);
    });
  });

  describe('WHEN obtaining the stryker optional parameters', () => {
    const STRYKER_OPTIONAL_PARAM_CONFIG_VARIABLE_NAME = 'stryker-mutator-net.stryker.optionalParameters';

    afterEach(() => {
      // Assert (THEN)
      expect(workspace.getConfiguration).toHaveBeenCalledWith();
      expect(mockGet).toHaveBeenCalledWith(STRYKER_OPTIONAL_PARAM_CONFIG_VARIABLE_NAME);
    });

    describe('GIVEN nothing is set in the stryker optional parameters config section', () => {
      it('THEN should return the default stryker optional parameters', () => {
        // Arrange (GIVEN)
        const defaultStrykerOptionalParameters = undefined;

        // Act (WHEN)
        const res = strykerOptionalParameters();

        // Assert (THEN)
        expect(res).toEqual(defaultStrykerOptionalParameters);
      });
    });
    describe('GIVEN a config is set in the stryker optional parameters section', () => {
      it('should return value from config when command is set', () => {
        // Arrange (GIVEN)
        const expectedParameters = '--optional-parameter value';
        mockConfig(STRYKER_OPTIONAL_PARAM_CONFIG_VARIABLE_NAME, expectedParameters);

        // Act (WHEN)
        const res = strykerOptionalParameters();

        // Assert (THEN)
        expect(res).toEqual(expectedParameters);
      });
    });
  });

  describe('WHEN obtaining the Dotnet command', () => {
    // Arrange (GIVEN)
    const DOTNET_CONFIG_VARIABLE_NAME = 'stryker-mutator-net.dotnet.commandPath';

    afterEach(() => {
      // Assert (THEN)
      expect(workspace.getConfiguration).toHaveBeenCalledWith();
      expect(mockGet).toHaveBeenCalledWith(DOTNET_CONFIG_VARIABLE_NAME);
    });

    describe('GIVEN nothing is set in the dotnet command config section', () => {
      it('THEN should return the default dotnet command', () => {
        // Arrange (GIVEN)
        const defaultDotnetCommand = 'dotnet';

        // Act (WHEN)
        const res = dotnetCommand();

        // Assert (THEN)
        expect(res).toEqual(defaultDotnetCommand);
      });
    });
    describe('GIVEN a config is set in the dotnet command section', () => {
      it('should return value from config when command is set', () => {
        // Arrange (GIVEN)
        const expectedCommand = 'custom command';
        mockConfig(DOTNET_CONFIG_VARIABLE_NAME, expectedCommand);

        // Act (WHEN)
        const res = dotnetCommand();

        // Assert (THEN)
        expect(res).toEqual(expectedCommand);
      });
    });
  });
});
