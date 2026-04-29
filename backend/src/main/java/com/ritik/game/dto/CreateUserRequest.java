package com.ritik.game.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    @NotBlank(message = "Username is required")
    @Pattern(
            regexp = "^[a-zA-Z0-9_]{3,24}$",
            message = "Username must be 3-24 alphanumeric characters or underscore"
    )
    private String username;
}
