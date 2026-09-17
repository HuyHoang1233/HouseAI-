package com.demo.backend.config;

import com.demo.backend.entity.User;
import com.demo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Slf4j
@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                User admin = User.builder()
                        .username("admin")
                        .email("admin@demo.com")
                        .password(passwordEncoder.encode("admin123"))
                        .fullName("System Administrator")
                        .active(true)
                        .roles(Set.of(User.Role.ROLE_ADMIN, User.Role.ROLE_USER))
                        .build();
                userRepository.save(admin);
                log.info("Created admin user: admin / admin123");
            } else {
                log.info("Admin user already exists, skipping seed.");
            }

            if (!userRepository.existsByUsername("user")) {
                User user = User.builder()
                        .username("user")
                        .email("user@demo.com")
                        .password(passwordEncoder.encode("user123"))
                        .fullName("Demo User")
                        .active(true)
                        .roles(Set.of(User.Role.ROLE_USER))
                        .build();
                userRepository.save(user);
                log.info("Created regular user: user / user123");
            } else {
                log.info("Regular user already exists, skipping seed.");
            }
        };
    }
}
