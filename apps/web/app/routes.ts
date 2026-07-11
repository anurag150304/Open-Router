import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),

    ...prefix("auth", [
        route("signup", "./routes/auth/signup.tsx"),
        route("signin", "./routes/auth/signin.tsx")
    ]),


    ...prefix("user", [
        route("dashboard", "./routes/user/dashboard.tsx")
    ])
] satisfies RouteConfig;
