import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'pharmacy-theme';
  private readonly transitionClass = 'theme-transitioning';

  readonly theme = signal<Theme>('light');

  initialize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const savedTheme = localStorage.getItem(this.storageKey) as Theme | null;
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    const theme: Theme =
      savedTheme === 'dark' || savedTheme === 'light'
        ? savedTheme
        : systemPrefersDark
          ? 'dark'
          : 'light';

    this.setTheme(theme, false, false);
  }

  toggle(): void {
    const nextTheme: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme, true, true);
  }

  setTheme(
    theme: Theme,
    persist = true,
    animate = true
  ): void {
    const root = this.document.documentElement;

    if (animate && isPlatformBrowser(this.platformId)) {
      root.classList.add(this.transitionClass);
    }

    this.theme.set(theme);
    root.setAttribute('data-bs-theme', theme);
    root.style.colorScheme = theme;

    if (persist && isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, theme);
    }

    if (animate && isPlatformBrowser(this.platformId)) {
      window.setTimeout(() => {
        root.classList.remove(this.transitionClass);
      }, 350);
    }
  }
}