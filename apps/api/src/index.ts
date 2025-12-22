import app from "./app.js";
import prisma from "./lib/db.js";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${port}`);
});

let shuttingDown = false;

const shutdown = async () => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });

  await prisma.$disconnect();
};

process.on("SIGINT", () => {
  shutdown()
    .catch(() => undefined)
    .finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  shutdown()
    .catch(() => undefined)
    .finally(() => process.exit(0));
});
