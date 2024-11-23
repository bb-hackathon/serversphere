#### Running locally

```nushell
# Get a rust toolchain from rustup.rs first.
cargo run --bin serversphere-agent
```

#### Building a `.deb` package

```nushell
# NOTE: You need `cargo-deb` installed. Maybe ask @mxxntype for one
cargo deb           # Builds a .deb in ./target/debian/
cargo deb --install # Installs the debian package globally.
```

#### HTTP API

```nushell
http get http://ip_address/serversphere/agent/status           # Health check.
http get http://ip_address/serversphere/agent/metrics          # Reports primitive metrics.
http post http://ip_address/serversphere/agent/restart/sshd "" # Restarts SSHD.
http post http://ip_address/serversphere/agent/restart/vnc  "" # Restarts SSHD.
http post http://ip_address/serversphere/agent/reboot       "" # Reboots the node.

# More to be implemented probably.
```
