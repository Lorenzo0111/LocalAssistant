import { type Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { RegistrablePlugin } from "../../src/plugin";

export default class TelegramPlugin extends RegistrablePlugin {
  readonly name = "telegram";
  private bot?: Telegraf;

  async register(): Promise<void> {
    const token = this.assistant.settingsManager.getSetting("TELEGRAM_TOKEN");
    if (!token) throw new Error("TELEGRAM_TOKEN is not set");

    this.bot = new Telegraf(token.value);
    this.bot.use(async (ctx, next) => {
      const user = ctx.from;
      if (!user || user.is_bot) return await next();

      const authorizedString = this.assistant.settingsManager.getSetting(
        "TELEGRAM_AUTHORIZED_USERS",
      );
      const authorized = authorizedString?.value.split(",") || [];
      if (!authorized.includes(user.id.toString()))
        return await ctx.reply(
          `Oh no! You are not authorized. If you want to use the bot run the \`telegram authorize ${user.id}\` command in the CLI.`,
          {
            parse_mode: "Markdown",
          },
        );

      return await next();
    });
    this.bot.start(this.onStart.bind(this));
    this.bot.on(message("text"), this.onMessage.bind(this));
    this.bot.launch();

    this.assistant.cli.registerCommand({
      name: "telegram",
      description: "Telegram commands",
      usage: "telegram <authorize> <id>",
      args: 2,
      run: async (args) => {
        const [command, id] = args;

        if (command === "authorize") {
          const authorizedString = this.assistant.settingsManager.getSetting(
            "TELEGRAM_AUTHORIZED_USERS",
          );
          const authorized = authorizedString?.value.split(",") || [];
          if (authorized[0] === "") authorized.shift();
          if (authorized.includes(id)) return "User is already authorized";

          authorized.push(id);
          await this.assistant.settingsManager.setSetting(
            "TELEGRAM_AUTHORIZED_USERS",
            authorized.join(","),
          );

          return "User authorized successfully";
        }

        return "Invalid command";
      },
    });
  }

  async onStart(ctx: Context) {
    await ctx.reply("Welcome to the assistant! How can I help you?");
  }

  async onMessage(ctx: Context) {
    if (!ctx.message || !("text" in ctx.message)) return;

    const response = await this.assistant.eval(ctx.message.text);
    await ctx.reply(response.content, {
      parse_mode: "Markdown",
    });
  }

  async unregister(): Promise<void> {
    this.bot?.stop();
  }
}
