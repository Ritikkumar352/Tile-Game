package com.ritik.game.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    @JsonProperty("id")
    private UUID id;

    @JsonProperty("username")
    private String username;

    @JsonProperty("color")
    private String color;
}
