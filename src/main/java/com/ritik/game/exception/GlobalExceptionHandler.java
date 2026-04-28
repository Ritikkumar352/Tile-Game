package com.ritik.game.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<?> handleValidation(ConstraintViolationException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "INVALID_INPUT");
        response.put("message", e.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(CooldownException.class)
    public ResponseEntity<?> handleCooldown(CooldownException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "COOLDOWN");
        response.put("remainingMs", e.getRemainingMs());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
    }

    @ExceptionHandler(UsernameConflictException.class)
    public ResponseEntity<?> handleConflict(UsernameConflictException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "USERNAME_TAKEN");
        response.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> handleNotFound(NotFoundException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "NOT_FOUND");
        response.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception e) {
        log.error("Unhandled exception", e);
        Map<String, Object> response = new HashMap<>();
        response.put("error", "INTERNAL_ERROR");
        response.put("message", "Something went wrong");
        return ResponseEntity.internalServerError().body(response);
    }
}
