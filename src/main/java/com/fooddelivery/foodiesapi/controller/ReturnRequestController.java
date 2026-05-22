package com.fooddelivery.foodiesapi.controller;

import com.fooddelivery.foodiesapi.io.ReturnRequestResponse;
import com.fooddelivery.foodiesapi.service.ReturnRequestService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/returns")
@AllArgsConstructor
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;

    // Customer raises return request
    @PostMapping(value = "/raise", consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public ReturnRequestResponse raiseReturn(
            @RequestPart("orderId")          String orderId,
            @RequestPart("reason")           String reason,
            @RequestPart("photo")            MultipartFile photo,
            @RequestPart(value = "reorder", required = false) String reorder) {
        boolean reorderRequested = "true".equalsIgnoreCase(reorder);
        return returnRequestService.raiseReturnRequest(orderId, reason, photo, reorderRequested);
    }

    // Customer checks their return status
    @GetMapping("/my/{orderId}")
    public ReturnRequestResponse getMyReturn(@PathVariable String orderId) {
        return returnRequestService.getMyReturnRequest(orderId);
    }

    // Admin — get all returns
    @GetMapping("/all")
    public List<ReturnRequestResponse> getAllReturns() {
        return returnRequestService.getAllRequests();
    }

    // Admin — get by status
    @GetMapping("/status/{status}")
    public List<ReturnRequestResponse> getByStatus(@PathVariable String status) {
        return returnRequestService.getRequestsByStatus(status);
    }

    // Admin — approve
    @PatchMapping("/approve/{id}")
    public ReturnRequestResponse approveReturn(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return returnRequestService.approveReturn(id, body.get("reason"));
    }

    // Admin — reject
    @PatchMapping("/reject/{id}")
    public ReturnRequestResponse rejectReturn(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return returnRequestService.rejectReturn(id, body.get("reason"));
    }
}