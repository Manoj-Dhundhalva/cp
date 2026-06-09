import app from "@/server.js";
import { env } from "@/config/env.js";
import { init } from "@/init/index.js";

app.get("/", (_, res) => res.send("Hello, World!"));

init()
  .then(() =>
    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
      console.log(`Environment: ${env.APP_STAGE}`);
    }),
  )
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
