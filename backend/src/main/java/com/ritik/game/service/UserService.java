package com.ritik.game.service;

import com.ritik.game.dto.UserDto;
import com.ritik.game.entity.User;
import com.ritik.game.exception.NotFoundException;
import com.ritik.game.exception.UsernameConflictException;
import com.ritik.game.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public UserDto createUser(String username) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new UsernameConflictException("Username already taken");
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
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
        return toDto(user);
    }

    private String generateRandomColor() {
        int rgb = ThreadLocalRandom.current().nextInt(0x1000000);
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
