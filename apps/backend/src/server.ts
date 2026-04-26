import { app } from "./app.js";
import { env } from "./config/env.js";

const port = env.port;
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api-docs`);
  console.log(`Frontend: http://localhost:5173`);
});
