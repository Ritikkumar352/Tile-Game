package com.ritik.game.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.cors-origin}")
    private String corsOrigin;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Use simple in-memory broker for now
        // In production with Redis STOMP relay, use:
        // registry.enableStompBrokerRelay("/topic", "/queue")
        //        .setRelayHost("localhost").setRelayPort(61613);
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    // WebSocket endpoint registration will be done in Phase 3
    // @Override
    // public void registerStompEndpoints(StompEndpointRegistry registry) {
    //     registry.addEndpoint("/ws")
    //             .setAllowedOriginPatterns(corsOrigin)
    //             .withSockJS();
    // }
}
