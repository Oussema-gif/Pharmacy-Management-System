import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './core/auth.guard';

import { BranchListComponent } from './branches/branch-list/branch-list.component';
import { BranchFormComponent } from './branches/branch-form/branch-form.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserFormComponent } from './users/user-form/user-form.component';

import { SupplierListComponent } from './suppliers/supplier-list/supplier-list.component';
import { SupplierFormComponent } from './suppliers/supplier-form/supplier-form.component';
import { MedicationListComponent } from './medications/medication-list/medication-list.component';
import { MedicationFormComponent } from './medications/medication-form/medication-form.component';

import { InventoryListComponent } from './inventory/inventory-list/inventory-list.component';
import { PurchaseFormComponent } from './inventory/purchase-form/purchase-form.component';

import { PosComponent } from './pos/pos/pos.component';

import { PatientListComponent } from './patients/patient-list/patient-list.component';
import { PatientFormComponent } from './patients/patient-form/patient-form.component';
import { PrescriptionListComponent } from './prescriptions/prescription-list/prescription-list.component';
import { PrescriptionFormComponent } from './prescriptions/prescription-form/prescription-form.component';
import { ProfileComponent } from './profile/profile.component';

import { ReportsComponent } from './reports/reports/reports.component';
import { AlertsComponent } from './alerts/alerts/alerts.component';
import { AuditLogsComponent } from './audit-logs/audit-logs/audit-logs.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'branches', component: BranchListComponent },
      { path: 'branches/new', component: BranchFormComponent },
      { path: 'branches/edit/:id', component: BranchFormComponent },
      { path: 'users', component: UserListComponent },
      { path: 'users/new', component: UserFormComponent },
      { path: 'users/edit/:id', component: UserFormComponent },
      { path: 'suppliers', component: SupplierListComponent },
      { path: 'suppliers/new', component: SupplierFormComponent },
      { path: 'suppliers/edit/:id', component: SupplierFormComponent },
      { path: 'medications', component: MedicationListComponent },
      { path: 'medications/new', component: MedicationFormComponent },
      { path: 'medications/edit/:id', component: MedicationFormComponent },
      { path: 'inventory', component: InventoryListComponent },
      { path: 'inventory/purchase/new', component: PurchaseFormComponent },
      { path: 'pos', component: PosComponent },
      { path: 'patients', component: PatientListComponent },
      { path: 'patients/new', component: PatientFormComponent },
      { path: 'patients/edit/:id', component: PatientFormComponent },
      { path: 'prescriptions', component: PrescriptionListComponent },
      { path: 'prescriptions/new', component: PrescriptionFormComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'alerts', component: AlertsComponent },
      { path: 'audit-logs', component: AuditLogsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];















