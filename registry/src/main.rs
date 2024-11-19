use sqlx::SqlitePool;
use std::env;

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), eyre::Report> {
    let _ = color_eyre::install()
        .inspect_err(|error| eprintln!("Failed to install color_eyre: {error}"));
    let _ = install_tracing();

    let db_url = env::var("DATABASE_URL")?;
    let pool = SqlitePool::connect(&db_url).await?;
    tracing::info!(
        message = "connected to SQLite pool",
        url = ?db_url,
        capacity = pool.size()
    );

    dbg!(&pool);

    let virtual_machines = sqlx::query!("SELECT * FROM virtual_machines")
        .fetch_all(&pool)
        .await?;
    for vm in &virtual_machines {
        println!("{:?} {:?} {:?}", vm.id, vm.name, vm.powered);
    }

    Ok(())
}

fn install_tracing() -> Result<(), eyre::Report> {
    use tracing_error::ErrorLayer;
    use tracing_subscriber::{fmt, prelude::*, EnvFilter};

    let fmt_layer = fmt::layer().with_target(false);
    let filter_layer = EnvFilter::try_from_default_env().or_else(|_| EnvFilter::try_new("info"))?;

    tracing_subscriber::registry()
        .with(filter_layer)
        .with(fmt_layer)
        .with(ErrorLayer::default())
        .try_init()?;

    Ok(())
}
