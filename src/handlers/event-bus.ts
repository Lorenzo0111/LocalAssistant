import type { Command } from "../cli/command";
import type { RequestType } from "../types/requests";
import type { ResponseType } from "../types/responses";

export interface EventArgs {
  startup: [];
  "request:create": [RequestType];
  "request:process": [RequestType, ResponseType];
  command: [Command, string[]];
}

export class EventBus {
  // biome-ignore lint/complexity/noBannedTypes: Listener is not a banned type
  private listeners: { [key: string]: Function[] } = {};

  on<T extends keyof EventArgs>(
    event: T,
    listener: (...args: EventArgs[T]) => void,
  ) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  emit<T extends keyof EventArgs>(event: T, ...args: EventArgs[T]) {
    const listeners = this.listeners[event];
    if (listeners)
      for (const listener of listeners) {
        listener(...args);
      }
  }
}
