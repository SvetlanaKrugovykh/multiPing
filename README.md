
# MultiPing

MultiPing is a Node.js project for real-time monitoring of multiple IP addresses via ICMP ping. It features a Fastify web server, dynamic HTML graphs (Chart.js), and color-coded packet loss/latency visualization. No database required; all configuration is via `.env`.

## Features

- Monitors multiple IP addresses (set in `.env`)
- Real-time ping results and latency graphs
- Color indication: green (OK), yellow (high latency), red (packet loss)
- All graphs visible simultaneously
- Log file (`ping.log`) resets on each server start
- No database required

## Usage

1. Clone or copy the project to your machine.

2. Install dependencies:

   ```sh
   npm install
   ```

3. Configure `.env`:

   ```env
   IPS=8.8.8.8,1.1.1.1,192.168.1.1
   PING_INTERVAL=1000
   DELAY_THRESHOLD=100
   ```

   - `IPS`: comma-separated list of IP addresses to monitor
   - `PING_INTERVAL`: ping interval in milliseconds
   - `DELAY_THRESHOLD`: latency threshold for yellow indication

4. Start the server:

   ```sh
   node index.js
   ```

5. Open `http://localhost:3000` in your browser to view live graphs.

## License

This project is licensed under the ISC License. See [LICENSE](LICENSE) for details.

## Dependencies

- fastify
- @fastify/static
- dotenv
- ping
- chart.js

## Notes

- The log file (`ping.log`) is reset every time the server starts.
- All comments in the code are in English only.
