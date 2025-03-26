CREATE TABLE events(
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    event_time_start TIME NOT NULL,
    event_time_end TIME NOT NULL,
    event_location VARCHAR(255) NOT NULL,
    event_items VARCHAR(255) NOT NULL,
    event_description VARCHAR(255) NOT NULL,
    event_completed BOOLEAN NOT NULL DEFAULT FALSE,
    event_type VARCHAR(100) NOT NULL,
    event_status VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
