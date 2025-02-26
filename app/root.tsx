import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Header, links as headerLinks } from "~/components/Header/Header";
import { useIOSZoomPrevention } from "~/hooks/useIOSZoomPrevention";

// Import global styles
import globalStyles from "./styles/global.css?url";
import variables from "./styles/variables.css?url";
import icons from "./styles/icons.css?url";

export const meta: MetaFunction = () => {
  return [
    { title: "MobielPlus | Specialist in Telefoon Accessoires - Apple & Samsung" },
    {
      name: "description",
      content: "MobielPlus, dé specialist in telefoon accessoires voor Apple en Samsung. Ontdek ons uitgebreide assortiment hoesjes, opladers, screenprotectors en meer. Originele producten met snelle levering in Nederland.",
    },
    { name: "keywords", content: "telefoon accessoires, Apple accessoires, Samsung accessoires, hoesjes, opladers, screenprotectors, MobielPlus" },
    { property: "og:title", content: "MobielPlus | Specialist in Telefoon Accessoires - Apple & Samsung" },
    { property: "og:description", content: "Specialist in telefoon accessoires voor Apple en Samsung. Uitgebreid assortiment aan originele accessoires met snelle levering." },
    { name: "language", content: "nl" }
  ];
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: globalStyles },
  { rel: "stylesheet", href: variables },
  { rel: "stylesheet", href: icons },
  ...headerLinks(), // Load styles specific to Header
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  useIOSZoomPrevention();

  return (
    <html lang="nl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}