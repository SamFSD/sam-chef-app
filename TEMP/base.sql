BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> 82a5fd2ca252

CREATE TABLE company (
    desk_future_reservation_cutoff TIME WITH TIME ZONE DEFAULT '07:00:00+00'::time with time zone NOT NULL, 
    company_name VARCHAR NOT NULL, 
    website VARCHAR, 
    external_api VARCHAR, 
    desk_today_reservation_time_limit INTEGER DEFAULT 480 NOT NULL, 
    business_id VARCHAR, 
    default_floor INTEGER, 
    screening_active BOOLEAN, 
    screening_template VARCHAR, 
    screening_temperature BOOLEAN, 
    covid_no_vax_no_entry BOOLEAN, 
    covid_check_at_sign_in BOOLEAN, 
    room_schedule_integration_type VARCHAR, 
    pre_screening_template VARCHAR, 
    primary_color VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    UNIQUE (external_api)
);

CREATE EXTENSION IF NOT EXISTS btree_gist;;

CREATE TABLE building (
    create_date TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    company_id INTEGER, 
    address VARCHAR NOT NULL, 
    building_name VARCHAR NOT NULL, 
    gps_co_ords VARCHAR, 
    building_api_name VARCHAR, 
    building_api_id VARCHAR, 
    district VARCHAR, 
    province VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(company_id) REFERENCES company (id)
);

CREATE TABLE user_role (
    user_role_name VARCHAR NOT NULL, 
    description VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    UNIQUE (user_role_name)
);

CREATE TABLE floor (
    create_date TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    floor_level INTEGER NOT NULL, 
    floor_name VARCHAR, 
    map_image VARCHAR, 
    map_dimension_x INTEGER, 
    map_dimension_y INTEGER, 
    building_id INTEGER, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(building_id) REFERENCES building (id)
);

CREATE TABLE users (
    create_date TIMESTAMP WITH TIME ZONE, 
    signed_in_time TIMESTAMP WITH TIME ZONE, 
    signed_out_time TIMESTAMP WITH TIME ZONE, 
    auto_signed_out_time TIMESTAMP WITH TIME ZONE, 
    last_screening_time TIMESTAMP WITH TIME ZONE, 
    last_pre_screening_time TIMESTAMP WITH TIME ZONE, 
    birth_date DATE, 
    user_name VARCHAR, 
    email VARCHAR NOT NULL, 
    company_id INTEGER, 
    user_role_id INTEGER, 
    last_floor_id INTEGER, 
    last_screening_temperature VARCHAR, 
    sa_id_or_passport_number VARCHAR, 
    job_category VARCHAR, 
    employee_gender VARCHAR, 
    department VARCHAR, 
    cellphone VARCHAR, 
    covid_vax_confirmed VARCHAR, 
    covid_vax_verified VARCHAR, 
    covid_vax_verified_err VARCHAR, 
    vax_image_url VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(company_id) REFERENCES company (id), 
    FOREIGN KEY(last_floor_id) REFERENCES floor (id), 
    FOREIGN KEY(user_role_id) REFERENCES user_role (id), 
    UNIQUE (email)
);

CREATE TABLE desk (
    create_date TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    available BOOLEAN DEFAULT true NOT NULL, 
    desk_name VARCHAR, 
    co_ord_x INTEGER NOT NULL, 
    co_ord_y INTEGER NOT NULL, 
    floor_id INTEGER NOT NULL, 
    desk_type VARCHAR, 
    assigned_user_id INTEGER, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(assigned_user_id) REFERENCES users (id), 
    FOREIGN KEY(floor_id) REFERENCES floor (id), 
    UNIQUE (co_ord_x, co_ord_y, floor_id)
);

CREATE TABLE desk_occupancy (
    checked_in_time TIMESTAMP WITH TIME ZONE NOT NULL, 
    checked_out_time TIMESTAMP WITH TIME ZONE, 
    user_id INTEGER NOT NULL, 
    desk_id INTEGER NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(desk_id) REFERENCES desk (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE desk_reservation (
    reservation_time TIMESTAMP WITH TIME ZONE NOT NULL, 
    reservation_time_end TIMESTAMP WITH TIME ZONE, 
    reservation_expiration_time TIMESTAMP WITH TIME ZONE, 
    user_id INTEGER NOT NULL, 
    desk_id INTEGER NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    CONSTRAINT reservation_overlap EXCLUDE USING gist (int4range(desk_id, desk_id, '[]'::text) WITH =, tstzrange(reservation_time, reservation_expiration_time) WITH &&), 
    FOREIGN KEY(desk_id) REFERENCES desk (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

INSERT INTO alembic_version (version_num) VALUES ('82a5fd2ca252') RETURNING alembic_version.version_num;

-- Running upgrade 82a5fd2ca252 -> 0df12a0c0c76

CREATE TABLE action (
    action_name VARCHAR NOT NULL, 
    description VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    UNIQUE (action_name), 
    UNIQUE (description)
);

CREATE TABLE domains (
    domain VARCHAR NOT NULL, 
    company_id INTEGER NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(company_id) REFERENCES company (id)
);

CREATE TABLE zone (
    company_id INTEGER NOT NULL, 
    zone_name VARCHAR NOT NULL, 
    zone_description VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(company_id) REFERENCES company (id), 
    UNIQUE (zone_name, company_id)
);

CREATE TABLE floor_entrance (
    create_date TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    floor_entrance_name VARCHAR, 
    co_ord_x INTEGER NOT NULL, 
    co_ord_y INTEGER NOT NULL, 
    floor_id INTEGER NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(floor_id) REFERENCES floor (id), 
    UNIQUE (co_ord_x, co_ord_y, floor_id)
);

CREATE TABLE venue (
    create_date TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    name VARCHAR, 
    floor_id INTEGER NOT NULL, 
    co_ord_x INTEGER NOT NULL, 
    co_ord_y INTEGER NOT NULL, 
    venue_type VARCHAR, 
    venue_email VARCHAR, 
    venue_capacity INTEGER, 
    icalendar_url VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(floor_id) REFERENCES floor (id), 
    UNIQUE (co_ord_x, co_ord_y, floor_id)
);

CREATE TABLE room (
    create_date TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    name VARCHAR, 
    co_ord_x INTEGER NOT NULL, 
    co_ord_y INTEGER NOT NULL, 
    floor_id INTEGER NOT NULL, 
    room_api_name VARCHAR, 
    room_api_id VARCHAR, 
    url_for_icalendar VARCHAR, 
    ms_graph_room_id VARCHAR, 
    workwide_id VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(floor_id) REFERENCES floor (id), 
    UNIQUE (co_ord_x, co_ord_y, floor_id)
);

CREATE TABLE user_zone (
    user_id INTEGER NOT NULL, 
    zone_id INTEGER NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id), 
    FOREIGN KEY(zone_id) REFERENCES zone (id), 
    UNIQUE (zone_id, user_id)
);

CREATE TABLE venue_booking_log (
    booking_start_time TIMESTAMP WITH TIME ZONE NOT NULL, 
    booking_end_time TIMESTAMP WITH TIME ZONE NOT NULL, 
    create_date TIMESTAMP WITH TIME ZONE NOT NULL, 
    last_updated_date TIMESTAMP WITH TIME ZONE, 
    venue_id INTEGER NOT NULL, 
    operator_id INTEGER NOT NULL, 
    approve BOOLEAN, 
    arrived BOOLEAN, 
    number_of_attendees INTEGER NOT NULL, 
    requester_name VARCHAR, 
    auth_manager VARCHAR, 
    auth_directorate VARCHAR, 
    host_name VARCHAR, 
    reject_reason VARCHAR, 
    event_name VARCHAR, 
    organiser_name VARCHAR, 
    auth_manager_email VARCHAR, 
    host_email VARCHAR, 
    organiser_email VARCHAR, 
    organiser_number VARCHAR, 
    requester_email VARCHAR, 
    event_id VARCHAR, 
    additional_notes VARCHAR, 
    canceled BOOLEAN, 
    vehicle_registration VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(operator_id) REFERENCES users (id), 
    FOREIGN KEY(venue_id) REFERENCES venue (id)
);

CREATE TABLE desk_zone (
    desk_id INTEGER NOT NULL, 
    zone_id INTEGER NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(desk_id) REFERENCES desk (id), 
    FOREIGN KEY(zone_id) REFERENCES zone (id), 
    UNIQUE (desk_id, zone_id)
);

UPDATE alembic_version SET version_num='0df12a0c0c76' WHERE alembic_version.version_num = '82a5fd2ca252';

-- Running upgrade 0df12a0c0c76 -> 07b122e0fb3b

CREATE TABLE area (
    area_name VARCHAR, 
    floor_id INTEGER NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(floor_id) REFERENCES floor (id)
);

CREATE TABLE sigfox_button (
    device_name VARCHAR, 
    device_id VARCHAR, 
    description VARCHAR, 
    state VARCHAR, 
    location_area VARCHAR, 
    zone_id INTEGER, 
    co_ord_x INTEGER NOT NULL, 
    co_ord_y INTEGER NOT NULL, 
    floor_id INTEGER NOT NULL, 
    button_type VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(floor_id) REFERENCES floor (id), 
    FOREIGN KEY(zone_id) REFERENCES zone (id), 
    UNIQUE (co_ord_x, co_ord_y, floor_id)
);

CREATE TABLE sigfox_button_sim_number (
    zone_id INTEGER, 
    day_shift VARCHAR NOT NULL, 
    night_shift VARCHAR, 
    escalation_one VARCHAR NOT NULL, 
    escalation_two VARCHAR NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(zone_id) REFERENCES zone (id)
);

CREATE TABLE zone_floor (
    zone_id INTEGER, 
    floor_id INTEGER, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(floor_id) REFERENCES floor (id) ON DELETE SET NULL, 
    FOREIGN KEY(zone_id) REFERENCES zone (id) ON DELETE SET NULL
);

CREATE TABLE area_seat (
    area_id INTEGER NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(area_id) REFERENCES area (id)
);

CREATE TABLE sigfox_button_logs (
    time_stamp TIMESTAMP WITH TIME ZONE NOT NULL, 
    sigfox_button_id INTEGER, 
    button_press_type VARCHAR, 
    action VARCHAR NOT NULL, 
    source VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(sigfox_button_id) REFERENCES sigfox_button (id)
);

CREATE TABLE area_seat_event (
    timestamp_range TSTZRANGE NOT NULL, 
    user_id INTEGER NOT NULL, 
    area_seat_id INTEGER NOT NULL, 
    event_type VARCHAR, 
    canceled BOOLEAN DEFAULT false, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(area_seat_id) REFERENCES area_seat (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE area_seat_log (
    reservation_start TIMESTAMP WITH TIME ZONE, 
    reservation_end TIMESTAMP WITH TIME ZONE, 
    user_id INTEGER NOT NULL, 
    area_seat_id INTEGER NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(area_seat_id) REFERENCES area_seat (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

UPDATE alembic_version SET version_num='07b122e0fb3b' WHERE alembic_version.version_num = '0df12a0c0c76';

-- Running upgrade 07b122e0fb3b -> e0a3d42c6f06

CREATE TABLE checkin (
    user_id INTEGER NOT NULL, 
    zone_id INTEGER, 
    state VARCHAR DEFAULT 'NO_RESPONSE' NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id), 
    FOREIGN KEY(zone_id) REFERENCES zone (id)
);

CREATE TABLE checkin_log (
    time_stamp TIMESTAMP WITH TIME ZONE NOT NULL, 
    action VARCHAR NOT NULL, 
    checkin_id INTEGER NOT NULL, 
    reason VARCHAR, 
    reason_other VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(checkin_id) REFERENCES checkin (id)
);

CREATE TABLE scan_code (
    scan_code VARCHAR NOT NULL, 
    desk_id INTEGER, 
    floor_entrance_id INTEGER, 
    user_id INTEGER, 
    room_id INTEGER, 
    sigfox_button_id INTEGER, 
    area_id INTEGER, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    CHECK (
            num_nonnulls(
                user_id,
                desk_id,
                room_id,
                floor_entrance_id,
                area_id,
                sigfox_button_id
            ) = 1
            ), 
    FOREIGN KEY(area_id) REFERENCES area (id), 
    FOREIGN KEY(desk_id) REFERENCES desk (id), 
    FOREIGN KEY(floor_entrance_id) REFERENCES floor_entrance (id), 
    FOREIGN KEY(room_id) REFERENCES room (id), 
    FOREIGN KEY(sigfox_button_id) REFERENCES sigfox_button (id), 
    FOREIGN KEY(user_id) REFERENCES users (id), 
    UNIQUE (scan_code), 
    UNIQUE (area_id), 
    UNIQUE (desk_id), 
    UNIQUE (floor_entrance_id), 
    UNIQUE (room_id), 
    UNIQUE (sigfox_button_id), 
    UNIQUE (user_id)
);

CREATE TABLE log (
    time_stamp TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    action_id INTEGER, 
    user_id INTEGER, 
    scan_code_id INTEGER, 
    desk_id INTEGER, 
    room_id INTEGER, 
    floor_id INTEGER, 
    floor_entrance_id INTEGER, 
    nature_of_visit VARCHAR, 
    temperature VARCHAR, 
    is_vax_declared VARCHAR, 
    is_vax_proof VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(action_id) REFERENCES action (id), 
    FOREIGN KEY(desk_id) REFERENCES desk (id), 
    FOREIGN KEY(floor_entrance_id) REFERENCES floor_entrance (id), 
    FOREIGN KEY(floor_id) REFERENCES floor (id), 
    FOREIGN KEY(room_id) REFERENCES room (id), 
    FOREIGN KEY(scan_code_id) REFERENCES scan_code (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

UPDATE alembic_version SET version_num='e0a3d42c6f06' WHERE alembic_version.version_num = '07b122e0fb3b';

-- Running upgrade e0a3d42c6f06 -> 60a4720d723f

ALTER TABLE users ADD COLUMN region VARCHAR;

ALTER TABLE venue ALTER COLUMN create_date SET NOT NULL;

UPDATE alembic_version SET version_num='60a4720d723f' WHERE alembic_version.version_num = 'e0a3d42c6f06';

-- Running upgrade 60a4720d723f -> 38779d1be786

ALTER TABLE scan_code ADD COLUMN is_active BOOLEAN;

ALTER TABLE scan_code DROP CONSTRAINT scan_code_check;

ALTER TABLE scan_code ADD CONSTRAINT scan_code_check CHECK (
            (
                num_nonnulls(
                    user_id,
                    desk_id,
                    room_id,
                    floor_entrance_id,
                    area_id,
                    sigfox_button_id
                ) = 1
            )
            or
            (
                (
                    num_nonnulls(
                        user_id,
                        desk_id,
                        room_id,
                        floor_entrance_id,
                        area_id,
                        sigfox_button_id
                    ) = 0
                )
                AND
                (
                    is_active is FALSE
                )
            )
        );

UPDATE alembic_version SET version_num='38779d1be786' WHERE alembic_version.version_num = '60a4720d723f';

-- Running upgrade 38779d1be786 -> 45a955a7a6c4

CREATE TABLE vehicle (
    company_id INTEGER NOT NULL, 
    license_number VARCHAR NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(company_id) REFERENCES company (id)
);

UPDATE alembic_version SET version_num='45a955a7a6c4' WHERE alembic_version.version_num = '38779d1be786';

-- Running upgrade 45a955a7a6c4 -> 637459cc62cc

ALTER TABLE sigfox_button_logs ADD COLUMN event_id INTEGER;

UPDATE alembic_version SET version_num='637459cc62cc' WHERE alembic_version.version_num = '45a955a7a6c4';

-- Running upgrade 637459cc62cc -> fcb031004846

CREATE TABLE contacts (
    create_date TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    user_name VARCHAR, 
    email VARCHAR, 
    company_id INTEGER, 
    cellphone VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(company_id) REFERENCES company (id)
);

ALTER TABLE building ADD COLUMN pin_link VARCHAR;

ALTER TABLE building ALTER COLUMN address DROP NOT NULL;

UPDATE alembic_version SET version_num='fcb031004846' WHERE alembic_version.version_num = '637459cc62cc';

-- Running upgrade fcb031004846 -> ab893ce6dd8d

CREATE TABLE checkin_template (
    message_template VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id)
);

ALTER TABLE checkin ADD COLUMN is_active BOOLEAN;

ALTER TABLE checkin_log ADD COLUMN updated_state VARCHAR;

UPDATE alembic_version SET version_num='ab893ce6dd8d' WHERE alembic_version.version_num = 'fcb031004846';

-- Running upgrade ab893ce6dd8d -> 4ff8e69ff225

ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'USER' NOT NULL;

UPDATE alembic_version SET version_num='4ff8e69ff225' WHERE alembic_version.version_num = 'ab893ce6dd8d';

-- Running upgrade 4ff8e69ff225 -> 61df5999c707

ALTER TABLE checkin ADD COLUMN last_template_id INTEGER;

ALTER TABLE checkin ALTER COLUMN zone_id SET NOT NULL;

ALTER TABLE checkin ADD CONSTRAINT fk_checkin_checkin_template_id FOREIGN KEY(last_template_id) REFERENCES checkin_template (id);

ALTER TABLE users ALTER COLUMN company_id SET NOT NULL;

UPDATE alembic_version SET version_num='61df5999c707' WHERE alembic_version.version_num = '4ff8e69ff225';

-- Running upgrade 61df5999c707 -> cd0c5c8e23fa

CREATE TABLE room_log (
    time_stamp TIMESTAMP WITH TIME ZONE NOT NULL, 
    room_id INTEGER NOT NULL, 
    operator_id INTEGER NOT NULL, 
    action_id INTEGER NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(action_id) REFERENCES action (id), 
    FOREIGN KEY(operator_id) REFERENCES users (id), 
    FOREIGN KEY(room_id) REFERENCES room (id)
);

UPDATE alembic_version SET version_num='cd0c5c8e23fa' WHERE alembic_version.version_num = '61df5999c707';

-- Running upgrade cd0c5c8e23fa -> a671fa7ddb88

ALTER TABLE room_log ADD COLUMN event JSON NOT NULL;

UPDATE alembic_version SET version_num='a671fa7ddb88' WHERE alembic_version.version_num = 'cd0c5c8e23fa';

-- Running upgrade a671fa7ddb88 -> 7102afd933ad

ALTER TABLE checkin_template ADD COLUMN message_name VARCHAR;

UPDATE alembic_version SET version_num='7102afd933ad' WHERE alembic_version.version_num = 'a671fa7ddb88';

-- Running upgrade 7102afd933ad -> 3d43d914ca8a

ALTER TABLE venue ADD COLUMN section VARCHAR;

UPDATE alembic_version SET version_num='3d43d914ca8a' WHERE alembic_version.version_num = '7102afd933ad';

-- Running upgrade 3d43d914ca8a -> 2e8174e3301e

ALTER TABLE sigfox_button_logs ALTER COLUMN event_id TYPE VARCHAR;

UPDATE alembic_version SET version_num='2e8174e3301e' WHERE alembic_version.version_num = '3d43d914ca8a';

-- Running upgrade 2e8174e3301e -> 40201ba88722

ALTER TABLE checkin_template DROP COLUMN message_name;

UPDATE alembic_version SET version_num='40201ba88722' WHERE alembic_version.version_num = '2e8174e3301e';

-- Running upgrade 40201ba88722 -> 3d3718cc5210

CREATE TABLE court (
    create_date TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    court_name VARCHAR NOT NULL, 
    co_ord_x INTEGER NOT NULL, 
    co_ord_y INTEGER NOT NULL, 
    floor_id INTEGER NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(floor_id) REFERENCES floor (id), 
    UNIQUE (co_ord_x, co_ord_y, floor_id)
);

CREATE TABLE court_event (
    event_range TSTZRANGE NOT NULL, 
    user_id INTEGER NOT NULL, 
    court_id INTEGER NOT NULL, 
    event_info VARCHAR, 
    canceled BOOLEAN DEFAULT false NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(court_id) REFERENCES court (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

UPDATE alembic_version SET version_num='3d3718cc5210' WHERE alembic_version.version_num = '40201ba88722';

-- Running upgrade 3d3718cc5210 -> 47a4f58c3844

CREATE TABLE checkin_shift (
    start_time TIME WITH TIME ZONE DEFAULT '07:00:00+00'::time with time zone NOT NULL, 
    shift_name VARCHAR NOT NULL, 
    company_id INTEGER NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(company_id) REFERENCES company (id)
);

ALTER TABLE checkin ADD COLUMN shift_id INTEGER;

ALTER TABLE checkin ALTER COLUMN zone_id DROP NOT NULL;

ALTER TABLE checkin ADD CONSTRAINT fk_checkin_checkin_shift FOREIGN KEY(shift_id) REFERENCES checkin_shift (id);

UPDATE alembic_version SET version_num='47a4f58c3844' WHERE alembic_version.version_num = '3d3718cc5210';

-- Running upgrade 47a4f58c3844 -> 917dba89c50d

ALTER TABLE users ADD COLUMN auth_id VARCHAR;

UPDATE alembic_version SET version_num='917dba89c50d' WHERE alembic_version.version_num = '47a4f58c3844';

-- Running upgrade 917dba89c50d -> f2477315f268

ALTER TABLE venue_booking_log ADD COLUMN parking_spots INTEGER;

ALTER TABLE venue_booking_log ADD COLUMN car_details VARCHAR;

UPDATE alembic_version SET version_num='f2477315f268' WHERE alembic_version.version_num = '917dba89c50d';

-- Running upgrade f2477315f268 -> d536cb85770b

ALTER TABLE sigfox_button_logs ADD COLUMN wam_id VARCHAR;

UPDATE alembic_version SET version_num='d536cb85770b' WHERE alembic_version.version_num = 'f2477315f268';

-- Running upgrade d536cb85770b -> 6d9cfa3723bf

ALTER TABLE court_event ADD COLUMN event_person VARCHAR NOT NULL;

UPDATE alembic_version SET version_num='6d9cfa3723bf' WHERE alembic_version.version_num = 'd536cb85770b';

-- Running upgrade 6d9cfa3723bf -> 0281b4ee8e75

CREATE TABLE dispenser (
    create_date TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    dispenser_name VARCHAR NOT NULL, 
    dispenser_type VARCHAR NOT NULL, 
    sigfox_id VARCHAR, 
    co_ord_x INTEGER NOT NULL, 
    co_ord_y INTEGER NOT NULL, 
    floor_id INTEGER NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(floor_id) REFERENCES floor (id), 
    UNIQUE (co_ord_x, co_ord_y, floor_id)
);

UPDATE alembic_version SET version_num='0281b4ee8e75' WHERE alembic_version.version_num = '6d9cfa3723bf';

-- Running upgrade 0281b4ee8e75 -> 12ea8b2dbb25

ALTER TABLE users ADD COLUMN auth0_id VARCHAR;

UPDATE alembic_version SET version_num='12ea8b2dbb25' WHERE alembic_version.version_num = '0281b4ee8e75';

-- Running upgrade 12ea8b2dbb25 -> 44bab16199ef

CREATE TABLE information (
    create_date TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    info_name VARCHAR, 
    co_ord_x INTEGER NOT NULL, 
    co_ord_y INTEGER NOT NULL, 
    floor_id INTEGER NOT NULL, 
    icon VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(floor_id) REFERENCES floor (id), 
    UNIQUE (co_ord_x, co_ord_y, floor_id)
);

CREATE TABLE dispenser_log (
    time_stamp TIMESTAMP WITH TIME ZONE NOT NULL, 
    dispenser_id INTEGER, 
    payload VARCHAR NOT NULL, 
    status INTEGER NOT NULL, 
    level INTEGER, 
    activations INTEGER, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(dispenser_id) REFERENCES dispenser (id)
);

UPDATE alembic_version SET version_num='44bab16199ef' WHERE alembic_version.version_num = '12ea8b2dbb25';

-- Running upgrade 44bab16199ef -> 6af599c2ad5d

ALTER TABLE floor ADD COLUMN is_public BOOLEAN;

UPDATE alembic_version SET version_num='6af599c2ad5d' WHERE alembic_version.version_num = '44bab16199ef';

-- Running upgrade 6af599c2ad5d -> 8f71eb3fae4c

ALTER TABLE information ADD COLUMN content VARCHAR;

UPDATE alembic_version SET version_num='8f71eb3fae4c' WHERE alembic_version.version_num = '6af599c2ad5d';

-- Running upgrade 8f71eb3fae4c -> 930e4f4e0c25

ALTER TABLE scan_code ADD COLUMN information_id INTEGER;

ALTER TABLE scan_code ADD FOREIGN KEY(information_id) REFERENCES information (id);

ALTER TABLE scan_code DROP CONSTRAINT scan_code_check;

ALTER TABLE scan_code ADD CONSTRAINT scan_code_check CHECK (
            (
                num_nonnulls(
                    user_id,
                    desk_id,
                    room_id,
                    floor_entrance_id,
                    area_id,
                    sigfox_button_id,
                    information_id
                ) = 1
            )
            or
            (
                (
                    num_nonnulls(
                        user_id,
                        desk_id,
                        room_id,
                        floor_entrance_id,
                        area_id,
                        sigfox_button_id,
                        information_id
                    ) = 0
                )
                AND
                (
                    is_active is FALSE
                )
            )
        );

UPDATE alembic_version SET version_num='930e4f4e0c25' WHERE alembic_version.version_num = '8f71eb3fae4c';

-- Running upgrade 930e4f4e0c25 -> 93bd57aefecf

ALTER TABLE information ADD COLUMN colour VARCHAR;

UPDATE alembic_version SET version_num='93bd57aefecf' WHERE alembic_version.version_num = '930e4f4e0c25';

-- Running upgrade 93bd57aefecf -> 8a32dcfc8d4c

ALTER TABLE building ADD COLUMN live_score_url VARCHAR;

ALTER TABLE information ADD COLUMN info_type VARCHAR;

UPDATE alembic_version SET version_num='8a32dcfc8d4c' WHERE alembic_version.version_num = '93bd57aefecf';

-- Running upgrade 8a32dcfc8d4c -> 1689b85d7eee

CREATE TABLE clean (
    create_date TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    clean_area_name VARCHAR NOT NULL, 
    floor_id INTEGER NOT NULL, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(floor_id) REFERENCES floor (id)
);

CREATE TABLE clean_log (
    time_stamp TIMESTAMP WITH TIME ZONE NOT NULL, 
    clean_id INTEGER NOT NULL, 
    user_id INTEGER NOT NULL, 
    action VARCHAR NOT NULL, 
    is_clean BOOLEAN, 
    is_paper BOOLEAN, 
    is_soap BOOLEAN, 
    comment VARCHAR, 
    id INTEGER GENERATED ALWAYS AS IDENTITY, 
    PRIMARY KEY (id), 
    FOREIGN KEY(clean_id) REFERENCES clean (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

UPDATE alembic_version SET version_num='1689b85d7eee' WHERE alembic_version.version_num = '8a32dcfc8d4c';

-- Running upgrade 1689b85d7eee -> 46113731edf7

ALTER TABLE clean ADD COLUMN checks VARCHAR[];

UPDATE alembic_version SET version_num='46113731edf7' WHERE alembic_version.version_num = '1689b85d7eee';

COMMIT;

