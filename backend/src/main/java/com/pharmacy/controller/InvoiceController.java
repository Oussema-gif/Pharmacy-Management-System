package com.pharmacy.controller;

import com.pharmacy.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER','PHARMACIST','CASHIER')")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping("/{saleId}/pdf")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long saleId) {
        byte[] pdfBytes = invoiceService.generateInvoice(saleId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice-" + saleId + ".pdf");
        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}