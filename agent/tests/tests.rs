use serversphere_agent::add;

#[test]
fn sanity_check() {
    assert_eq!(add(2, 2), 4);
    assert_eq!(add(1, 3), 4);
    assert_eq!(add(2, 3), 5);
    assert_eq!(add(0, 2), 2);
}
