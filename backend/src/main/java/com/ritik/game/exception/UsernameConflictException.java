package com.ritik.game.exception;

public class UsernameConflictException extends RuntimeException {
    public UsernameConflictException(String message) {
        super(message);
    }
}
