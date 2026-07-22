import fs from "fs";
import path from "path";

function validateTask2() {
  console.log("🚀 Running Task 2 Validation Checks...\n");

  const middlewarePath = path.join(process.cwd(), "middleware.ts");
  const proxyPath = path.join(process.cwd(), "proxy.ts");
  const routePath = path.join(process.cwd(), "app/api/imagekit/auth/route.ts");

  if (!fs.existsSync(middlewarePath)) {
    throw new Error("middleware.ts does not exist!");
  }
  if (!fs.existsSync(proxyPath)) {
    throw new Error("proxy.ts does not exist!");
  }
  if (!fs.existsSync(routePath)) {
    throw new Error("app/api/imagekit/auth/route.ts does not exist!");
  }

  const middlewareContent = fs.readFileSync(middlewarePath, "utf-8");
  const requiredRoutes = ["/gallery(.*)", "/editor(.*)", "/account(.*)", "/api/imagekit/auth(.*)", "/api/media(.*)"];
  for (const route of requiredRoutes) {
    if (!middlewareContent.includes(route)) {
      throw new Error(`middleware.ts missing route matcher for ${route}`);
    }
  }
  if (!middlewareContent.includes("clerkMiddleware") || !middlewareContent.includes("auth.protect()")) {
    throw new Error("middleware.ts does not properly invoke clerkMiddleware / auth.protect()");
  }

  const routeContent = fs.readFileSync(routePath, "utf-8");
  if (!routeContent.includes("await auth()") || !routeContent.includes("status: 401")) {
    throw new Error("route.ts does not enforce Clerk auth() or return 401 status!");
  }

  console.log("   ✅ middleware.ts verified with required protected routes.");
  console.log("   ✅ proxy.ts verified.");
  console.log("   ✅ app/api/imagekit/auth/route.ts verified for 401 status and auth().");
  console.log("\n🎉 TASK 2 VALIDATION PASSED SUCCESSFULLY!");
}

validateTask2();
