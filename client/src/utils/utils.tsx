export function buildPath(route: string): string {
  if (process.env.NODE_ENV === "production") {
    return (
      "http://whooga-env-1.eba-xvanh3td.us-east-1.elasticbeanstalk.com/" + route
    );
  } else {
    return "http://localhost:3000/" + route;
  }
}
