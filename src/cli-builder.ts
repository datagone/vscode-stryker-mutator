import { dotnetCommand } from './config';
import { InvalidArgumentsException, MissingArgumentsException } from './dotnet-cli-exception';

import shellEscape from 'shell-escape';

const allowedCommand: string[] = ['stryker', 'tool', '--version'];

export const commandBuilder = (args: string[]): string => {
  if (args.length === 0) {
    throw new MissingArgumentsException('No arguments provided.');
  }

  if (!allowedCommand.includes(args[0])) {
    throw new InvalidArgumentsException(`The sub-command '${args[0]}' is not supported.`);
  }

  const escapedArgs = shellEscape(args);

  const dotnetExe = dotnetCommand();
  return `${dotnetExe} ${escapedArgs}`;
};
