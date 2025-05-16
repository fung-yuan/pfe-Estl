package com.pfe.estl.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    // Department field removed as not required
    
    @Column(name = "is_account_non_expired")
    private Boolean isAccountNonExpired = true;
    
    @Column(name = "is_account_non_locked")
    private Boolean isAccountNonLocked = true;
    
    @Column(name = "is_credentials_non_expired")
    private Boolean isCredentialsNonExpired = true;
    
    @Column(name = "is_enabled")
    private Boolean isEnabled = true;
    
    public User() {
    }
    
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
    
    // Constructor with department has been removed since department field is no longer part of the User entity
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public Set<Role> getRoles() {
        return roles;
    }
    
    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }
    
    public void addRole(Role role) {
        this.roles.add(role);
    }
    
    public void removeRole(Role role) {
        this.roles.remove(role);
    }
    
    // Department getters and setters removed as the field is no longer needed
    
    public Boolean isAccountNonExpired() {
        return isAccountNonExpired != null ? isAccountNonExpired : true;
    }
    
    public void setAccountNonExpired(Boolean accountNonExpired) {
        this.isAccountNonExpired = accountNonExpired;
    }
    
    public Boolean isAccountNonLocked() {
        return isAccountNonLocked != null ? isAccountNonLocked : true;
    }
    
    public void setAccountNonLocked(Boolean accountNonLocked) {
        this.isAccountNonLocked = accountNonLocked;
    }
    
    public Boolean isCredentialsNonExpired() {
        return isCredentialsNonExpired != null ? isCredentialsNonExpired : true;
    }
    
    public void setCredentialsNonExpired(Boolean credentialsNonExpired) {
        this.isCredentialsNonExpired = credentialsNonExpired;
    }
    
    public Boolean isEnabled() {
        return isEnabled != null ? isEnabled : true;
    }
    
    public void setEnabled(Boolean enabled) {
        this.isEnabled = enabled;
    }
}
