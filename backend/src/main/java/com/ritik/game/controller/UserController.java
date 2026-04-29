package com.ritik.game.controller;

import com.ritik.game.dto.CreateUserRequest;
import com.ritik.game.dto.UserDto;
import com.ritik.game.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request, HttpSession session) {
        UserDto userDto = userService.createUser(request.getUsername());
        session.setAttribute("userId", userDto.getId());
        log.info("User {} authenticated with session", userDto.getUsername());
        return ResponseEntity.ok(userDto);
    }
}
