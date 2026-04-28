package com.ritik.game.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.ritik.game.entity.Tile;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TileDto {
    @JsonProperty("id")
    private Integer id;

    @JsonProperty("row")
    private Short row;

    @JsonProperty("col")
    private Short col;

    @JsonProperty("ownerId")
    private UUID ownerId;

    @JsonProperty("ownerName")
    private String ownerName;

    @JsonProperty("ownerColor")
    private String ownerColor;

    @JsonProperty("capturedAt")
    private Instant capturedAt;

    public static TileDto from(Tile tile) {
        return TileDto.builder()
                .id(tile.getId())
                .row(tile.getRow())
                .col(tile.getCol())
                .ownerId(tile.getOwner() != null ? tile.getOwner().getId() : null)
                .ownerName(tile.getOwner() != null ? tile.getOwner().getUsername() : null)
                .ownerColor(tile.getOwner() != null ? tile.getOwner().getColor() : null)
                .capturedAt(tile.getCapturedAt())
                .build();
    }
}
