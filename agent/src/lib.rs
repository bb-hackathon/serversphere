#![allow(clippy::missing_panics_doc)]
#![allow(clippy::missing_errors_doc)]

mod commands;
mod error;

pub use error::*;

use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{http::StatusCode, Router};
use std::net::Ipv4Addr;
use tokio::net::TcpListener;
use tracing::instrument;

pub const PORT: u16 = 8002;

#[instrument(name = "agent_main")]
pub async fn run_agent() -> Result<(), crate::Error> {
    let router = Router::new()
        .route("/credentials/sshd", post(commands::set_ssh_credentials))
        .route("/metrics", get(commands::metrics))
        .route("/reboot", post(commands::reboot))
        .route("/restart/sshd", post(commands::restart_sshd))
        .route("/restart/vnc", post(commands::restart_vnc))
        .route("/revoke_access", post(commands::revoke_access))
        .route("/status", get(health_check));
    let router = Router::new().nest("/serversphere/agent", router);

    let addr = (Ipv4Addr::UNSPECIFIED, PORT);
    tracing::info!(message = "setting up tcp listener", ?addr);
    let listener = TcpListener::bind(addr).await?;
    tracing::info!(message = "starting axum webserver");
    axum::serve(listener, router).await?;

    Ok(())
}

#[instrument]
pub async fn health_check() -> impl IntoResponse {
    tracing::debug!(message = "handling status request");
    (
        StatusCode::OK,
        format!("{} is online, node is alive", env!("CARGO_CRATE_NAME")),
    )
}

#[instrument]
pub async fn unimplemented() -> impl IntoResponse {
    tracing::warn!(message = "someone touched an unimplemented endpoint!");
    (
        StatusCode::NOT_IMPLEMENTED,
        "this endpoint is not yet implemented",
    )
}
