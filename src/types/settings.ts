import { z } from "zod";

export const enabledPluginsSchema = z.array(z.string());
