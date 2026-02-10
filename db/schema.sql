-- USERS
CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       email TEXT NOT NULL,
                       password_hash TEXT,
                       role TEXT NOT NULL,
                       created_at TIMESTAMP DEFAULT NOW()
);

-- CARS
CREATE TABLE cars (
                      id BIGSERIAL PRIMARY KEY,
                      brand TEXT NOT NULL,
                      model TEXT NOT NULL,
                      year INT NOT NULL,
                      price NUMERIC,
                      status TEXT NOT NULL DEFAULT 'available',
                      is_auction_only BOOLEAN DEFAULT FALSE,
                      created_at TIMESTAMP DEFAULT NOW()
);

-- AUCTIONS
CREATE TABLE auctions (
                          id BIGSERIAL PRIMARY KEY,
                          car_id BIGINT NOT NULL REFERENCES cars(id),
                          start_price NUMERIC NOT NULL,
                          start_time TIMESTAMP NOT NULL,
                          end_time TIMESTAMP NOT NULL,
                          created_at TIMESTAMP DEFAULT NOW()
);

-- BIDS
CREATE TABLE bids (
                      id BIGSERIAL PRIMARY KEY,
                      auction_id BIGINT NOT NULL REFERENCES auctions(id),
                      user_id BIGINT NOT NULL REFERENCES users(id),
                      amount NUMERIC NOT NULL,
                      created_at TIMESTAMP DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
                        id BIGSERIAL PRIMARY KEY,
                        user_id BIGINT NOT NULL REFERENCES users(id),
                        car_id BIGINT NOT NULL REFERENCES cars(id),
                        total_price NUMERIC NOT NULL,
                        source TEXT NOT NULL, -- 'auction' or 'direct'
                        created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE favorites (
                           user_id BIGINT NOT NULL,
                           car_id  BIGINT NOT NULL,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                           CONSTRAINT pk_favorites PRIMARY KEY (user_id, car_id),

                           CONSTRAINT fk_favorites_user
                               FOREIGN KEY (user_id)
                                   REFERENCES users(id)
                                   ON DELETE CASCADE,

                           CONSTRAINT fk_favorites_car
                               FOREIGN KEY (car_id)
                                   REFERENCES cars(id)
                                   ON DELETE CASCADE
);

