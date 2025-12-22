import express from "express";
import session from "express-session";
import router from "./routes.js";

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
app.use(router);

export default app;
