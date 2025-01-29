import { createLogger } from "../services/logger";
import { DeviceManagerError, InvalidAdapterError } from "../types/errors";

export abstract class DeviceAction {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
}

export interface Device {
  id: string;
  name: string;
  actions: DeviceAction[];
}

export type AdaptedDevice = {
  adapter: DeviceAdapter;
} & Device;

export interface DeviceAdapter {
  name: string;

  getDevices(): Promise<Device[]>;
  getDevice(idOrName: string): Promise<Device | null>;

  executeAction(deviceId: string, actionId: string): Promise<boolean>;
}

export class DeviceHandler {
  private readonly logger = createLogger("device-manager");
  private readonly adapters: DeviceAdapter[] = [];

  registerAdapter(adapter: DeviceAdapter): void {
    const existingAdapter = this.adapters.find((d) => d.name === adapter.name);
    if (existingAdapter)
      throw new InvalidAdapterError(
        `Adapter with name ${adapter.name} already exists`,
      );

    this.adapters.push(adapter);
  }

  async getDevices(): Promise<Device[]> {
    const devices = await Promise.all(
      this.adapters.map((adapter) => adapter.getDevices()),
    );

    return devices.flat().filter((device) => device !== null);
  }

  async getDevice(idOrName: string): Promise<AdaptedDevice | null> {
    for (const adapter of this.adapters) {
      const device = await adapter.getDevice(idOrName);
      if (device)
        return {
          ...device,
          adapter,
        };
    }

    return null;
  }

  async executeAction(deviceId: string, actionId: string): Promise<boolean> {
    const device = await this.getDevice(deviceId);
    if (!device)
      throw new DeviceManagerError(`Device with id ${deviceId} not found`);

    const action = device.actions.find((a) => a.id === actionId.toLowerCase());
    if (!action)
      throw new DeviceManagerError(`Action with id ${actionId} not found`);

    this.logger.info(
      `Executing action ${action.name} on device ${device.name}`,
    );

    return device.adapter.executeAction(device.id, actionId.toLowerCase());
  }
}
