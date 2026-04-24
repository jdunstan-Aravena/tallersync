-- ============================================================
-- TallerSync — Seed Data
-- Compatible con schema v2 (Fix 1, 2, 3 aplicados)
-- Ejecutar en orden, no modificar los IDs fijos
-- ============================================================

-- ─────────────────────────────────────────────
-- ORGANIZACIÓN
-- ─────────────────────────────────────────────
INSERT INTO organizaciones (id, nombre, plan, activa, "creadoEn")
VALUES ('org-tallersync-demo', 'TallerSync Demo', 'PRO', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- LOCALES
-- ─────────────────────────────────────────────
INSERT INTO locales (id, nombre, slug, direccion, telefono, email, "organizacionId", activo, "creadoEn")
VALUES
  ('loc-santiago-centro', 'Santiago Centro', 'santiago-centro', 'Av. Libertador Bernardo O''Higgins 1234, Santiago', '+56 2 2345 6789', 'centro@tallersync.app', 'org-tallersync-demo', true, NOW()),
  ('loc-maipu',           'Maipú',           'maipu',           'Av. Pajaritos 3000, Maipú',                       '+56 2 2987 6543', 'maipu@tallersync.app',  'org-tallersync-demo', true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- USUARIOS
-- Contraseña de todos: Admin1234!
-- ─────────────────────────────────────────────
INSERT INTO usuarios (id, nombre, email, "passwordHash", rol, activo, "organizacionId", "creadoEn")
VALUES
  ('usr-admin',     'Administrador Demo', 'admin@tallersync.app',     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeCt1BbAh/LlGHqZe', 'ADMIN',     true, 'org-tallersync-demo', NOW()),
  ('usr-carlos',    'Carlos Muñoz',       'carlos.munoz@tallersync.app',   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeCt1BbAh/LlGHqZe', 'TECNICO',   true, 'org-tallersync-demo', NOW()),
  ('usr-pedro',     'Pedro Soto',         'pedro.soto@tallersync.app',     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeCt1BbAh/LlGHqZe', 'TECNICO',   true, 'org-tallersync-demo', NOW()),
  ('usr-recepcion', 'Recepción Centro',   'recepcion@tallersync.app', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeCt1BbAh/LlGHqZe', 'RECEPCION', true, 'org-tallersync-demo', NOW())
ON CONFLICT (email) DO NOTHING;

-- ─────────────────────────────────────────────
-- USUARIOS ↔ LOCALES
-- Admin y Recepción en Santiago Centro (principal)
-- Carlos en Santiago Centro, Pedro en Maipú
-- ─────────────────────────────────────────────
INSERT INTO usuarios_locales (id, "usuarioId", "localId", "esPrincipal")
VALUES
  ('ul-admin-centro',     'usr-admin',     'loc-santiago-centro', true),
  ('ul-recepcion-centro', 'usr-recepcion', 'loc-santiago-centro', true),
  ('ul-carlos-centro',    'usr-carlos',    'loc-santiago-centro', true),
  ('ul-pedro-maipu',      'usr-pedro',     'loc-maipu',           true)
ON CONFLICT ("usuarioId", "localId") DO NOTHING;

-- ─────────────────────────────────────────────
-- CATEGORÍAS DE REPUESTOS (Fix 1)
-- ─────────────────────────────────────────────
INSERT INTO categorias_repuestos (id, nombre, descripcion, activo, "organizacionId", "creadoEn")
VALUES
  ('cat-electronica',   'Electrónica',       'Tarjetas, placas y componentes electrónicos', true, 'org-tallersync-demo', NOW()),
  ('cat-mecanica',      'Mecánica',          'Motores, correas, rodamientos',               true, 'org-tallersync-demo', NOW()),
  ('cat-refrigeracion', 'Refrigeración',     'Compresores, gas, válvulas',                  true, 'org-tallersync-demo', NOW()),
  ('cat-consumibles',   'Consumibles',       'Lubricantes, soldadura, cinta',               true, 'org-tallersync-demo', NOW())
ON CONFLICT ("organizacionId", nombre) DO NOTHING;

-- ─────────────────────────────────────────────
-- PROVEEDORES
-- ─────────────────────────────────────────────
INSERT INTO proveedores (id, nombre, email, telefono, "contactoNombre", direccion, notas, activo, "organizacionId", "creadoEn", "actualizadoEn")
VALUES
  ('prov-electromax', 'Electromax Chile',        'ventas@electromax.cl',      '+56 2 2456 7788', 'Andrea Rojas', 'Av. Industrial 450, Santiago', 'Proveedor de electrónica y línea blanca', true, 'org-tallersync-demo', NOW(), NOW()),
  ('prov-refriandes', 'RefriAndes SpA',          'compras@refriandes.cl',     '+56 2 2567 8899', 'Matías Núñez', 'Camino a Melipilla 10200, Maipú', 'Especialista en refrigeración', true, 'org-tallersync-demo', NOW(), NOW()),
  ('prov-servipartes','ServiPartes Mayorista',   'contacto@servipartes.cl',   '+56 2 2678 9900', 'Camila Pérez', 'Panamericana Norte 123, Quilicura', 'Despacho 24 a 48 horas en RM', true, 'org-tallersync-demo', NOW(), NOW())
ON CONFLICT ("organizacionId", nombre) DO NOTHING;

-- ─────────────────────────────────────────────
-- REPUESTOS
-- ─────────────────────────────────────────────
INSERT INTO repuestos (id, nombre, sku, descripcion, "precioCompra", "precioVenta", "stockActual", "stockMinimo", activo, "localId", "categoriaId", "proveedorId", "creadoEn", "actualizadoEn")
VALUES
  ('rep-001', 'Tarjeta de control lavadora',  'TRJ-LAV-001', 'Compatible Samsung y LG',         25000, 45000, 3, 1, true, 'loc-santiago-centro', 'cat-electronica',   'prov-electromax', NOW(), NOW()),
  ('rep-002', 'Correa secadora universal',    'COR-SEC-001', 'L=1200mm, ancho 8mm',              3500,  8000,  8, 2, true, 'loc-santiago-centro', 'cat-mecanica',      'prov-servipartes', NOW(), NOW()),
  ('rep-003', 'Compresor frigorífico 1/5 HP', 'CMP-FRG-015', 'Para refrigeradores 200-350 lts', 55000, 95000, 1, 1, true, 'loc-santiago-centro', 'cat-refrigeracion', 'prov-refriandes', NOW(), NOW()),
  ('rep-004', 'Mecha resistencia horno',      'RES-HOR-001', 'Universal 220V 2000W',             4000,  9000,  5, 2, true, 'loc-santiago-centro', 'cat-electronica',   'prov-electromax', NOW(), NOW()),
  ('rep-005', 'Correa lavadora LG',           'COR-LAV-LG1', 'Original LG 6602-001655',         4500,  10000, 4, 2, true, 'loc-maipu',           'cat-mecanica',      'prov-servipartes', NOW(), NOW())
ON CONFLICT ("localId", sku) DO NOTHING;

-- ─────────────────────────────────────────────
-- CLIENTES (Fix 2: organizacionId obligatorio)
-- ─────────────────────────────────────────────
INSERT INTO clientes (id, nombre, email, telefono, rut, notas, "tokenSeguimiento", "organizacionId", "creadoEn", "actualizadoEn")
VALUES
  ('cli-001', 'María González',  'maria.gonzalez@gmail.com',  '+56 9 8123 4567', '12.345.678-9', NULL,                          'tok-cli-001', 'org-tallersync-demo', NOW(), NOW()),
  ('cli-002', 'Juan Pérez',      'juan.perez@hotmail.com',    '+56 9 7654 3210', '9.876.543-2',  'Cliente frecuente, buen trato', 'tok-cli-002', 'org-tallersync-demo', NOW(), NOW()),
  ('cli-003', 'Rosa Martínez',   NULL,                        '+56 9 6543 2109', NULL,           NULL,                          'tok-cli-003', 'org-tallersync-demo', NOW(), NOW()),
  ('cli-004', 'Empresa Hogar SpA', 'contacto@empresahogar.cl', '+56 2 2222 3333', '76.543.210-1', 'Empresa, pedir factura',       'tok-cli-004', 'org-tallersync-demo', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- EQUIPOS
-- ─────────────────────────────────────────────
INSERT INTO equipos (id, tipo, marca, modelo, "numeroSerie", color, accesorios, notas, "clienteId", "creadoEn")
VALUES
  ('equ-001', 'ELECTRODOMESTICO', 'Samsung',  'WW80J5355MW',   'SN-2021-88771', 'Blanco',  NULL,              NULL,                        'cli-001', NOW()),
  ('equ-002', 'ELECTRODOMESTICO', 'LG',       'GT29WDC',       'LG-2019-44321', 'Gris',    NULL,              'Segunda reparación del año', 'cli-002', NOW()),
  ('equ-003', 'ELECTRODOMESTICO', 'Mabe',     'EM9025CB0',     NULL,            'Blanco',  'Bandeja interior', NULL,                       'cli-003', NOW()),
  ('equ-004', 'ELECTRODOMESTICO', 'Fensa',    'MFX520WFGSS',   'FN-2020-55123', 'Blanco',  NULL,              NULL,                        'cli-004', NOW()),
  ('equ-005', 'ELECTRODOMESTICO', 'Whirlpool','WFW5000HW',     NULL,            'Blanco',  NULL,              NULL,                        'cli-001', NOW())
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- ÓRDENES DE TRABAJO
-- ─────────────────────────────────────────────
INSERT INTO ordenes_trabajo (
  id, numero, estado, falla, diagnostico, solucion,
  "condicionIngreso", "garantiaDias", "requierePresupuesto", "presupuestoAprobado",
  "fechaIngreso", "fechaCompromiso", "fechaEntrega",
  "totalManoObra", "totalRepuestos", total,
  "tokenPublico", "clienteId", "equipoId", "localId", "tecnicoId", "creadoPorId",
  "creadoEn", "actualizadoEn"
)
VALUES
  -- OT 1: En reparación
  ('ot-001', 1, 'EN_REPARACION',
   'No centrifuga, hace ruido fuerte al girar',
   'Correa de transmisión desgastada, rodamiento frontal con holgura',
   NULL,
   'Sin golpes visibles, tapa con rayado leve',
   30, false, NULL,
   NOW() - INTERVAL '3 days', NOW() + INTERVAL '2 days', NULL,
   15000, 10000, 25000,
   'tok-ot-001', 'cli-001', 'equ-001', 'loc-santiago-centro', 'usr-carlos', 'usr-recepcion',
   NOW() - INTERVAL '3 days', NOW()),

  -- OT 2: Lista para retiro
  ('ot-002', 2, 'LISTO_RETIRO',
   'No enfría, hace ruido de click cada 5 minutos',
   'Compresor con falla en arranque, relé térmico quemado',
   'Se reemplazó relé térmico y se verificó gas refrigerante. Equipo operativo.',
   'Gomas de puerta en mal estado, sin bandeja de hielo',
   90, true, true,
   NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day', NULL,
   25000, 8000, 33000,
   'tok-ot-002', 'cli-002', 'equ-002', 'loc-santiago-centro', 'usr-carlos', 'usr-recepcion',
   NOW() - INTERVAL '7 days', NOW()),

  -- OT 3: Recién ingresada
  ('ot-003', 3, 'RECIBIDO',
   'Horno no calienta, luz interior no enciende',
   NULL, NULL,
   'Perilla del selector rota, puerta cierra bien',
   30, false, NULL,
   NOW(), NOW() + INTERVAL '5 days', NULL,
   0, 0, 0,
   'tok-ot-003', 'cli-003', 'equ-003', 'loc-santiago-centro', NULL, 'usr-recepcion',
   NOW(), NOW()),

  -- OT 4: En diagnóstico (Maipú)
  ('ot-004', 1, 'EN_DIAGNOSTICO',
   'Lavadora llena de agua pero no lava, no avanza el programa',
   'Revisando tarjeta de control y motor',
   NULL,
   'Sin daños externos visibles',
   30, true, NULL,
   NOW() - INTERVAL '1 day', NOW() + INTERVAL '4 days', NULL,
   0, 0, 0,
   'tok-ot-004', 'cli-004', 'equ-004', 'loc-maipu', 'usr-pedro', 'usr-pedro',
   NOW() - INTERVAL '1 day', NOW()),

  -- OT 5: Entregada (histórico)
  ('ot-005', 4, 'ENTREGADO',
   'No desagua, queda agua al final del ciclo',
   'Filtro de bomba obstruido con objetos extraños',
   'Limpieza de filtro y bomba de desagüe. Se probó 3 ciclos completos.',
   'Pequeño golpe en lateral derecho',
   30, false, NULL,
   NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days',
   12000, 0, 12000,
   'tok-ot-005', 'cli-001', 'equ-005', 'loc-santiago-centro', 'usr-carlos', 'usr-recepcion',
   NOW() - INTERVAL '15 days', NOW() - INTERVAL '9 days')

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- ITEMS DE OT (presupuesto detallado)
-- ─────────────────────────────────────────────
INSERT INTO items_ot (id, descripcion, cantidad, "precioUnitario", subtotal, tipo, "ordenId", "repuestoId", "creadoEn")
VALUES
  -- OT 1
  ('item-ot1-1', 'Mano de obra diagnóstico y reparación', 1, 15000, 15000, 'MANO_OBRA', 'ot-001', NULL,      NOW()),
  ('item-ot1-2', 'Correa secadora universal',             1, 10000, 10000, 'REPUESTO',  'ot-001', 'rep-002', NOW()),
  -- OT 2
  ('item-ot2-1', 'Mano de obra diagnóstico y reparación', 1, 25000, 25000, 'MANO_OBRA', 'ot-002', NULL,      NOW()),
  ('item-ot2-2', 'Relé térmico compresor',                1, 8000,  8000,  'REPUESTO',  'ot-002', NULL,      NOW()),
  -- OT 5
  ('item-ot5-1', 'Mano de obra limpieza bomba y filtro',  1, 12000, 12000, 'MANO_OBRA', 'ot-005', NULL,      NOW())
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- HISTORIAL DE ESTADOS
-- ─────────────────────────────────────────────
INSERT INTO historial_ot (id, "estadoAnterior", "estadoNuevo", nota, "esVisibleCliente", "ordenId", "usuarioId", "creadoEn")
VALUES
  -- OT 1
  ('hist-ot1-1', NULL,             'RECIBIDO',       'Equipo ingresado en recepción',                      true,  'ot-001', 'usr-recepcion', NOW() - INTERVAL '3 days'),
  ('hist-ot1-2', 'RECIBIDO',       'EN_DIAGNOSTICO', 'Asignado a Carlos para diagnóstico',                 false, 'ot-001', 'usr-admin',     NOW() - INTERVAL '2 days'),
  ('hist-ot1-3', 'EN_DIAGNOSTICO', 'EN_REPARACION',  'Diagnóstico completado, iniciando reparación',       true,  'ot-001', 'usr-carlos',    NOW() - INTERVAL '1 day'),
  -- OT 2
  ('hist-ot2-1', NULL,             'RECIBIDO',       'Equipo ingresado en recepción',                      true,  'ot-002', 'usr-recepcion', NOW() - INTERVAL '7 days'),
  ('hist-ot2-2', 'RECIBIDO',       'EN_DIAGNOSTICO', 'Asignado a Carlos',                                  false, 'ot-002', 'usr-admin',     NOW() - INTERVAL '6 days'),
  ('hist-ot2-3', 'EN_DIAGNOSTICO', 'EN_REPARACION',  'Presupuesto enviado al cliente, esperando aprobación', true, 'ot-002', 'usr-carlos',   NOW() - INTERVAL '5 days'),
  ('hist-ot2-4', 'EN_REPARACION',  'LISTO_RETIRO',   'Reparación completada, equipo listo para retiro',    true,  'ot-002', 'usr-carlos',    NOW() - INTERVAL '1 day'),
  -- OT 3
  ('hist-ot3-1', NULL,             'RECIBIDO',       'Equipo ingresado en recepción',                      true,  'ot-003', 'usr-recepcion', NOW()),
  -- OT 4
  ('hist-ot4-1', NULL,             'RECIBIDO',       'Equipo ingresado',                                   true,  'ot-004', 'usr-pedro',     NOW() - INTERVAL '1 day'),
  ('hist-ot4-2', 'RECIBIDO',       'EN_DIAGNOSTICO', 'Pedro inicia diagnóstico',                           false, 'ot-004', 'usr-pedro',     NOW()),
  -- OT 5
  ('hist-ot5-1', NULL,             'RECIBIDO',       'Equipo ingresado en recepción',                      true,  'ot-005', 'usr-recepcion', NOW() - INTERVAL '15 days'),
  ('hist-ot5-2', 'RECIBIDO',       'EN_DIAGNOSTICO', 'Asignado a Carlos',                                  false, 'ot-005', 'usr-admin',     NOW() - INTERVAL '14 days'),
  ('hist-ot5-3', 'EN_DIAGNOSTICO', 'EN_REPARACION',  'Falla identificada, limpieza en proceso',            true,  'ot-005', 'usr-carlos',    NOW() - INTERVAL '13 days'),
  ('hist-ot5-4', 'EN_REPARACION',  'LISTO_RETIRO',   'Reparación completada',                              true,  'ot-005', 'usr-carlos',    NOW() - INTERVAL '11 days'),
  ('hist-ot5-5', 'LISTO_RETIRO',   'ENTREGADO',      'Cliente retiró el equipo, firmó conformidad',        true,  'ot-005', 'usr-recepcion', NOW() - INTERVAL '9 days')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- NOTIFICACIONES (Fix 3: canal incluido)
-- ─────────────────────────────────────────────
INSERT INTO notificaciones (id, tipo, canal, asunto, cuerpo, "telefonoDestino", "estadoEnvio", "enviadoEn", "ordenId", "clienteId", "creadoEn")
VALUES
  ('notif-001', 'LISTO_RETIRO',  'LINK_WHATSAPP', NULL,
   'Estimado Juan, su Refrigerador LG GT29WDC está listo para retiro. Valor del servicio: $33.000. Horario: Lunes a Viernes 9:30 a 17:30. Dirección: Av. Libertador Bernardo O''Higgins 1234.',
   '+56976543210', 'ENVIADO', NOW() - INTERVAL '1 day', 'ot-002', 'cli-002', NOW() - INTERVAL '1 day'),

  ('notif-002', 'CAMBIO_ESTADO', 'EMAIL',
   'Su equipo está en reparación — TallerSync OT #1',
   'Estimada María, su Lavadora Samsung WW80J5355MW está siendo reparada. Le avisaremos cuando esté lista.',
   NULL, 'ENVIADO', NOW() - INTERVAL '1 day', 'ot-001', 'cli-001', NOW() - INTERVAL '1 day'),

  ('notif-003', 'LISTO_RETIRO',  'LINK_WHATSAPP', NULL,
   'Estimada María, su Lavadora Samsung está lista para retiro. Valor: $12.000.',
   '+56981234567', 'ENVIADO', NOW() - INTERVAL '11 days', 'ot-005', 'cli-001', NOW() - INTERVAL '11 days')

ON CONFLICT (id) DO NOTHING;
