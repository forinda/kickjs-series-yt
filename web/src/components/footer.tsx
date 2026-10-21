import { href, Link } from "react-router";
import { useAuth } from "@/context/auth-context";
import { Logo } from "./page-header";

const year = new Date().getFullYear();

export default function Footer() {
  const { user } = useAuth();
  const cols: [string, [string, string][]][] = [
    ["Read", [["Latest articles", "/"]]],
    [
      "Write",
      [
        ["Dashboard", href("/dashboard")],
        ["New article", href("/dashboard/articles/new")],
        ["Categories", href("/dashboard/categories")],
      ],
    ],
    [
      "Account",
      user
        ? [["Your profile", href("/dashboard/profile")]]
        : [
            ["Sign in", "/auth"],
            ["Create account", "/auth?page=register"],
          ],
    ],
  ];

  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5">
          <div className="space-y-3 sm:col-span-2">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Thoughtful writing on software, architecture and building products people love.
            </p>
          </div>
          {cols.map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-3 text-sm font-semibold">{title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="transition-colors hover:text-foreground">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Inkwell. All rights reserved.</p>
          <p>
            Built with{" "}
            <a
              href="https://kickjs.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary"
            >
              KickJS
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
