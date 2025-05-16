package com.pfe.estl.config;

import com.pfe.estl.service.impl.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // UserDetailsService and PasswordEncoder will be injected into the authenticationProvider bean

    // Bean to define the password encoder (BCrypt)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Bean to configure the main security rules
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Configure CORS using the corsConfigurationSource bean below
            .cors(withDefaults()) 
            // Disable CSRF (common for stateless APIs, ensure proper handling if using sessions)
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // Allow access to these endpoints without authentication
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/health/**").permitAll()
                .requestMatchers("/api/ping").permitAll()
                .requestMatchers("/api/ping/**").permitAll()
                // Require authentication for all other requests
                .anyRequest().authenticated()
            )
            // Configure HTTP Basic authentication with a custom entry point
            .httpBasic(basic -> basic
                .authenticationEntryPoint((request, response, authException) -> {
                    // Check if this is an AJAX request
                    String requestedWithHeader = request.getHeader("X-Requested-With");
                    boolean isAjax = "XMLHttpRequest".equals(requestedWithHeader);
                    
                    // For AJAX requests, return JSON response without WWW-Authenticate header
                    if (isAjax) {
                        response.setStatus(401);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                    } else {
                        // For non-AJAX requests, still return 401 but without WWW-Authenticate header
                        // This prevents the browser dialog from appearing
                        response.setStatus(401);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Please log in via the application login page\"}");
                    }
                })
            );
        
        // Authentication provider configuration would typically go here
        // Spring Boot will automatically configure DaoAuthenticationProvider with our UserDetailsService and PasswordEncoder
        
        return http.build();
    }
    
    // Bean to get the AuthenticationManager (needed for explicit login handling later)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // Bean to configure CORS settings - allows requests from the React frontend
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow requests from your React app's origin (adjust if needed)
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        // Allow credentials (cookies, authorization headers) 
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply CORS to all paths
        return source;
    }

    // Bean to configure the primary authentication provider
    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsServiceImpl userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService); // Set the custom user details service
        authProvider.setPasswordEncoder(passwordEncoder); // Set the password encoder
        return authProvider;
    }
}
