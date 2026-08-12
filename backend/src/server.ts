import app from "./app";
import { seedIfEmpty } from "./utils/seed";

const port = Number(process.env.PORT ?? 5000);

async function start() {
  await seedIfEmpty();

  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

start();

