import { mockCreateTerminal, window } from '../__mocks__/vscode';
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
      runCommand(mockTerminal as any)('send me to the terminal');

      expect(mockTerminal.show).toHaveBeenCalled();
      expect(mockTerminal.sendText).toHaveBeenCalledWith('send me to the terminal');
    });
  });
  describe('Make resuable terminal', () => {
    it('should return a function and register a terminalDidClose listener', () => {
      const res = makeReusableTerminal({ name: 'a terminal' });

      expect(res).toEqual(expect.any(Function));
      expect(window.onDidCloseTerminal).toHaveBeenCalledWith(expect.any(Function));
      expect(window.onDidCloseTerminal).toHaveBeenCalledTimes(1);
    });
    it('should return the same terminal when no terminal has been closed', () => {
      const terminalFn = makeReusableTerminal({ name: 'a terminal' });
      mockCreateTerminal.mockReturnValueOnce({ processId: 1 });

      const terminal = terminalFn();

      expect(window.createTerminal).toHaveBeenCalledWith('a terminal');
      expect(console.log).toHaveBeenCalledWith('Created a new reusable terminal for Stryker Runner');
      expect(console.log).not.toHaveBeenCalledWith('Reusing terminal for Stryker Runner');
      expect(terminal.processId).toEqual(1);

      const terminal2 = terminalFn();

      expect(window.createTerminal).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('Reusing terminal for Stryker Runner');
      expect(terminal2.processId).toEqual(1);
    });
    describe('With onDidCloseTerminal callback', () => {
      it('should return the same terminal when an unknown terminal has been closed', () => {
        const terminalFn = makeReusableTerminal({ name: 'a terminal' });
        const terminalDidCloseCallback = window.onDidCloseTerminal.mock.calls[0][0];
        mockCreateTerminal.mockReturnValueOnce({ processId: 1 });

        const terminal = terminalFn();

        expect(window.createTerminal).toHaveBeenCalledWith('a terminal');
        expect(console.log).toHaveBeenCalledWith('Created a new reusable terminal for Stryker Runner');
        expect(console.log).not.toHaveBeenCalledWith('Reusing terminal for Stryker Runner');
        expect(terminal.processId).toEqual(1);

        // Close the terminal that has just been opened
        terminalDidCloseCallback({ processId: 2 });

        const terminal2 = terminalFn();

        expect(window.createTerminal).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith('Reusing terminal for Stryker Runner');
        expect(terminal2.processId).toEqual(1);
      });
      it('should create a new terminal if the old one has been closed', () => {
        const terminalFn = makeReusableTerminal({ name: 'a terminal' });
        const terminalDidCloseCallback = window.onDidCloseTerminal.mock.calls[0][0];
        mockCreateTerminal.mockReturnValueOnce({ processId: 1 });
        mockCreateTerminal.mockReturnValueOnce({ processId: 2 });

        const terminal = terminalFn();

        expect(window.createTerminal).toHaveBeenCalledWith('a terminal');
        expect(console.log).toHaveBeenCalledWith('Created a new reusable terminal for Stryker Runner');
        expect(terminal.processId).toEqual(1);

        // Close the terminal that has just been opened
        terminalDidCloseCallback({ processId: 1 });
        expect(console.log).toHaveBeenCalledWith("Stryker Runner's reusable terminal was closed");

        const terminal2 = terminalFn();

        expect(window.createTerminal).toHaveBeenCalledTimes(2);
        expect(console.log).not.toHaveBeenCalledWith('Reusing terminal for Stryker Runner');
        expect(terminal2.processId).toEqual(2);
      });
    });
    describe('The onDidCloseTerminal callback', () => {
      it('should do nothing if no terminal has been asked for', () => {
        makeReusableTerminal({ name: 'a terminal' });
        const terminalDidCloseCallback = window.onDidCloseTerminal.mock.calls[0][0];

        // Trigger the callback
        terminalDidCloseCallback({ processId: 1 });

        expect(console.log).not.toHaveBeenCalledWith('Created a new reusable terminal for Stryker Runner');
        expect(console.log).not.toHaveBeenCalledWith('Reusing terminal for Stryker Runner');
      });
    });
  });
});
