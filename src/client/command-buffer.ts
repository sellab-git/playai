import type { Command } from '../engine';

type SettingsCommand = Extract<Command, { type: 'configure' }> & { setup: NonNullable<Extract<Command, { type: 'configure' }>['setup']> };
export type Submission = 'send' | 'queued' | 'reject';

/** Unsent preparation edits only. The transport retains ownership of active intents and retries. */
export class CommandBuffer {
  private settings: SettingsCommand | null = null;
  private barrier: Command | null = null;

  get hasBarrier(): boolean { return this.barrier !== null; }

  queuedCommands(): readonly Command[] {
    return structuredClone([...(this.settings ? [this.settings] : []), ...(this.barrier ? [this.barrier] : [])]);
  }

  /** isSettingsEdit must identify an edit to the current selection, not navigation or game selection. */
  submit(command: Command, activeCommand: Command | null, isSettingsEdit: boolean): Submission {
    if (!activeCommand) return this.settings || this.barrier ? 'reject' : 'send';
    if (activeCommand.type !== 'configure' || !activeCommand.setup || this.barrier) return 'reject';
    const gameId = activeCommand.setup.gameId;
    if (isSettingsEdit && command.type === 'configure' && command.setup?.gameId === gameId) {
      this.settings = structuredClone(command) as SettingsCommand;
      return 'queued';
    }
    if (command.type === 'action' || isSettingsEdit) return 'reject';
    // The game preparation adapter has already derived its start payload from the latest draft.
    this.barrier = structuredClone(command);
    return 'queued';
  }

  /** Call only after accepted acknowledgement; install the returned command as active before accepting more input. */
  takeNext(): Command | null {
    if (this.settings) {
      const command = this.settings;
      this.settings = null;
      return command;
    }
    const command = this.barrier;
    this.barrier = null;
    return command;
  }

  /** Rejection or lost preparation context cancels unsent work, never the transport's active retry. */
  clear(): void { this.settings = null; this.barrier = null; }
}
