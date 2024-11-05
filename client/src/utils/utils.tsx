export function buildPath(route: string): string {
  if (process.env.NODE_ENV === "production") {
    return "https://whoogaapi.com/" + route;
  } else {
    return "http://localhost:3000/" + route;
  }
}
