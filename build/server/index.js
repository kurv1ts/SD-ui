import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, createCookieSessionStorage } from "@remix-run/node";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts, Form } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function Layout({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: App
}, Symbol.toStringTag, { value: "Module" }));
let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    // use any name you want here
    sameSite: "lax",
    // this helps with CSRF
    path: "/",
    // remember to add this so the cookie will work in all routes
    httpOnly: true,
    // for security reasons, make this cookie http only
    secrets: ["s3cr3t"],
    // replace this with an actual secret
    secure: process.env.NODE_ENV === "production"
    // enable this in prod only
  }
});
let authenticator = new Authenticator(sessionStorage);
authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get("email");
    let password = form.get("password");
    let user = { id: "1", email: "asd@hot.ee", name: "John Doe", password };
    if (email !== user.email || password !== user.password) {
      throw new Error("Invalid email or password");
    }
    return user;
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "user-pass"
);
async function loader$1({ request }) {
  console.log("Dashboard route");
  let user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login"
  });
  console.log("User:", user);
  return {
    status: 200,
    headers: {
      "Content-Type": "text/html"
    },
    body: `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Dashboard</title>
            </head>
            <body>
                <h1>Dashboard</h1>
                <p>Welcome to the dashboard</p>
            </body>
        </html>
        `
  };
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const meta = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" }
  ];
};
function Index() {
  return /* @__PURE__ */ jsxs("div", { className: "font-sans p-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl", children: "Welcome to Remix" }),
    /* @__PURE__ */ jsxs("ul", { className: "list-disc mt-4 pl-6 space-y-2", children: [
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        "a",
        {
          className: "text-blue-700 underline visited:text-purple-900",
          target: "_blank",
          href: "https://remix.run/start/quickstart",
          rel: "noreferrer",
          children: "5m Quick Start"
        }
      ) }),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        "a",
        {
          className: "text-blue-700 underline visited:text-purple-900",
          target: "_blank",
          href: "https://remix.run/start/tutorial",
          rel: "noreferrer",
          children: "30m Tutorial"
        }
      ) }),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        "a",
        {
          className: "text-blue-700 underline visited:text-purple-900",
          target: "_blank",
          href: "https://remix.run/docs",
          rel: "noreferrer",
          children: "Remix Docs"
        }
      ) })
    ] })
  ] });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index,
  meta
}, Symbol.toStringTag, { value: "Module" }));
console.log("Login route");
function Screen() {
  return /* @__PURE__ */ jsxs(Form, { method: "post", children: [
    /* @__PURE__ */ jsx("input", { type: "email", name: "email", required: true }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "password",
        name: "password",
        autoComplete: "current-password",
        required: true
      }
    ),
    /* @__PURE__ */ jsx("button", { children: "Sign In" })
  ] });
}
async function action({ request }) {
  return await authenticator.authenticate("user-pass", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login"
  });
}
async function loader({ request }) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard"
  });
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: Screen,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-jgdZZHIj.js", "imports": ["/assets/jsx-runtime-56DGgGmo.js", "/assets/components-BX8V9fuq.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-B1un3pzZ.js", "imports": ["/assets/jsx-runtime-56DGgGmo.js", "/assets/components-BX8V9fuq.js"], "css": ["/assets/root-C1cZVWro.css"] }, "routes/dashboard": { "id": "routes/dashboard", "parentId": "root", "path": "dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/dashboard-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-B6hwyHK-.js", "imports": ["/assets/jsx-runtime-56DGgGmo.js"], "css": [] }, "routes/login": { "id": "routes/login", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/login-DWPqYdp-.js", "imports": ["/assets/jsx-runtime-56DGgGmo.js", "/assets/components-BX8V9fuq.js"], "css": [] } }, "url": "/assets/manifest-b42cd9e3.js", "version": "b42cd9e3" };
const mode = "production";
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "unstable_singleFetch": false, "unstable_lazyRouteDiscovery": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/dashboard": {
    id: "routes/dashboard",
    parentId: "root",
    path: "dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route2
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
