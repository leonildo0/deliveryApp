CREATE TABLE usuario (
  idusuario INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE root (
  idroot INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_idusuario INTEGER NOT NULL UNIQUE,
  FOREIGN KEY (usuario_idusuario) REFERENCES usuario(idusuario)
);

CREATE TABLE cliente (
  idcliente INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_idusuario INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'blocked')),
  FOREIGN KEY (usuario_idusuario) REFERENCES usuario(idusuario)
);

CREATE TABLE entregador (
  identregador INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_idusuario INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('offline', 'online', 'busy')),
  current_location_id INTEGER,
  FOREIGN KEY (usuario_idusuario) REFERENCES usuario(idusuario)
);

CREATE TABLE moto (
  idmoto INTEGER PRIMARY KEY AUTOINCREMENT,
  entregador_id INTEGER NOT NULL UNIQUE,
  plate TEXT NOT NULL,
  model TEXT,
  color TEXT,
  FOREIGN KEY (entregador_id) REFERENCES entregador(identregador)
);

CREATE TABLE location (
  idlocation INTEGER PRIMARY KEY AUTOINCREMENT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
  source_type TEXT NOT NULL CHECK (source_type IN ('deliverer', 'request'))
);

CREATE TABLE item (
  iditem INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  weight_kg REAL,
  height_cm REAL,
  width_cm REAL,
  length_cm REAL,
  notes TEXT
);

CREATE TABLE solicitacao (
  idsolicitacao INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('requested', 'accepted', 'canceled', 'expired', 'fulfilled')),
  item_id INTEGER NOT NULL,
  pickup_location_id INTEGER NOT NULL,
  dropoff_location_id INTEGER NOT NULL,
  checkin_code TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (cliente_id) REFERENCES cliente(idcliente),
  FOREIGN KEY (item_id) REFERENCES item(iditem),
  FOREIGN KEY (pickup_location_id) REFERENCES location(idlocation),
  FOREIGN KEY (dropoff_location_id) REFERENCES location(idlocation)
);

CREATE TABLE entrega (
  identrega INTEGER PRIMARY KEY AUTOINCREMENT,
  entregador_id INTEGER NOT NULL,
  solicitacao_id INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('checkin_pending', 'in_progress', 'completed', 'canceled')),
  checkin_at TEXT,
  checkout_at TEXT,
  FOREIGN KEY (entregador_id) REFERENCES entregador(identregador),
  FOREIGN KEY (solicitacao_id) REFERENCES solicitacao(idsolicitacao)
);

CREATE TABLE delivery_share (
  iddelivery_share INTEGER PRIMARY KEY AUTOINCREMENT,
  solicitacao_id INTEGER NOT NULL UNIQUE,
  share_token TEXT NOT NULL UNIQUE,
  checkout_code TEXT NOT NULL,
  checkout_code_visible INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT,
  FOREIGN KEY (solicitacao_id) REFERENCES solicitacao(idsolicitacao)
);

CREATE TABLE status_history (
  idstatus_history INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('cliente', 'entregador', 'solicitacao', 'entrega')),
  entity_id INTEGER NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TEXT NOT NULL DEFAULT (datetime('now')),
  changed_by_user_id INTEGER NOT NULL,
  FOREIGN KEY (changed_by_user_id) REFERENCES usuario(idusuario)
);

CREATE UNIQUE INDEX uq_active_request_per_client
  ON solicitacao (cliente_id)
  WHERE status IN ('requested', 'accepted');

CREATE UNIQUE INDEX uq_active_delivery_per_deliverer
  ON entrega (entregador_id)
  WHERE status IN ('checkin_pending', 'in_progress');

CREATE INDEX ix_entregador_location
  ON entregador (current_location_id);

CREATE INDEX ix_solicitacao_status
  ON solicitacao (status);

CREATE INDEX ix_entrega_status
  ON entrega (status);

CREATE INDEX ix_location_recorded_at
  ON location (recorded_at);
