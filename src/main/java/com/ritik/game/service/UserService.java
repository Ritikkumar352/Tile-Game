package com.ritik.game.service;

import com.ritik.game.dto.UserDto;
import com.ritik.game.entity.User;
import com.ritik.game.exception.UsernameConflictException;
import com.ritik.game.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{3,24}$");

    @Transactional
    public UserDto createOrGetUser(String username) {
        // Validate username format
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new IllegalArgumentException("Username must be 3-24 alphanumeric characters or underscore");
        }

        // Check if user exists
        Optional<User> existing = userRepository.findByUsername(username);
        if (existing.isPresent()) {
            return toDto(existing.get());
        }

        // Create new user with random color
        String color = generateRandomColor();
        User user = User.builder()
                .username(username)
                .color(color)
                .build();

        user = userRepository.save(user);
        log.info("Created user: {} with color {}", username, color);
        return toDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toDto(user);
    }

    private String generateRandomColor() {
        int rgb = (int) (Math.random() * 0xFFFFFF);
        return String.format("#%06x", rgb);
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .color(user.getColor())
                .build();
    }
}
