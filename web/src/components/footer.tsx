export default function Footer() {
  const cols = {
    Product: ["Blog", "Series", "Authors"],
    Company: ["About", "Careers", "Contact"],
    Legal: ["Privacy", "Terms", "Cookies"],
  };
  return (
    <footer id="about" className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="space-y-3 md:col-span-2">
            <a href="#" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-50 dark:text-zinc-900">
                In
              </span>
              Inkwell
            </a>
            <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
              Thoughtful writing on software, architecture and building products people love.
            </p>
          </div>
          {Object.entries(cols).map(([title, items]) => (
            <div key={title}>
              <h4 className="mb-3 text-sm font-semibold">{title}</h4>
              <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                {items.map((i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-50">
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-zinc-200 pt-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:text-zinc-400">
          <p>© {new Date().getFullYear()} Inkwell. All rights reserved.</p>
          <div className="flex gap-4">
            {["X", "GitHub", "LinkedIn"].map((s) => (
              <a key={s} href="#" className="hover:text-zinc-900 dark:hover:text-zinc-50">
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
