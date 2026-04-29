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
public class LeaderboardEntry {
    @JsonProperty("userId")
    private UUID userId;

    @JsonProperty("username")
    private String username;

    @JsonProperty("color")
    private String color;

    @JsonProperty("tileCount")
    private Long tileCount;
}
