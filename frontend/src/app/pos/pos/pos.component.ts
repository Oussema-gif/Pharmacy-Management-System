import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { MedicationService } from '../../core/services/medication.service';
import { PosService, AvailableBatch } from '../../core/services/pos.service';
import { ToastService } from '../../core/services/toast.service';
import { Medication } from '../../core/models/medication.model';
import { Patient } from '../../core/models/patient.model';
import { Prescription } from '../../core/models/prescription.model';
import { SaleRequest, SaleItemRequest } from '../../core/models/sale.model';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ZXingScannerModule],
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css']
})
export class PosComponent implements OnInit {
  branchId = 1;
  medications: Medication[] = [];
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

  showScanner = false;
  scannerFormats = [BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.QR_CODE];

  constructor(
    private medicationService: MedicationService,
    private posService: PosService,
    private toastService: ToastService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.medicationService.getAll().subscribe({
      next: (data) => (this.medications = data),
      error: () => this.toastService.show('error', 'Failed to load medications')
    });

    this.posService.getAllPatients().subscribe({
      next: (data) => (this.patients = data),
      error: () => this.toastService.show('error', 'Failed to load patients')
    });

    this.posService.getAllPrescriptions().subscribe({
      next: (data) => (this.prescriptions = data),
      error: () => this.toastService.show('error', 'Failed to load prescriptions')
    });
  }

  get filteredMedications(): Medication[] {
    if (!this.searchQuery) return this.medications;
    return this.medications.filter(m =>
      m.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  selectMedication(medicationId: number): void {
    this.selectedMedicationId = medicationId;
    this.posService.getBatchesByMedicationAndBranch(medicationId, this.branchId).subscribe({
      next: (batches) => {
        this.availableBatches = batches.filter(b => b.quantity > 0);
        this.selectedBatch = null;
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

  openScanner(): void {
    this.showScanner = true;
  }

  closeScanner(): void {
    this.showScanner = false;
  }

  onCodeResult(result: string): void {
    this.showScanner = false;
    this.lookupBarcode(result);
  }

  // ✅ Added scanner error handler to suppress unhandled rejections
  onScannerError(error: any): void {
    console.warn('Scanner error (suppressed):', error);
  }

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

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
  }

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
      branchId: this.branchId,
      patientId: this.patientId ?? undefined,
      prescriptionId: this.prescriptionId ?? undefined,
      paymentMethod: this.paymentMethod,
      discount: this.discount,
      items
    };

    this.loading = true;
    this.posService.createSale(request).subscribe({
      next: (sale) => {
        this.toastService.show(
          'success',
          `Sale #${sale.id} completed! Total: $${sale.totalAmount.toFixed(2)}`
        );
        this.cart = [];
        this.discount = 0;
        this.patientId = null;
        this.prescriptionId = null;
        this.availableBatches = [];
        this.selectedBatch = null;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastService.show('error', err.error?.message || 'Failed to complete sale');
      }
    });
  }
}