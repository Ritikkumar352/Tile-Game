package com.ritik.game.service;

import com.ritik.game.dto.LeaderboardEntry;
import com.ritik.game.repository.TileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaderboardService {

    private final TileRepository tileRepository;

    private final java.util.Set<String> activeSessions = java.util.concurrent.ConcurrentHashMap.newKeySet();

    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getTop10Leaderboard() {
        return tileRepository.findTopLeaderboard(PageRequest.of(0, 10));
    }

    public long getOnlineCount() {
        return activeSessions.size();
    }

    public void addSession(String sessionId) {
        activeSessions.add(sessionId);
    }

    public void removeSession(String sessionId) {
        activeSessions.remove(sessionId);
    }
}
