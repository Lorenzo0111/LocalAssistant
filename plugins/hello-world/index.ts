import { RegistrablePlugin } from "../../src/plugin";

export default class HelloWorldPlugin extends RegistrablePlugin {
  readonly name = "hello-world";

  async register(): Promise<void> {
    this.logger().info(`Hello from ${this.name}`);
  }

  async unregister(): Promise<void> {
    this.logger().info(`Goodbye from ${this.name}`);
  }
}
