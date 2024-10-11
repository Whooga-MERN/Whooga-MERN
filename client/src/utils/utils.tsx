export function buildPath(route: string): string {
  if (process.env.NODE_ENV === "production") {
    return "https://main.d201kh2abos6az.amplifyapp.com/" + route;
  } else {
    return "http://localhost:3000/" + route;
  }
}
