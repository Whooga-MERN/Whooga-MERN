// export function buildPath(route: string): string {
//   if (process.env.PRODUCTION === "production") {
//     return "https://main.d201kh2abos6az.amplifyapp.com/" + route;
//   } else {
//     return "http://localhost:3000/" + route;
//   }
// }

export function buildPath(route: string): string {
  if (!process && !process.env && process.env.NODE_ENV === "production") {
    return "https://main.d201kh2abos6az.amplifyapp.com/" + route;
  } else {
    return "http://localhost:3000/" + route;
  }
}

// const buildPath = (route: any) => {
//   const env = process.env.AWS_ENV || "local"; // Default to 'local' if AWS_ENV is not available
//   console.log("env: ", env);

//   let basePath;
//   switch (env) {
//     case "prod":
//       // basePath = "https://main.d201kh2abos6az.amplifyapp.com";
//       return (basePath = "http://localhost:3000" + route);
//     case "dev":
//       return (basePath = "http://localhost:3000" + route);

//     case "test":
//       return (basePath = "http://localhost:3000" + route);
//     default:
//       return (basePath = "http://localhost:3000" + route);
//   }
// };

// export default buildPath;
