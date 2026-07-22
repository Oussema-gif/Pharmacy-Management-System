import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { MedicationService } from '../../core/services/medication.service';
import { PosService, AvailableBatch } from '../../core/services/pos.service';
import { BranchService } from '../../core/services/branch.service';
import { InventoryService } from '../../core/services/inventory.service';
import { PatientService } from '../../core/services/patient.service';          // ✅ new
import { PrescriptionService } from '../../core/services/prescription.service'; // ✅ new
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/auth.service';
import { Medication } from '../../core/models/medication.model';
import { Batch } from '../../core/models/batch.model';
import { Patient } from '../../core/models/patient.model';
import { Prescription } from '../../core/models/prescription.model';
import { Branch } from '../../core/models/branch.model';
import { SaleRequest, SaleItemRequest } from '../../core/models/sale.model';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ZXingScannerModule],
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css']
})
export class PosComponent implements OnInit {
  private readonly authService = inject(AuthService);

  // ---- branch selector ----
  branches: Branch[] = [];
  selectedBranchId: number | null = null;
  isAdmin = false;
  userBranchId: number | null = null;
  userBranchName = '';

  // ---- medications filtered by branch stock ----
  medications: Medication[] = [];
  branchMedicationIds: Set<number> = new Set();

  patients: Patient[] = [];
  prescriptions: Prescription[] = [];

  selectedMedicationId: number | null = null;
  searchQuery = '';
  barcode = '';
  availableBatches: AvailableBatch[] = [];
  selectedBatch: AvailableBatch | null = null;
  quantity = 1;

  cart: { batch: AvailableBatch; quantity: number }[] = [];
  discount = 0;
  paymentMethod = 'Cash';
  patientId: number | null = null;
  prescriptionId: number | null = null;

  loading = false;
  loadingBranches = false;
  loadingStock = false;

  showScanner = false;
  scannerFormats = [BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.QR_CODE];

  constructor(
    private medicationService: MedicationService,
    private posService: PosService,
    private branchService: BranchService,
    private inventoryService: InventoryService,
    private patientService: PatientService,                   // ✅ injected
    private prescriptionService: PrescriptionService,         // ✅ injected
    private toastService: ToastService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    this.isAdmin = role === 'ADMIN';
    this.userBranchId = this.authService.getUserBranchId();

    this.initBranchSelector();
    this.loadPatients();
    this.loadPrescriptions();
  }

  // ---------- Branch logic ----------
  private initBranchSelector(): void {
    if (this.isAdmin) {
      this.loadingBranches = true;
      this.branchService.getAll().subscribe({
        next: (data: Branch[]) => {
          this.branches = data;
          this.loadingBranches = false;
          if (data.length > 0) {
            this.selectedBranchId = data[0].id!;
            this.loadAllMedications();
            this.loadBranchStock();
          }
        },
        error: () => this.toastService.show('error', 'Failed to load branches')
      });
    } else {
      if (this.userBranchId) {
        this.selectedBranchId = this.userBranchId;
        this.branchService.getById(this.userBranchId).subscribe({
          next: (branch: Branch) => {
            this.userBranchName = branch.name;
          },
          error: () => {
            this.userBranchName = 'Your Branch';
          }
        });
        this.loadAllMedications();
        this.loadBranchStock();
      }
    }
  }

  onBranchChange(): void {
    if (this.selectedBranchId) {
      this.clearSelection();
      this.loadBranchStock();
      // Optionally reload patients/prescriptions if admin wants to see branch-specific ones
      // For now, admin always sees all patients/prescriptions regardless of branch selector
    }
  }

  private clearSelection(): void {
    this.selectedMedicationId = null;
    this.availableBatches = [];
    this.selectedBatch = null;
  }

  // ---------- Data loading ----------
  private loadAllMedications(): void {
    this.medicationService.getAll().subscribe({
      next: (data) => (this.medications = data),
      error: () => this.toastService.show('error', 'Failed to load medications')
    });
  }

  private loadBranchStock(): void {
    if (!this.selectedBranchId) return;
    this.loadingStock = true;
    this.inventoryService.getStockByBranch(this.selectedBranchId).subscribe({
      next: (batches: Batch[]) => {
        this.branchMedicationIds = new Set(
          batches.filter(b => b.quantity > 0).map(b => b.medicationId!)
        );
        this.loadingStock = false;
      },
      error: () => {
        this.loadingStock = false;
        this.branchMedicationIds = new Set();
        this.toastService.show('error', 'Failed to load branch stock');
      }
    });
  }

  private loadPatients(): void {
    // Non‑admin: filter by own branch; admin: see all
    const branchId = this.isAdmin ? undefined : this.userBranchId;
    const request = this.isAdmin
      ? this.patientService.getAll()
      : this.patientService.getAll(branchId!);

    request.subscribe({
      next: (data) => (this.patients = data),
      error: () => this.toastService.show('error', 'Failed to load patients')
    });
  }

  private loadPrescriptions(): void {
    // Only load prescriptions for roles that can access them
    const role = this.authService.getUserRole();
    if (role !== 'ADMIN' && role !== 'PHARMACIST') {
      this.prescriptions = [];
      this.prescriptionId = null;
      return;
    }

    // Non‑admin: filter by own branch; admin: see all
    const branchId = this.isAdmin ? undefined : this.userBranchId;
    const request = this.isAdmin
      ? this.prescriptionService.getAll()
      : this.prescriptionService.getAll(branchId!);   // make sure PrescriptionService accepts optional branchId

    request.subscribe({
      next: (data) => (this.prescriptions = data),
      error: () => this.toastService.show('error', 'Failed to load prescriptions')
    });
  }

  // ---------- Filtered medication list ----------
  get filteredMedications(): Medication[] {
    let result = this.medications;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(q));
    }
    if (this.selectedBranchId && this.branchMedicationIds.size > 0) {
      result = result.filter(m => this.branchMedicationIds.has(m.id!));
    }
    return result;
  }

  // ---------- Medication & batch ----------
  selectMedication(medicationId: number): void {
    this.selectedMedicationId = medicationId;
    if (!this.selectedBranchId) return;

    this.posService.getBatchesByMedicationAndBranch(medicationId, this.selectedBranchId).subscribe({
      next: (batches) => {
        this.availableBatches = batches.filter(b => b.quantity > 0);
        this.selectedBatch = null;
        if (this.availableBatches.length === 0) {
          this.toastService.show('warning', 'No stock available for this medication in the selected branch');
        }
      },
      error: () => this.toastService.show('error', 'No batches available')
    });
  }

  onBarcodeEnter(): void {
    if (!this.barcode.trim()) return;
    this.lookupBarcode(this.barcode.trim());
  }

  private lookupBarcode(code: string): void {
    this.http.get<any>(`http://localhost:8080/api/medications/barcode/${code}`).subscribe({
      next: (med) => {
        this.selectMedication(med.id);
        this.toastService.show('success', `Scanned: ${med.name}`);
        this.barcode = '';
      },
      error: () => this.toastService.show('error', 'Medication not found for this barcode')
    });
  }

  // ---------- Scanner ----------
  openScanner(): void { this.showScanner = true; }
  closeScanner(): void { this.showScanner = false; }

  onCodeResult(result: string): void {
    this.showScanner = false;
    this.lookupBarcode(result);
  }

  onScannerError(error: any): void {
    console.warn('Scanner error (suppressed):', error);
  }

  // ---------- Cart ----------
  addToCart(): void {
    if (!this.selectedBatch || this.quantity <= 0 || this.quantity > this.selectedBatch.quantity) {
      this.toastService.show('warning', 'Invalid quantity or no batch selected');
      return;
    }
    const existing = this.cart.find(item => item.batch.id === this.selectedBatch!.id);
    if (existing) {
      existing.quantity += this.quantity;
    } else {
      this.cart.push({ batch: this.selectedBatch, quantity: this.quantity });
    }
    this.selectedBatch = null;
    this.quantity = 1;
    this.toastService.show('success', 'Item added to cart');
  }

  removeFromCart(index: number): void { this.cart.splice(index, 1); }

  get cartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.batch.sellingPrice * item.quantity, 0);
  }

  get totalAfterDiscount(): number {
    return Math.max(0, this.cartTotal - this.discount);
  }

  completeSale(): void {
    if (this.cart.length === 0) {
      this.toastService.show('warning', 'Cart is empty');
      return;
    }
    const items: SaleItemRequest[] = this.cart.map(item => ({
      batchId: item.batch.id,
      quantity: item.quantity
    }));
    const request: SaleRequest = {
      branchId: this.selectedBranchId!,
      patientId: this.patientId ?? undefined,
      prescriptionId: this.prescriptionId ?? undefined,
      paymentMethod: this.paymentMethod,
      discount: this.discount,
      items
    };
    this.loading = true;
    this.posService.createSale(request).subscribe({
      next: (sale) => {
        this.toastService.show('success', `Sale #${sale.id} completed! Total: $${sale.totalAmount.toFixed(2)}`);
        this.cart = [];
        this.discount = 0;
        this.patientId = null;
        this.prescriptionId = null;
        this.availableBatches = [];
        this.selectedBatch = null;
        this.loading = false;
        this.loadBranchStock();
      },
      error: (err) => {
        this.loading = false;
        this.toastService.show('error', err.error?.message || 'Failed to complete sale');
      }
    });
  }
}