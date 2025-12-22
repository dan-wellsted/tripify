import express from "express";
import session from "express-session";
import router from "./routes.js";

type AppOptions = {
  enableTestUserHeader?: boolean;
};

export function createApp(options: AppOptions = {}) {
  const app = express();
  const sessionSecret = process.env.SESSION_SECRET ?? "dev-session-secret";

  app.use(express.json());
  app.use(
    session({
      name: "tripplanner.sid",
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      }
    })
  );

  if (options.enableTestUserHeader) {
    app.use((req, _res, next) => {
      const testUserId = req.header("x-test-user-id");
      if (testUserId) {
        req.session.userId = testUserId;
      }

      next();
    });
  }

  app.use(router);

  return app;
}

const app = createApp();

export default app;
