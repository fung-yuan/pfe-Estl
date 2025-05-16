package com.pfe.estl.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Ultra-simple health check controller with no dependencies
 * This controller always returns a static string and cannot fail
 */
@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthCheckController {
    
    /**
     * Simple health check endpoint that returns a static string
     * No authentication required for this endpoint
     * @return A simple string indicating the server is running
     */
    @GetMapping(produces = "text/plain")
    public String healthCheck() {
        return "UP";
    }
}
