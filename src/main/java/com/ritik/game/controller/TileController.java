package com.ritik.game.controller;

import com.ritik.game.dto.TileDto;
import com.ritik.game.service.TileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.UUID;

@RestController
@RequestMapping("/api/tiles")
@RequiredArgsConstructor
@Slf4j
public class TileController {

    private final TileService tileService;

    @PatchMapping("/{id}")
    public ResponseEntity<TileDto> captureTile(@PathVariable int id, HttpSession session) {
        UUID userId = (UUID) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        TileDto tileDto = tileService.captureTile(id, userId);
        return ResponseEntity.ok(tileDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TileDto> getTile(@PathVariable int id) {
        TileDto tileDto = tileService.getTile(id);
        return ResponseEntity.ok(tileDto);
    }
}
