# GridWar — AWS EC2 Deployment Guide

Follow this guide to deploy the unified GridWar stack to an AWS EC2 instance. This setup uses **Docker Compose** for orchestration and **Caddy** for automatic SSL (HTTPS).

## 1. AWS EC2 Provisioning

### Instance Specs
- **AMI**: Ubuntu 22.04 LTS (64-bit x86)
- **Instance Type**: `t3.small` (minimum 2GB RAM recommended for Java + Docker builds).
- **Storage**: 20GB gp3 SSD.

### Security Group (Inbound Rules)
You **MUST** open these ports in your Security Group:
| Type | Port | Source | Purpose |
|---|---|---|---|
| SSH | 22 | My IP | Secure Access |
| HTTP | 80 | 0.0.0.0/0 | Web Traffic / ACME |
| HTTPS | 443 | 0.0.0.0/0 | Secure Web Traffic |

---

## 2. Server Preparation

SSH into your instance:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Install Docker & Docker Compose
Run the following block to install the official Docker engine:
```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow 'ubuntu' user to run docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

### Prepare Data Directory
The production compose file expects `/opt/gridwar/pgdata`:
```bash
sudo mkdir -p /opt/gridwar/pgdata
sudo chown -R $USER:$USER /opt/gridwar
```

---

## 3. Deploy Application

### Clone Repository
```bash
git clone <your-repo-url> /opt/gridwar
cd /opt/gridwar
```

### Configure Environment
Create the production `.env` file:
```bash
cp .env.example .env
nano .env
```
**Required Changes in `.env`**:
- `CORS_ALLOWED_ORIGIN=https://yourdomain.com` (Update to your actual domain)
- `SPRING_PROFILES_ACTIVE=prod`
- `SESSION_SECRET` (Generate a random 32-char string)
- `POSTGRES_PASSWORD` (Change to a strong password)

### Launch
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

---

## 4. Automatic SSL with Caddy

We use Caddy to handle HTTPS automatically (it provisions Let's Encrypt certificates).

### Install Caddy
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### Configure Caddyfile
```bash
sudo nano /etc/caddy/Caddyfile
```
Replace the content with:
```caddy
yourdomain.com {
    reverse_proxy localhost:80
}
```

### Restart Caddy
```bash
sudo systemctl reload caddy
```

---

## 5. Verification Checklist

1.  **Health Check**: `curl https://yourdomain.com/actuator/health` should return `{"status":"UP"}`.
2.  **WebSocket**: Open DevTools > Network > WS. Ensure the connection to `wss://yourdomain.com/ws` stays "101 Switching Protocols".
3.  **Logs**: If something fails, check logs with:
    ```bash
    docker compose logs -f backend
    ```

## Summary of Integration
- **Frontend** (Nginx) listens on Docker port `80`.
- **Caddy** (Host) acts as a reverse proxy from `443` (SSL) to Docker port `80`.
- **Backend** (Spring Boot) communicates internally via the `gridwar` Docker network.
- **WebSocket** traffic is proxied through Caddy → Nginx → Spring Boot.
