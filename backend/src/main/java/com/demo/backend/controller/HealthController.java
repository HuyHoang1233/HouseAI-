package com.demo.backend.controller;

import com.demo.backend.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@Tag(name = "Health", description = "Health check API")
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<String> index() {
        return ResponseEntity.ok("Backend API is running successfully!");
    }

    @GetMapping("/health")
    @Operation(summary = "Health check endpoint (public)")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        Map<String, String> health = Map.of(
                "status", "UP",
                "service", "Demo Backend API",
                "version", "1.0.0"
        );
        return ResponseEntity.ok(ApiResponse.success("Service is running", health));
    }
}
