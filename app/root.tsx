import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";

// Layout component to wrap the entire application with the correct HTML structure
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children} {/* Render children within the layout */}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// The App component wraps the Outlet with the Layout component
export default function App() {
  return (
    <Layout>
      <Outlet /> {/* Renders the matched route component, such as your index.tsx */}
    </Layout>
  );
}