use axum::http::StatusCode;
use nix::sys::reboot::RebootMode;
use tracing::instrument;

#[instrument]
pub async fn reboot() -> Result<(), StatusCode> {
    tracing::debug!(message = "handling reboot request");
    let _ = nix::sys::reboot::reboot(RebootMode::RB_AUTOBOOT)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(())
}
