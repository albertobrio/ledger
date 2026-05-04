CREATE TABLE ledger_entry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sequence_number BIGINT NOT NULL,
    stream_id VARCHAR(200) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload_json LONGTEXT NOT NULL,
    previous_hash VARCHAR(128) NOT NULL,
    current_hash VARCHAR(128) NOT NULL,
    signature_base64 TEXT NOT NULL,
    created_utc DATETIME(6) NOT NULL,
    UNIQUE KEY ux_stream_sequence (stream_id, sequence_number),
    INDEX idx_stream_date (stream_id, created_utc)
);

DELIMITER $$

CREATE TRIGGER ledger_no_update
BEFORE UPDATE ON ledger_entry
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Ledger is append-only';
END$$

CREATE TRIGGER ledger_no_delete
BEFORE DELETE ON ledger_entry
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Ledger is append-only';
END$$

DELIMITER ;

CREATE TABLE ledger_daily_digest (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stream_id VARCHAR(200) NOT NULL,
    digest_date DATE NOT NULL,
    merkle_root VARCHAR(128) NOT NULL,
    block_count INT NOT NULL,
    signature_base64 TEXT NOT NULL,
    created_utc DATETIME(6) NOT NULL,
    UNIQUE KEY ux_stream_digest_date (stream_id, digest_date)
);

CREATE TABLE ledger_stream (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stream_id VARCHAR(200) NOT NULL UNIQUE,
    tenant_code VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_utc DATETIME(6) NOT NULL
);

INSERT INTO ledger_stream (stream_id, tenant_code, enabled, created_utc)
VALUES ('grades:cvsg', 'cvsg', TRUE, NOW(6));

CREATE TABLE ledger_api_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(100),
    method VARCHAR(20) NOT NULL,
    url TEXT NOT NULL,
    ip VARCHAR(100),
    status_code INT,
    created_utc DATETIME(6) NOT NULL
);