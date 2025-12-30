import { applyCommand, initialTownState } from '../state/apply';
import { Command, TownState } from '../types';
import { PushCommandsResult, ServerAdapter } from './server-adapter';

export class FakeServerAdapter implements ServerAdapter {
  private snapshot: TownState;

  constructor(seed?: TownState) {
    this.snapshot = seed ?? initialTownState();
  }

  async fetchState(): Promise<TownState> {
    return this.snapshot;
  }

  async pushCommands(commands: Command[]): Promise<PushCommandsResult> {
    const acked: string[] = [];
    const rejected: { id: string; reason: string }[] = [];
    let next = this.snapshot;

    commands.forEach((command) => {
      const result = applyCommand(next, command);
      if (result.ok) {
        acked.push(command.id);
        next = result.state;
      } else {
        rejected.push({ id: command.id, reason: result.reason });
      }
    });

    this.snapshot = next;

    return { acked, rejected, newState: this.snapshot };
  }
}
