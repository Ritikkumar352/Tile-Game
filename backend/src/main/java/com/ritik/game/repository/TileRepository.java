package com.ritik.game.repository;

import com.ritik.game.dto.LeaderboardEntry;
import com.ritik.game.entity.Tile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface TileRepository extends JpaRepository<Tile, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Tile t WHERE t.id = :id")
    Optional<Tile> findByIdWithLock(@Param("id") int id);

        @Query("SELECT t FROM Tile t LEFT JOIN FETCH t.owner ORDER BY t.id")
    List<Tile> findAllWithOwner();

        @Query("SELECT new com.ritik.game.dto.LeaderboardEntry(u.id, u.username, u.color, COUNT(t)) " +
            "FROM Tile t JOIN t.owner u GROUP BY u.id, u.username, u.color ORDER BY COUNT(t) DESC")
        List<LeaderboardEntry> findTopLeaderboard(Pageable pageable);

    @Query("SELECT COUNT(t) FROM Tile t WHERE t.owner.id IS NOT NULL")
    Long countClaimedTiles();

    @Query("SELECT COUNT(t) FROM Tile t WHERE t.owner.id IS NULL")
    Long countUnclaimedTiles();
}
