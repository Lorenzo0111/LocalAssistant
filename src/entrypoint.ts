import { Assistant } from "./assistant";
import { initRuntimeCLI } from "./cli/runtime";
import { prisma } from "./services/prisma";

async function main() {
  const instance = new Assistant();
  await instance.start();

  initRuntimeCLI(instance);
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
