package com.ritik.game.controller;

import com.ritik.game.service.LeaderboardService;
import com.ritik.game.service.TileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@Slf4j
public class StatsController {

    private final TileService tileService;
    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats() {
        long claimedTiles = tileService.getClaimedTileCount();
        long unclaimedTiles = tileService.getUnclaimedTileCount();
        long onlineCount = leaderboardService.getOnlineCount();

        Map<String, Object> response = new HashMap<>();
        response.put("onlineCount", onlineCount);
        response.put("totalTiles", claimedTiles + unclaimedTiles);
        response.put("claimedTiles", claimedTiles);
        response.put("unclaimedTiles", unclaimedTiles);

        return ResponseEntity.ok(response);
    }
}
