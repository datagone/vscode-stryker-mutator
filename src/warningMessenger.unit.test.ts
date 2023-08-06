import { when } from 'jest-when';
import { mockShowInformationMessage, mockShowWarningMessage } from '../__mocks__/vscode';
import { chooseToRunFullMutationTest } from './warningMessenger';

describe('WHEN the Warning Message is shown to decide to run a full mutation', () => {
  const OFFICIAL_WARNING_MESSAGE: string =
    '🧟‍♀️🧟‍♂️ Unleashing 🧟‍♂️🧟‍♀️ too much 🧟‍♀️🧟‍♂️ mutants 🧟‍♂️🧟‍♀️ into the wild (aka running stryker on a project or a solution) can be time and resources consuming. Are you sure you want to do this?';
  const OFFICIAL_THANKYOU_MESSAGE: string = 'Stryker.NET: Your computer thanks you! 😇';
  const POSITIVE_VALUE: string = 'Yes';
  const NEGATIVE_VALUE: string = 'No';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('THEN the official warning message is shown to inform the user to take a decision', async () => {
    const actualResult = await chooseToRunFullMutationTest();

    expect(mockShowWarningMessage).toHaveBeenCalledTimes(1);
    expect(mockShowWarningMessage).toHaveBeenCalledWith(OFFICIAL_WARNING_MESSAGE, POSITIVE_VALUE, NEGATIVE_VALUE);
  });

  describe('AND GIVEN the user clicks on the "Yes" button', () => {
    beforeEach(() => {
      // Arrange (GIVEN)
      when(mockShowWarningMessage).mockResolvedValue(POSITIVE_VALUE);
    });

    it('THEN the return value is true', async () => {
      // Act (WHEN)
      const actualResult = await chooseToRunFullMutationTest();
      // Assert (THEN)
      expect(actualResult).toBeTruthy();
    });

    it('THEN the Thank You message is not shown', async () => {
      // Act (WHEN)
      await chooseToRunFullMutationTest();
      // Assert (THEN)
      expect(mockShowInformationMessage).not.toHaveBeenCalled();
    });
  });

  describe('AND GIVEN the user clicks on the "No" button', () => {
    beforeEach(() => {
      // Arrange (GIVEN)
      when(mockShowWarningMessage).mockResolvedValue(NEGATIVE_VALUE);
    });

    it('THEN the return value is false', async () => {
      // Act (WHEN)
      const actualResult = await chooseToRunFullMutationTest();
      // Assert (THEN)
      expect(actualResult).toBeFalsy();
    });

    it('THEN the official thank you message is shown', async () => {
      // Act (WHEN)
      await chooseToRunFullMutationTest();
      // Assert (THEN)
      expect(mockShowInformationMessage).toHaveBeenCalledTimes(1);
      expect(mockShowInformationMessage).toHaveBeenCalledWith(OFFICIAL_THANKYOU_MESSAGE);
    });
  });

  describe('AND GIVEN the user cancel the message (does not clicks on a button)', () => {
    beforeEach(() => {
      // Arrange (GIVEN)
      when(mockShowWarningMessage).mockResolvedValue(undefined);
    });

    it('THEN the return value is false', async () => {
      // Act (WHEN)
      const actualResult = await chooseToRunFullMutationTest();
      // Assert (THEN)
      expect(actualResult).toBeFalsy();
    });

    it('THEN the official thank you message is shown', async () => {
      // Act (WHEN)
      await chooseToRunFullMutationTest();
      // Assert (THEN)
      expect(mockShowInformationMessage).toHaveBeenCalledTimes(1);
      expect(mockShowInformationMessage).toHaveBeenCalledWith(OFFICIAL_THANKYOU_MESSAGE);
    });
  });
});
