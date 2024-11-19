{
    pkgs,
    lib,
    ...
}:

pkgs.mkShell rec {
    nativeBuildInputs = with pkgs; [ pkg-config ];
    buildInputs = with pkgs; [
        openssl
        sqlx-cli
        sqlite
    ];

    LD_LIBRARY_PATH = lib.makeLibraryPath buildInputs;
    RUST_SRC_PATH = "${pkgs.rust.packages.stable.rustPlatform.rustLibSrc}";
}
