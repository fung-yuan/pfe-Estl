package com.pfe.estl.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * DEPRECATED: This controller has been replaced by PingController
 * Keeping for reference only
 */
// Removing RestController annotation to disable this controller
// @RestController 
@RequestMapping("/api/ping-old")
@CrossOrigin(origins = "*")
public class OldHealthController {

    /**
     * Basic ping endpoint that always returns a static string
     * @return "pong" as plain text
     */
    @GetMapping(produces = "text/plain")
    public String ping() {
        return "pong";
    }
}
