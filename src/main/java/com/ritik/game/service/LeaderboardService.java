package com.ritik.game.service;

import com.ritik.game.dto.LeaderboardEntry;
import com.ritik.game.repository.TileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaderboardService {

    private final TileRepository tileRepository;

    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getTop10Leaderboard() {
        // This will be implemented after we add a native query or view to get top 10
        // For now, returning empty list as placeholder
        return List.of();
    }

    @Transactional(readOnly = true)
    public long getOnlineCount() {
        // This will be updated once WebSocket tracking is in place
        return 0L;
    }
}
