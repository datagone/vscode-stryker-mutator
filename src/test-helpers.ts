export const mockConsoleLog = () => {
  let originalConsoleLog: typeof console.log;
  beforeAll(() => {
    originalConsoleLog = console.log;
    console.log = jest.fn();
  });
  afterAll(() => {
    console.log = originalConsoleLog;
  });
};
