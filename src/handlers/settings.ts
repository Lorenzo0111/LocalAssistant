import type { Setting } from "@prisma/client";
import { createLogger } from "../services/logger";
import { prisma } from "../services/prisma";

export class SettingHandler {
  private readonly logger = createLogger("settings");
  private readonly settings: Setting[] = [];

  async init() {
    const dbSettings = await prisma.setting.findMany();
    this.settings.push(...dbSettings);

    this.logger.info(`Loaded ${this.settings.length} settings`);
  }

  getSettings(keys: string[]): (Setting | undefined)[] {
    const settings: (Setting | undefined)[] = [];

    for (const key of keys) {
      const setting = this.getSetting(key);
      if (setting) settings.push(setting);
    }

    if (settings.length !== keys.length)
      for (let i = 0; i < keys.length; i++)
        if (!settings[i]) settings[i] = undefined;

    return settings;
  }

  getSetting(key: string): Setting | undefined {
    return this.settings.find((setting) => setting.key === key);
  }

  allSettings(): Setting[] {
    return [...this.settings];
  }

  async setSetting(key: string, value: string) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    const setting = this.getSetting(key);
    if (setting) setting.value = value;
    else this.settings.push({ key, value });
  }
}
