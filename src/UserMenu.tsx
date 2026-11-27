import { useEffect, useId, useRef, useState } from "react";

import { signOutAccount, useAccount } from "./auth/firebase.ts";
import { useI18n } from "./i18n.tsx";
import { Icon } from "./Icon.tsx";

/**
 * Menu button (three lines) at the top right; opens a menu
 * with the account: profile, settings and log out, or log in / sign up. The
 * language is chosen on the settings page.
 * Used by the app's top bar and, for logged-in users, by the homepage header.
 */
export function UserMenu({
  basePath = "../",
  onSignOut,
}: {
  /** From the current page to the site root ("../" in app/, "" on the English homepage). */
  basePath?: string;
  /** Called after logging out. */
  onSignOut?: () => void;
} = {}) {
  const { t, lang } = useI18n();
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    // Focus the first item so the keyboard starts inside the menu.
    rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);


  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={t("Menu do usuário", "User menu")}
        className={`-mr-2 flex size-11 items-center justify-center rounded-control text-ink-2 transition hover:bg-sunken hover:text-ink active:scale-95 ${
          open ? "bg-sunken text-ink" : ""
        }`}
      >
        <Icon name="menu" className="size-6" />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={t("Menu do usuário", "User menu")}
          className="user-menu"
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            event.preventDefault();
            const items = [...event.currentTarget.querySelectorAll<HTMLElement>('[role^="menuitem"]')];
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
            items[next]?.focus();
          }}
        >
          {account ? (
            <div className="border-b border-line px-3 pb-3 pt-1">
              <p className="truncate text-sm font-semibold text-ink">{account.firstName || account.email}</p>
              {account.firstName && <p className="truncate text-xs text-muted">{account.email}</p>}
            </div>
          ) : null}
          <div className={account ? "pt-2" : ""}>
            {account ? (
              <>
              <a role="menuitem" href={`${basePath}profile/?lang=${lang}`} className="user-menu__item">
                {t("Minha conta", "My account")}
              </a>
              <a role="menuitem" href={`${basePath}settings/?lang=${lang}`} className="user-menu__item">
                {t("Configurações", "Settings")}
              </a>
              <button
                role="menuitem"
                className="user-menu__item"
                onClick={async () => {
                  await signOutAccount();
                  setOpen(false);
                  onSignOut?.();
                }}
              >
                {t("Sair", "Log out")}
              </button>
              </>
            ) : (
              <>
                <a role="menuitem" href={`${basePath}login/?lang=${lang}`} className="user-menu__item">
                  {t("Entrar", "Log in")}
                </a>
                <a role="menuitem" href={`${basePath}signup/?lang=${lang}`} className="user-menu__item">
                  {t("Criar conta", "Sign up")}
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
