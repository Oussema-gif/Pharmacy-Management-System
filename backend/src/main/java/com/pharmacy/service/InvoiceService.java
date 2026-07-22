package com.pharmacy.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.pharmacy.model.Sale;
import com.pharmacy.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

@Service
public class InvoiceService {

    @Autowired
    private SaleRepository saleRepository;

    public byte[] generateInvoice(Long saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Header
        document.add(new Paragraph("Pharmacy Management System").setBold().setFontSize(18));
        document.add(new Paragraph("Invoice #" + sale.getId()));
        document.add(new Paragraph("Date: " + sale.getSaleDate()));
        document.add(new Paragraph("Cashier: " + sale.getUser().getFullName()));
        if (sale.getPatient() != null) {
            document.add(new Paragraph("Patient: " + sale.getPatient().getFullName()));
        }

        document.add(new Paragraph(" "));

        // Table of items
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 20, 20, 20}));
        table.setWidth(UnitValue.createPercentValue(100));
        table.addHeaderCell("Medication");
        table.addHeaderCell("Batch");
        table.addHeaderCell("Qty");
        table.addHeaderCell("Price");

        sale.getItems().forEach(item -> {
            table.addCell(item.getBatch().getMedication().getName());
            table.addCell(item.getBatch().getBatchNumber());
            table.addCell(item.getQuantity().toString());
            table.addCell("$" + item.getUnitPrice());
        });

        document.add(table);

        document.add(new Paragraph(" "));
        document.add(new Paragraph("Total: $" + sale.getTotalAmount()));
        if (sale.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            document.add(new Paragraph("Discount: $" + sale.getDiscount()));
        }
        document.add(new Paragraph("Payment: " + sale.getPaymentMethod()));

        document.close();
        return baos.toByteArray();
    }
}