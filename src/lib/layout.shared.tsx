import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function AppIcon() {
  return (
    <>
      <img
        src={`${basePath}/images/logo-light.png`}
        alt=""
        aria-hidden="true"
        className="ring-fd-border h-9 w-9 rounded-lg ring-1 dark:hidden"
      />
      <img
        src={`${basePath}/images/logo-dark.png`}
        alt=""
        aria-hidden="true"
        className="ring-fd-border hidden h-9 w-9 rounded-lg ring-1 dark:block"
      />
    </>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.57 8.16-1.86 8.77c-.14.62-.51.77-1.03.48l-2.85-2.1-1.37 1.32c-.15.15-.28.28-.57.28l.2-2.9 5.27-4.76c.23-.2-.05-.32-.36-.12L8.5 13.05l-2.81-.88c-.61-.19-.62-.61.13-.91l10.99-4.24c.51-.18.96.13.76 1.14z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="flex h-10 items-center gap-2 leading-none">
          <AppIcon />
          <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-700 bg-clip-text text-base font-bold tracking-tight text-transparent dark:from-amber-300 dark:via-orange-400 dark:to-amber-500">
            RaspiBolt
          </span>
        </span>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      {
        type: 'icon',
        url: 'https://t.me/raspibolt',
        icon: <TelegramIcon />,
        text: 'Telegram',
        label: 'RaspiBolt on Telegram',
        external: true,
      },
      {
        type: 'icon',
        url: 'https://www.reddit.com/r/raspibolt/',
        icon: <RedditIcon />,
        text: 'Reddit',
        label: 'RaspiBolt on Reddit',
        external: true,
      },
    ],
  };
}
