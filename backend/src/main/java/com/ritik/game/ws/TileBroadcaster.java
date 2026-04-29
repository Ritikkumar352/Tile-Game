package com.ritik.game.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ritik.game.dto.TileDto;
import com.ritik.game.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class TileBroadcaster implements MessageListener {

    private final SimpMessagingTemplate messaging;
    private final LeaderboardService leaderboardService;
    private final ObjectMapper objectMapper;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            TileDto tile = objectMapper.readValue(message.getBody(), TileDto.class);

            messaging.convertAndSend(
                    "/topic/tiles",
                    Map.of("type", "TILE_UPDATED", "payload", Map.of("tile", tile))
            );

            messaging.convertAndSend(
                    "/topic/leaderboard",
                    Map.of("type", "LEADERBOARD_UPDATE",
                            "payload", Map.of("leaderboard", leaderboardService.getTop10Leaderboard()))
            );

            messaging.convertAndSend(
                    "/topic/online",
                    Map.of("type", "ONLINE_COUNT",
                            "payload", Map.of("count", leaderboardService.getOnlineCount()))
            );
        } catch (Exception e) {
            log.error("Broadcast error", e);
        }
    }
}
