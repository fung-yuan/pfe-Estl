package com.pfe.estl.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.theokanning.openai.service.OpenAiService;

import java.time.Duration;

/**
 * Configuration for OpenAI API client
 */
@Configuration
public class OpenAIConfig {

    @Value("${openai.api.key}")
    private String openaiApiKey;
    
    @Value("${openai.timeout:60}")
    private Integer timeout;

    /**
     * Creates and configures the OpenAI service bean
     * @return Configured OpenAiService instance
     */
    @Bean
    public OpenAiService openAiService() {
        // Create a service with token authentication
        return new OpenAiService(openaiApiKey, Duration.ofSeconds(timeout));
    }
}
