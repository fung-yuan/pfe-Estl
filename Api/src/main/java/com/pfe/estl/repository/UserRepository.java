package com.pfe.estl.repository;

import com.pfe.estl.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Method to find a user by their username
    // Spring Data JPA automatically implements this based on the method name
    Optional<User> findByUsername(String username);
    
    // Find a user by their email address
    Optional<User> findByEmail(String email);
    
    // Check if a username exists
    boolean existsByUsername(String username);
    
    // Check if an email exists
    boolean existsByEmail(String email);
    
    // Department field has been removed from User entity
    // findByDepartment method removed
    
    // Find users by enabled status
    List<User> findByIsEnabled(boolean isEnabled);
    
    // Find users who have a specific role (using JPQL query with JOIN)
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(String roleName);
}
