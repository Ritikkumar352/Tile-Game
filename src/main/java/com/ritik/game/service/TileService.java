package com.ritik.game.service;

import com.ritik.game.dto.TileDto;
import com.ritik.game.entity.Tile;
import com.ritik.game.entity.User;
import com.ritik.game.exception.CooldownException;
import com.ritik.game.exception.NotFoundException;
import com.ritik.game.repository.TileRepository;
import com.ritik.game.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TileService {

    private final TileRepository tileRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;

    @Value("${app.cooldown-ms}")
    private long cooldownMs;

    @Transactional(readOnly = true)
    public List<TileDto> getAllTiles() {
        return tileRepository.findAllWithOwner().stream()
                .map(TileDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TileDto getTile(int tileId) {
        Tile tile = tileRepository.findById(tileId)
                .orElseThrow(() -> new NotFoundException("Tile not found: " + tileId));
        return TileDto.from(tile);
    }

    @Transactional
    public TileDto captureTile(int tileId, UUID userId) {
        // 1. Check cooldown in Redis
        String cooldownKey = "cooldown:" + userId;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(cooldownKey))) {
            Long ttl = redisTemplate.getExpire(cooldownKey, TimeUnit.MILLISECONDS);
            long remainingMs = (ttl != null && ttl > 0) ? ttl : cooldownMs;
            throw new CooldownException(remainingMs);
        }

        // 2. Pessimistic lock on tile
        Tile tile = tileRepository.findByIdWithLock(tileId)
                .orElseThrow(() -> new NotFoundException("Tile not found: " + tileId));

        // 3. Update tile with new owner
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        tile.setOwner(user);
        tile.setCapturedAt(Instant.now());
        tileRepository.save(tile);

        // 4. Set cooldown in Redis
        redisTemplate.opsForValue().set(cooldownKey, "1", cooldownMs, TimeUnit.MILLISECONDS);

        log.info("User {} captured tile {}", user.getUsername(), tileId);

        // 5. Publish event to Redis pub/sub (for WebSocket broadcast)
        TileDto dto = TileDto.from(tile);
        redisTemplate.convertAndSend("tile:updated", dto.toString());

        return dto;
    }

    @Transactional(readOnly = true)
    public long getClaimedTileCount() {
        return tileRepository.countClaimedTiles();
    }

    @Transactional(readOnly = true)
    public long getUnclaimedTileCount() {
        return tileRepository.countUnclaimedTiles();
    }
}
