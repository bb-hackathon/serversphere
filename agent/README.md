#### Running locally

```nushell
# Get a rust toolchain from rustup.rs first.
cargo run --bin serversphere-agent
```

#### Building a `.deb` package

You need `cargo-deb` installed. Maybe ask `@mxxntype` for one.
The debian package also contains a `systemd` service with the agent, it should start right after being installed.

```nushell
cargo deb           # Builds a .deb in ./target/debian/
cargo deb --install # Installs the debian package globally.
```

#### HTTP API

```nushell
http get http://ip_address/serversphere/agent/metrics              # Reports primitive metrics.
http get http://ip_address/serversphere/agent/status               # Health check.
http post http://ip_address/serversphere/agent/reboot        ""    # Reboots the node.
http post http://ip_address/serversphere/agent/restart/sshd  ""    # Restarts SSHD.
http post http://ip_address/serversphere/agent/restart/vnc   ""    # Restarts SSHD.
http post http://ip_address/serversphere/agent/revoke_access ""    # Kicks everyone out and lets nobody in.

# Kick everyone out and set the accepted SSH pubkey to the provided one.
http post http://ip_address/serversphere/agent/credentials/sshd { "pubkey": "..."}
```
