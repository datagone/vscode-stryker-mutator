import path from 'path';
import { Uri, mockCreateTerminal, window, workspace } from '../__mocks__/vscode';
import { makeReusableTerminal, runCommand } from './terminal';
import { mockConsoleLog } from './test-helpers';

const mockTerminal = {
  show: jest.fn(),
  sendText: jest.fn(),
};

describe('Terminal', () => {
  mockConsoleLog();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Run command', () => {
    it('should return a function', () => {
      const res = runCommand(mockTerminal as any);

      expect(res).toEqual(expect.any(Function));
    });
    it('should curry a terminal that can show and send a command', () => {
      const COMMAND_SEND_TO_TERMINAL: string = 'send me to the terminal';

      runCommand(mockTerminal as any)(COMMAND_SEND_TO_TERMINAL);

      expect(mockTerminal.show).toHaveBeenCalled();

      expect(mockTerminal.sendText).toHaveBeenCalledWith(COMMAND_SEND_TO_TERMINAL);
    });
  });

  describe('WHEN making a resuable terminal', () => {
    const A_TERMINAL_NAME: string = 'a terminal name';

    it('THEN should return a function and register a terminalDidClose listener', () => {
      const res = makeReusableTerminal({ name: A_TERMINAL_NAME });

      expect(res).toEqual(expect.any(Function));
      expect(window.onDidCloseTerminal).toHaveBeenCalledWith(expect.any(Function));
      expect(window.onDidCloseTerminal).toHaveBeenCalledTimes(1);
    });

    describe('GIVEN a defined working directory', () => {
      const WORKSPACE_FOLDER: string = '/path/to/my/workspace/folder/';
      const EXPECTED_TEXT_LOG_WHEN_TERMINAL_HAS_BEEN_CREATED: string =
        'Created a new reusable terminal for Stryker Runner';
      const EXPECTED_TEXT_LOG_WHEN_REUSING_A_TERMINAL: string = 'Reusing terminal for Stryker Runner';
      const EXPECTED_TEXT_LOG_WHEN_REUSABLE_TERMINAL_HAS_BEEN_CLOSED: string = `Stryker Runner's reusable terminal was closed`;

      let folder: any = undefined as any;
      let expectedParametersToCreateTerminal: any = undefined as any;

      beforeEach(() => {
        folder = { uri: Uri.parse(WORKSPACE_FOLDER) };
        const stubWorkspaceFolders = [folder];
        workspace.workspaceFolders = stubWorkspaceFolders as any;

        expectedParametersToCreateTerminal = { name: A_TERMINAL_NAME, cwd: path.normalize(WORKSPACE_FOLDER) };
      });

      it('THEN should return the same terminal when no terminal has been closed', () => {
        const terminalFn = makeReusableTerminal({ name: A_TERMINAL_NAME });
        mockCreateTerminal.mockReturnValueOnce({ processId: 1 });

        const terminal = terminalFn();

        expect(window.createTerminal).toHaveBeenCalledWith(expectedParametersToCreateTerminal);
        expect(console.log).toHaveBeenCalledWith(EXPECTED_TEXT_LOG_WHEN_TERMINAL_HAS_BEEN_CREATED);
        expect(console.log).not.toHaveBeenCalledWith(EXPECTED_TEXT_LOG_WHEN_REUSING_A_TERMINAL);
        expect(terminal.processId).toEqual(1);

        const terminal2 = terminalFn();

        expect(window.createTerminal).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith(EXPECTED_TEXT_LOG_WHEN_REUSING_A_TERMINAL);
        expect(terminal2.processId).toEqual(1);
      });

      describe('AND GIVEN With onDidCloseTerminal callback', () => {
        it('should return the same terminal when an unknown terminal has been closed', () => {
          const terminalFn = makeReusableTerminal({ name: A_TERMINAL_NAME });
          const terminalDidCloseCallback = window.onDidCloseTerminal.mock.calls[0][0];
          mockCreateTerminal.mockReturnValueOnce({ processId: 1 });

          const terminal = terminalFn();

          expect(window.createTerminal).toHaveBeenCalledWith(expectedParametersToCreateTerminal);
          expect(console.log).toHaveBeenCalledWith(EXPECTED_TEXT_LOG_WHEN_TERMINAL_HAS_BEEN_CREATED);
          expect(console.log).not.toHaveBeenCalledWith(EXPECTED_TEXT_LOG_WHEN_REUSING_A_TERMINAL);
          expect(terminal.processId).toEqual(1);

          // Close the terminal that has just been opened
          terminalDidCloseCallback({ processId: 2 });

          const terminal2 = terminalFn();

          expect(window.createTerminal).toHaveBeenCalledTimes(1);
          expect(console.log).toHaveBeenCalledWith(EXPECTED_TEXT_LOG_WHEN_REUSING_A_TERMINAL);
          expect(terminal2.processId).toEqual(1);
        });
        it('should create a new terminal if the old one has been closed', () => {
          const terminalFn = makeReusableTerminal({ name: A_TERMINAL_NAME });
          const terminalDidCloseCallback = window.onDidCloseTerminal.mock.calls[0][0];
          mockCreateTerminal.mockReturnValueOnce({ processId: 1 });
          mockCreateTerminal.mockReturnValueOnce({ processId: 2 });

          const terminal = terminalFn();

          expect(window.createTerminal).toHaveBeenCalledWith(expectedParametersToCreateTerminal);
          expect(console.log).toHaveBeenCalledWith(EXPECTED_TEXT_LOG_WHEN_TERMINAL_HAS_BEEN_CREATED);
          expect(terminal.processId).toEqual(1);

          // Close the terminal that has just been opened
          terminalDidCloseCallback({ processId: 1 });
          expect(console.log).toHaveBeenCalledWith(EXPECTED_TEXT_LOG_WHEN_REUSABLE_TERMINAL_HAS_BEEN_CLOSED);

          const terminal2 = terminalFn();

          expect(window.createTerminal).toHaveBeenCalledTimes(2);
          expect(console.log).not.toHaveBeenCalledWith(EXPECTED_TEXT_LOG_WHEN_REUSING_A_TERMINAL);
          expect(terminal2.processId).toEqual(2);
        });
      });

      describe('AND GIVEN the onDidCloseTerminal callback', () => {
        it('should do nothing if no terminal has been asked for', () => {
          makeReusableTerminal({ name: A_TERMINAL_NAME });
          const terminalDidCloseCallback = window.onDidCloseTerminal.mock.calls[0][0];

          // Trigger the callback
          terminalDidCloseCallback({ processId: 1 });

          expect(console.log).not.toHaveBeenCalledWith(EXPECTED_TEXT_LOG_WHEN_TERMINAL_HAS_BEEN_CREATED);
          expect(console.log).not.toHaveBeenCalledWith('Reusing terminal for Stryker Runner');
        });
      });
    });
  });
});
