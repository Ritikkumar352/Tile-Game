package com.ritik.game.exception;

public class CooldownException extends RuntimeException {
    private final long remainingMs;

    public CooldownException(long remainingMs) {
        super("Cooldown active. Remaining: " + remainingMs + " ms");
        this.remainingMs = remainingMs;
    }

    public long getRemainingMs() {
        return remainingMs;
    }
}
