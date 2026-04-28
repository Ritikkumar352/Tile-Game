package com.ritik.game.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Entity
@Table(name = "tiles", uniqueConstraints = @UniqueConstraint(columnNames = {"row", "col"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tile {
    @Id
    private Integer id;

    @Column(nullable = false)
    private Short row;

    @Column(nullable = false)
    private Short col;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column
    private Instant capturedAt;
}
