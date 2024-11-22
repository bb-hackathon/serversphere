#[tokio::main]
async fn main() -> Result<(), eyre::Report> {
    color_eyre::install()?;
    self::setup_tracing()?;

    serversphere_agent::run_agent().await?;

    Ok(())
}

fn setup_tracing() -> Result<(), eyre::Report> {
    use tracing_error::ErrorLayer;
    use tracing_subscriber::{fmt, prelude::*, EnvFilter};

    let filter_layer = EnvFilter::try_from_default_env().or_else(|_| EnvFilter::try_new("info"))?;
    let format_layer = fmt::layer().without_time().with_target(false);

    tracing_subscriber::registry()
        .with(filter_layer)
        .with(format_layer)
        .with(ErrorLayer::default())
        .try_init()?;

    Ok(())
}
