interface IPathToMutate {
  fsPath: string;

  pathToMutateValidation(): Promise<void>;
}

export default IPathToMutate;
