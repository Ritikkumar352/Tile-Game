package com.ritik.game.controller;

import com.ritik.game.dto.TileDto;
import com.ritik.game.service.TileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grid")
@RequiredArgsConstructor
@Slf4j
public class GridController {

    private final TileService tileService;

    @Value("${app.grid-size}")
    private int gridSize;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getGrid() {
        List<TileDto> tiles = tileService.getAllTiles();
        Map<String, Object> response = new HashMap<>();
        response.put("grid", tiles);
        response.put("size", gridSize);
        response.put("total", tiles.size());
        return ResponseEntity.ok(response);
    }
}
