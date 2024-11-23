use axum::{http::StatusCode, Json};
use nix::sys::reboot::RebootMode;
use serde::Serialize;
use std::{convert::Infallible, io, process::Command, thread, time::Duration};
use sysinfo::System;
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

#[derive(Debug, Clone, Serialize)]
pub struct MetricsResponse {
    cpu_usage: f64,
    ram_usage: f64,
    process_count: usize,
}

impl MetricsResponse {
    #[expect(clippy::cast_precision_loss)]
    pub fn new(system: &System) -> Self {
        Self {
            cpu_usage: (system.global_cpu_usage() / 100.0_f32).into(),
            ram_usage: system.used_memory() as f64 / system.total_memory() as f64,
            process_count: system.processes().len(),
        }
    }
}

#[axum::debug_handler]
#[instrument]
pub async fn metrics() -> Result<Json<MetricsResponse>, StatusCode> {
    tracing::debug!(message = "metrics requested, collecting");
    let mut system = System::new_all();
    system.refresh_all();
    let response = MetricsResponse::new(&system);
    Ok(Json(response))
}

#[axum::debug_handler]
#[instrument]
pub async fn restart_sshd() -> Result<&'static str, StatusCode> {
    tracing::debug!(message = "sshd restart requested");
    kill_process_by_name("sshd")?;
    Ok("sshd restared. all ssh sessions should be closed by now")
}

#[instrument(name = "restart_helper")]
fn kill_process_by_name(process_name: &'static str) -> Result<(), StatusCode> {
    // God forgive me for what I am about to do...
    tracing::debug!("attempting to kill {process_name:?}");
    let status = Command::new("pkill")
        .args(["-ef", process_name])
        .output()
        .inspect_err(|error| tracing::error!(message = "error collecting command output", ?error))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .status;
    if !status.success() {
        tracing::error!(message = "restart command returned nonzero exit code");
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    tracing::debug!("{process_name:?} should be restarted by now");

    Ok(())
}
