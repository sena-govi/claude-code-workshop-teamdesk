import { Link } from "@tanstack/react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import ThemeToggle from "./theme-toggle";

const navItems = [
  { label: "Home", tip: "Back to the start", to: "/" },
  { label: "About", tip: "What Teamdesk is", to: "/about" },
  { label: "Notes", tip: "Shared team notes", to: "/notes" },
  { label: "Team", tip: "See who is on the team", to: "/team" },
  { label: "Rooms", tip: "Meeting rooms and their seats", to: "/rooms" },
  {
    label: "Bookings",
    tip: "Book a room and see your bookings",
    to: "/bookings",
  },
  { label: "Tasks", tip: "Shared jobs and due dates", to: "/tasks" },
] as const;

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-border border-b bg-background/90 px-4 backdrop-blur-lg dark:bg-transparent">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base">
          <Link
            className="inline-flex items-center gap-2.5 font-heading text-foreground text-xl no-underline"
            to="/"
          >
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
            Teamdesk
          </Link>
        </h2>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 font-semibold text-sm sm:order-none sm:w-auto sm:pb-0">
          {navItems.map(({ label, to, tip }) => (
            <Tooltip key={to}>
              <TooltipTrigger asChild>
                <Link
                  activeProps={{ className: "nav-link is-active" }}
                  className="nav-link"
                  to={to}
                >
                  {label}
                </Link>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>{tip}</TooltipContent>
            </Tooltip>
          ))}
          <a
            className="nav-link"
            href="https://tanstack.com/start/latest/docs/framework/react/overview"
            rel="noreferrer"
            target="_blank"
          >
            Docs
          </a>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
