use axum::http::StatusCode;
use nix::sys::reboot::RebootMode;
use std::{convert::Infallible, io, thread, time::Duration};
use tracing::instrument;

const REBOOT_DELAY: u64 = 500;

#[instrument]
pub async fn reboot() -> Result<&'static str, StatusCode> {
    tracing::debug!(message = "handling reboot request");

    let message = format!("spawning reboot thread, should fire in {REBOOT_DELAY}ms");
    tracing::debug!(message);
    thread::spawn(move || -> Result<Infallible, io::Error> {
        thread::sleep(Duration::from_millis(REBOOT_DELAY));
        let _ = nix::sys::reboot::reboot(RebootMode::RB_AUTOBOOT)?;
        unreachable!("system should be rebooting at this point");
    });

    Ok("node will reboot soon")
}
