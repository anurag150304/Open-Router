import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "OpenRouter" },
    { name: "description", content: "Welcome to OpenRouter!" },
  ];
}

export default function Home() {
  return <h1>Landing Page</h1>
}
