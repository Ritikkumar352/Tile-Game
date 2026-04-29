package com.ritik.game.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
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
        return ResponseEntity.badRequest().body(error("INVALID_INPUT", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleMethodArgumentNotValid(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(error("INVALID_INPUT", message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleUnreadable(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(error("INVALID_INPUT", "Invalid request body"));
    }

    @ExceptionHandler(CooldownException.class)
    public ResponseEntity<?> handleCooldown(CooldownException e) {
        Map<String, Object> response = error("COOLDOWN", e.getMessage());
        response.put("remainingMs", e.getRemainingMs());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
    }

    @ExceptionHandler(UsernameConflictException.class)
    public ResponseEntity<?> handleConflict(UsernameConflictException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(error("USERNAME_TAKEN", e.getMessage()));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> handleNotFound(NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(error("NOT_FOUND", e.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<?> handleUnauthorized(UnauthorizedException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(error("UNAUTHORIZED", e.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(error("INVALID_INPUT", e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception e) {
        log.error("Unhandled exception", e);
        return ResponseEntity.internalServerError()
                .body(error("INTERNAL_ERROR", "Something went wrong"));
    }

    private Map<String, Object> error(String code, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", code);
        response.put("message", message);
        return response;
    }
}
