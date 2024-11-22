#![allow(clippy::missing_panics_doc)]
#![allow(clippy::missing_errors_doc)]

mod error;

pub use error::*;

use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{http::StatusCode, Router};
use std::net::Ipv4Addr;
use tokio::net::TcpListener;
use tracing::instrument;

pub const PORT: u16 = 8000;

#[instrument(name = "agent_main")]
pub async fn run_agent() -> Result<(), crate::Error> {
    let router = Router::new()
        .route("/status", get(health_check))
        .route("/reboot", post(unimplemented));

    let addr = (Ipv4Addr::UNSPECIFIED, PORT);
    tracing::info!(message = "setting up listener", ?addr);
    let listener = TcpListener::bind(addr).await?;
    tracing::info!(message = "starting axum listener");
    axum::serve(listener, router).await?;

    Ok(())
}

#[instrument]
pub async fn health_check() -> impl IntoResponse {
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
