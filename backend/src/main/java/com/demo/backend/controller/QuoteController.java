package com.demo.backend.controller;

import com.demo.backend.dto.request.QuoteRequestDTO;
import com.demo.backend.dto.response.ApiResponse;
import com.demo.backend.entity.QuoteRequest;
import com.demo.backend.service.QuoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Quote Requests", description = "Quote request management API")
public class QuoteController {

    private final QuoteService quoteService;

    // ============ PUBLIC ENDPOINT ============

    @PostMapping("/quotes")
    @Operation(summary = "Submit a quote request (public)")
    public ResponseEntity<ApiResponse<QuoteRequest>> submitQuote(
            @Valid @RequestBody QuoteRequestDTO request) {
        QuoteRequest saved = quoteService.submitQuote(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(saved));
    }

    // ============ ADMIN ENDPOINTS ============

    @GetMapping("/admin/quotes")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all quote requests (admin only)")
    public ResponseEntity<ApiResponse<List<QuoteRequest>>> getAllQuotes() {
        List<QuoteRequest> quotes = quoteService.getAllQuotes();
        return ResponseEntity.ok(ApiResponse.success("Fetched all quote requests", quotes));
    }

    @GetMapping("/admin/quotes/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get quote request statistics (admin only)")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getQuoteStats() {
        Map<String, Long> stats = quoteService.getQuoteStats();
        return ResponseEntity.ok(ApiResponse.success("Quote statistics", stats));
    }

    @PutMapping("/admin/quotes/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mark a quote request as read (admin only)")
    public ResponseEntity<ApiResponse<QuoteRequest>> markAsRead(@PathVariable Long id) {
        QuoteRequest updated = quoteService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", updated));
    }

    @PutMapping("/admin/quotes/{id}/replied")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mark a quote request as replied (admin only)")
    public ResponseEntity<ApiResponse<QuoteRequest>> markAsReplied(@PathVariable Long id) {
        QuoteRequest updated = quoteService.markAsReplied(id);
        return ResponseEntity.ok(ApiResponse.success("Marked as replied", updated));
    }
}
