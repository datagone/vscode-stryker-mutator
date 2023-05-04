import { dotnetCommand, strykerCommand, strykerConfigFilePath, strykerOptionalParameters } from './config';
import { workspace, mockGet /*, Uri*/ } from '../__mocks__/vscode';
// import { workspaceHasYarnLockFile } from './fs-helpers';

jest.mock('./fs-helpers');

// const mockWorkspaceHasYarnLockFile = workspaceHasYarnLockFile as jest.MockedFn<typeof workspaceHasYarnLockFile>;

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
      expect(mockGet).toHaveBeenCalledWith('strykerDotNetRunner.stryker.configFile');
    });

    it('should return an undefined object when nothing is present in config', () => {
      // ACT (WHEN)
      const res = strykerConfigFilePath();
      // Assert (THEN)
      expect(res).toBeUndefined();
    });
    it('should return value from config when configFile is set', () => {
      // Arrange (GIVEN)
      mockConfig('strykerDotNetRunner.stryker.configFile', 'custom config');
      // ACT (WHEN)
      const res = strykerConfigFilePath();
      // Assert (THEN)
      expect(res).toEqual('custom config');
    });
  });
  // describe('Use yarn', () => {
  //   it('should return true when useYarn is set true', () => {
  //     mockConfig('strykerDotNetRunner.node.useYarn', true);

  //     const res = useYarn();

  //     expect(workspace.getConfiguration).toHaveBeenCalledWith();
  //     expect(mockGet).toHaveBeenCalledWith('strykerDotNetRunner.node.useYarn');
  //     expect(res).toEqual(true);
  //   });
  //   it('should return false when unothing is set in config and there is no file context', () => {
  //     const res = useYarn();

  //     expect(workspace.getConfiguration).toHaveBeenCalledWith();
  //     expect(mockGet).toHaveBeenCalledWith('strykerDotNetRunner.node.useYarn');
  //     expect(workspaceHasYarnLockFile).not.toHaveBeenCalled();
  //     expect(res).toEqual(false);
  //   });
  //   it('should return true when nothing is set in config, there is a file context and it cotains a yarn.lock file', () => {
  //     mockWorkspaceHasYarnLockFile.mockReturnValue(true);

  //     const res = useYarn(new Uri({ path: 'x.test.ts' }));

  //     expect(workspace.getConfiguration).toHaveBeenCalledWith();
  //     expect(mockGet).toHaveBeenCalledWith('strykerDotNetRunner.node.useYarn');
  //     expect(workspaceHasYarnLockFile).toHaveBeenCalledWith(expect.objectContaining({ path: 'x.test.ts' }));
  //     expect(res).toEqual(true);
  //   });
  //   it('should return true when nothing is set in config, there is a file context and it does not cotains a yarn.lock file', () => {
  //     mockWorkspaceHasYarnLockFile.mockReturnValue(false);

  //     const res = useYarn(new Uri({ path: 'x.test.ts' }));

  //     expect(workspace.getConfiguration).toHaveBeenCalledWith();
  //     expect(mockGet).toHaveBeenCalledWith('strykerDotNetRunner.node.useYarn');
  //     expect(workspaceHasYarnLockFile).toHaveBeenCalledWith(expect.objectContaining({ path: 'x.test.ts' }));
  //     expect(res).toEqual(false);
  //   });
  // });
  describe('Stryker command', () => {
    const expectedCommand: string = 'dotnet stryker';

    beforeEach(() => {});

    afterEach(() => {
      // Assert (THEN)
      expect(workspace.getConfiguration).toHaveBeenCalledWith();
      expect(mockGet).toHaveBeenCalledWith('strykerDotNetRunner.dotnet.commandPath');
    });

    it('should return node command when nothing is present in config', () => {
      // Act (WHEN)
      const res = strykerCommand();

      // Assert (THEN)
      expect(res).toEqual(expectedCommand);
    });
    it('should return value from config when command is set', () => {
      const customCommand = 'custom-command';
      mockConfig('strykerDotNetRunner.dotnet.commandPath', customCommand);

      // Act (WHEN)
      const res = strykerCommand();

      // Assert (THEN)
      expect(res).toEqual(`${customCommand} stryker`);
    });
  });

  describe('WHEN obtaining the stryker optional parameters', () => {
    const STRYKER_OPTIONAL_PARAM_CONFIG_VARIABLE_NAME = 'strykerDotNetRunner.stryker.optionalParameters';

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
    const DOTNET_CONFIG_VARIABLE_NAME = 'strykerDotNetRunner.dotnet.commandPath';

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
