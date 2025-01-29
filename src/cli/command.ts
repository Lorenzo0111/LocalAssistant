export interface Command {
  name: string;
  description: string;
  usage: string;
  args: number;

  run(args: string[]): Promise<string>;
}
