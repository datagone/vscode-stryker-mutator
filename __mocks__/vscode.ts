export class Uri {
  path: string;
  scheme: string;
  authority: string;
  query: string;
  fragment: string;
  fsPath: string;
  with: jest.Func;
  toJSON: jest.Func;

  constructor(args: { path: string }) {
    this.path = args.path;
    this.scheme = '';
    this.authority = '';
    this.query = '';
    this.fragment = '';
    this.fsPath = args.path;
    this.with = jest.fn();
    this.toJSON = jest.fn();
  }

  static file(path: string) {
    return new Uri({ path });
  }
  static parse(path: string) {
    return new Uri({ path });
  }
}

// const tempUri: Uri = Uri.file('test');
// const workspaceFolder: unknown = { uri: tempUri,  index: 0,  name: 'WorkspaceFolder' };

export const mockGet = jest.fn();
export const mockGetWorkspaceFolder = jest.fn();
export const mockShowInformationMessage = jest.fn();
export const mockShowErrorMessage = jest.fn();
export const mockShowWarningMessage = jest.fn();
export const mockOnDidCloseTerminal = jest.fn();
export const mockCreateTerminal = jest.fn();
export const mockRegisterCommand = jest.fn();
export const mockFindFiles = jest.fn();
export const mockShowOpenDialog = jest.fn();
// export const mockWorkspaceFolder = jest.fn();
// export const mockWorkspaceFolders = jest.fn().mockReturnValue([mockWorkspaceFolder]);
// // export const mockWorkspace = jest.fn();
export const mockAsRelativePath = jest.fn();
// // export const mockWorkspaceFolders = jest.fn().mockReturnValue([workspaceFolder]);// = jest.fn();//.mockReturnValue([{uri: { path: 'workspace', fsPath: 'test' }, name: 'workspace', index: 0}]);
// //.mockReturnValue([{uri: new Uri({ path: '/workspace' }), name: 'workspace', index: 0}]);
// //.mockReturnValue(undefined);
// // export const stubWorkspaceFolders: WorkspaceFolder[] = [{uri: new Uri({ path: '/workspace' }), name: 'workspace', index: 0}];

export const workspace = {
  getWorkspaceFolder: mockGetWorkspaceFolder,
  getConfiguration: jest.fn(() => ({
    get: mockGet,
  })),
  findFiles: mockFindFiles,
  // // workspaceFolders: {
  // //   onDidChange: jest.fn(),
  // //   // get: mockWorkspaceFolders
  // //   get: mockWorkspaceFolders
  // // }
  // workspaceFolders: mockWorkspaceFolders,

  // workspace: mockWorkspace,
  //workspaceFolders: [{uri: new Uri({ path: 'workspace' }), name: 'workspace', index: 0}]
  asRelativePath: mockAsRelativePath,
};

export const window = {
  showInformationMessage: mockShowInformationMessage,
  showErrorMessage: mockShowErrorMessage,
  showWarningMessage: mockShowWarningMessage,
  showOpenDialog: mockShowOpenDialog,
  onDidCloseTerminal: mockOnDidCloseTerminal,
  createTerminal: mockCreateTerminal,
  activeTextEditor: {},
};

export const commands = {
  registerCommand: mockRegisterCommand,
};
