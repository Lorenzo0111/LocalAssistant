export class InvalidSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSetupError";
  }
}

export class InvalidToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidToolError";
  }
}

export class InvalidAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAdapterError";
  }
}

export class DeviceManagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeviceManagerError";
  }
}

export class CLIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CLIError";
  }
}
