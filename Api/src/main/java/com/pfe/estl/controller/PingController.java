package com.pfe.estl.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;

/**
 * A minimal controller for health checks with no dependencies
 * This is designed to be ultra-reliable and always return a response
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "false")
public class PingController {

    /**
     * Basic ping endpoint that always returns a static string
     * Using ResponseEntity for maximum control over the response
     * 
     * @return ResponseEntity with "pong" as plain text
     */
    @GetMapping(value = "/ping", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> ping() {
        // Just return a static string with explicit 200 OK status
        return ResponseEntity.ok("pong");
    }
}
