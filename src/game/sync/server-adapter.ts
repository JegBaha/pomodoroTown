import { Command, TownState } from '../types';

export type PushCommandsResult = {
  acked: string[];
  rejected: { id: string; reason: string }[];
  newState?: TownState;
};

export interface ServerAdapter {
  fetchState(): Promise<TownState>;
  pushCommands(commands: Command[]): Promise<PushCommandsResult>;
}
