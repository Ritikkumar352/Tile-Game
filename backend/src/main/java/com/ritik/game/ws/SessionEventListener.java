package com.ritik.game.ws;

import com.ritik.game.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionEventListener {

    private final LeaderboardService leaderboardService;
    private final SimpMessagingTemplate messaging;

    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        StompHeaderAccessor headers = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();
        leaderboardService.addSession(sessionId);
        broadcastOnlineCount();
        log.info("New session connected: {}", sessionId);
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor headers = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();
        leaderboardService.removeSession(sessionId);
        broadcastOnlineCount();
        log.info("Session disconnected: {}", sessionId);
    }

    private void broadcastOnlineCount() {
        messaging.convertAndSend(
                "/topic/online",
                Map.of("type", "ONLINE_COUNT",
                        "payload", Map.of("count", leaderboardService.getOnlineCount()))
        );
    }
}
