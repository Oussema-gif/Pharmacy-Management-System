package com.pharmacy.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class PurchaseRequestDto {

    @NotNull
    private Long supplierId;

    @NotNull
    private Long branchId;

    @NotNull
    private List<PurchaseItemRequest> items;

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public List<PurchaseItemRequest> getItems() { return items; }
    public void setItems(List<PurchaseItemRequest> items) { this.items = items; }
}