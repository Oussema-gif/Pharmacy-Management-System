import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DarkModeService } from '../../core/services/dark-mode.service';

type UserRole = 'ADMIN' | 'MANAGER' | 'PHARMACIST' | 'CASHIER';

interface MenuItem {
  title: string;
  icon: string;
  link: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly darkModeService = inject(DarkModeService);

  readonly isDarkMode = this.darkModeService.theme;

  private readonly allMenuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'fas fa-chart-line',
      link: '/dashboard',
      roles: ['ADMIN', 'MANAGER', 'PHARMACIST', 'CASHIER']
    },
    {
      title: 'My Profile',
      icon: 'fas fa-user-circle',
      link: '/profile',
      roles: ['ADMIN', 'MANAGER', 'PHARMACIST', 'CASHIER']
    },
    {
      title: 'Branches',
      icon: 'fas fa-code-branch',
      link: '/branches',
      roles: ['ADMIN']
    },
    {
      title: 'Users',
      icon: 'fas fa-users',
      link: '/users',
      roles: ['ADMIN']
    },
    {
      title: 'Suppliers',
      icon: 'fas fa-truck',
      link: '/suppliers',
      roles: ['ADMIN', 'MANAGER']
    },
    {
      title: 'Medications',
      icon: 'fas fa-pills',
      link: '/medications',
      roles: ['ADMIN', 'MANAGER', 'PHARMACIST']
    },
    {
      title: 'Inventory',
      icon: 'fas fa-boxes-stacked',
      link: '/inventory',
      roles: ['ADMIN', 'MANAGER']
    },
    {
      title: 'Point of Sale',
      icon: 'fas fa-cash-register',
      link: '/pos',
      roles: ['ADMIN', 'MANAGER', 'PHARMACIST', 'CASHIER']
    },
    {
      title: 'Patients',
      icon: 'fas fa-user-injured',
      link: '/patients',
      roles: ['ADMIN', 'PHARMACIST']
    },
    {
      title: 'Prescriptions',
      icon: 'fas fa-file-prescription',
      link: '/prescriptions',
      roles: ['ADMIN', 'PHARMACIST']
    },
    {
      title: 'Reports',
      icon: 'fas fa-chart-column',
      link: '/reports',
      roles: ['ADMIN', 'MANAGER']
    },
    {
      title: 'Alerts',
      icon: 'fas fa-bell',
      link: '/alerts',
      roles: ['ADMIN', 'MANAGER', 'PHARMACIST']
    },
    {
      title: 'Audit Logs',
      icon: 'fas fa-clock-rotate-left',
      link: '/audit-logs',
      roles: ['ADMIN']
    }
  ];

  readonly menuItems: MenuItem[];

  constructor() {
    const role = this.getCurrentUserRole();
    this.menuItems = this.allMenuItems.filter((item) =>
      role ? item.roles.includes(role) : false
    );
  }

  toggleTheme(): void {
    this.darkModeService.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private getCurrentUserRole(): UserRole | null {
    const role = this.authService.getUserRole();

    if (!role) {
      return null;
    }

    const normalizedRole = role.toUpperCase();

    if (
      normalizedRole === 'ADMIN' ||
      normalizedRole === 'MANAGER' ||
      normalizedRole === 'PHARMACIST' ||
      normalizedRole === 'CASHIER'
    ) {
      return normalizedRole as UserRole;
    }

    return null;
  }
}