import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Global suppression of harmless unhandled rejections
window.addEventListener('unhandledrejection', event => {
    const msg = String(event.reason?.message || event.reason);
    // Ignore the common "message channel closed" error from ZXing / extensions
    if (msg.includes('message channel closed')) {
        event.preventDefault();
        return;
    }
    console.warn('Unhandled Promise rejection (suppressed):', event.reason);
});

bootstrapApplication(AppComponent, appConfig)
    .catch(err => console.error(err));