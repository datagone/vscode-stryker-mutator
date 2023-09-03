import { window } from 'vscode';
import Constants from './constants';

export const chooseToRunFullMutationTest = async (): Promise<boolean> => {
  let mustRun: boolean = true;
  const selection = await window.showWarningMessage(
    '🧟‍♀️🧟‍♂️ Unleashing 🧟‍♂️🧟‍♀️ too much 🧟‍♀️🧟‍♂️ mutants 🧟‍♂️🧟‍♀️ into the wild (aka running stryker on a project or a solution) can be time and resources consuming. Are you sure you want to do this?',
    'Yes',
    'No',
  );
  if (selection === 'No' || selection === undefined) {
    mustRun = false;
    window.showInformationMessage(`${Constants.strykerDotnetTitle}: Your computer thanks you! 😇`);
  }
  return mustRun;
};
