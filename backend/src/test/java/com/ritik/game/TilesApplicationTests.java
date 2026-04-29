package com.ritik.game;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import jakarta.servlet.http.Cookie;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
class TilesApplicationTests {

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

	@Container
	static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

	private static final AtomicInteger USER_SEQUENCE = new AtomicInteger(1);
	private static final AtomicInteger TILE_SEQUENCE = new AtomicInteger(0);

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@DynamicPropertySource
	static void registerProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", postgres::getJdbcUrl);
		registry.add("spring.datasource.username", postgres::getUsername);
		registry.add("spring.datasource.password", postgres::getPassword);
		registry.add("spring.data.redis.host", redis::getHost);
		registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
		registry.add("spring.session.store-type", () -> "redis");
		registry.add("app.cooldown-ms", () -> 200);
		registry.add("app.grid-size", () -> 50);
	}

	@Test
	void createUser_setsSessionAndReturnsDto() throws Exception {
		String username = nextUsername();

		MvcResult result = mockMvc.perform(post("/api/users")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(Map.of("username", username))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").isNotEmpty())
				.andExpect(jsonPath("$.username").value(username))
				.andExpect(jsonPath("$.color").isNotEmpty())
				.andReturn();

		Cookie sessionCookie = result.getResponse().getCookie("SESSION");
		assertThat(sessionCookie).isNotNull();
		assertThat(sessionCookie.getValue()).isNotBlank();
	}

	@Test
	void createUser_duplicateUsername_returns409() throws Exception {
		String username = nextUsername();

		mockMvc.perform(post("/api/users")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(Map.of("username", username))))
				.andExpect(status().isOk());

		mockMvc.perform(post("/api/users")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(Map.of("username", username))))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.error").value("USERNAME_TAKEN"));
	}

	@Test
	void createUser_invalidUsername_returns400() throws Exception {
		mockMvc.perform(post("/api/users")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(Map.of("username", "ab"))))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.error").value("INVALID_INPUT"));
	}

	@Test
	void getGrid_returns2500Tiles() throws Exception {
		MvcResult result = mockMvc.perform(get("/api/grid"))
				.andExpect(status().isOk())
				.andReturn();

		JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
		assertThat(body.get("size").asInt()).isEqualTo(50);
		assertThat(body.get("total").asInt()).isEqualTo(2500);
		assertThat(body.get("grid").size()).isEqualTo(2500);
	}

	@Test
	void captureTile_requiresSession() throws Exception {
		int tileId = nextTileId();

		mockMvc.perform(patch("/api/tiles/" + tileId))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
	}

	@Test
	void captureTile_enforcesCooldownAndAllowsAfterExpiry() throws Exception {
		String username = nextUsername();
		int tileId = nextTileId();
		Cookie sessionCookie = createUserSession(username);

		mockMvc.perform(patch("/api/tiles/" + tileId).cookie(sessionCookie))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(tileId));

		mockMvc.perform(patch("/api/tiles/" + tileId).cookie(sessionCookie))
				.andExpect(status().isTooManyRequests())
				.andExpect(jsonPath("$.error").value("COOLDOWN"))
				.andExpect(jsonPath("$.remainingMs").isNumber());

		Thread.sleep(250);

		mockMvc.perform(patch("/api/tiles/" + tileId).cookie(sessionCookie))
				.andExpect(status().isOk());
	}

	@Test
	void leaderboard_includesCapturingUser() throws Exception {
		String username = nextUsername();
		int tileId = nextTileId();
		Cookie sessionCookie = createUserSession(username);

		mockMvc.perform(patch("/api/tiles/" + tileId).cookie(sessionCookie))
				.andExpect(status().isOk());

		MvcResult result = mockMvc.perform(get("/api/leaderboard"))
				.andExpect(status().isOk())
				.andReturn();

		JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
		JsonNode leaderboard = body.get("leaderboard");
		boolean found = false;

		for (JsonNode entry : leaderboard) {
			if (username.equals(entry.get("username").asText())) {
				found = true;
				assertThat(entry.get("tileCount").asInt()).isGreaterThanOrEqualTo(1);
			}
		}

		assertThat(found).isTrue();
	}

	@Test
	void stats_returnsTotals() throws Exception {
		MvcResult result = mockMvc.perform(get("/api/stats"))
				.andExpect(status().isOk())
				.andReturn();

		JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
		int totalTiles = body.get("totalTiles").asInt();
		int claimedTiles = body.get("claimedTiles").asInt();
		int unclaimedTiles = body.get("unclaimedTiles").asInt();

		assertThat(totalTiles).isEqualTo(2500);
		assertThat(claimedTiles + unclaimedTiles).isEqualTo(totalTiles);
	}

	private Cookie createUserSession(String username) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/users")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(Map.of("username", username))))
				.andExpect(status().isOk())
				.andReturn();

		Cookie sessionCookie = result.getResponse().getCookie("SESSION");
		assertThat(sessionCookie).isNotNull();
		return sessionCookie;
	}

	private String nextUsername() {
		return "user_" + USER_SEQUENCE.getAndIncrement();
	}

	private int nextTileId() {
		return TILE_SEQUENCE.getAndIncrement();
	}
}
