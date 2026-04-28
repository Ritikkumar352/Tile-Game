package com.ritik.game.controller;

import com.ritik.game.dto.LeaderboardEntry;
import com.ritik.game.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
@Slf4j
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getLeaderboard() {
        List<LeaderboardEntry> leaderboard = leaderboardService.getTop10Leaderboard();
        Map<String, Object> response = new HashMap<>();
        response.put("leaderboard", leaderboard);
        return ResponseEntity.ok(response);
    }
}
