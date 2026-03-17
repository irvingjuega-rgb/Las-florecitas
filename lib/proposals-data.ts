export interface Proposal {
  id: string
  codigo: string
  titulo: string
  quienPropone: string
  descripcion: string
  equipoMultidisciplinario: string
  factible: string
  prioridad: string
  tipo: string
  proceso: string
  status: string
  fechaInicio: string
  fechaTermino: string
  fechaEntrada?: string
  impactaA: string
  observaciones: string
  visible?: boolean
  situacionActual?: string
  imagen?: string
  formatoA3?: string
}

export function getProposalImageUrl(imageValue?: string) {
  if (!imageValue) return ""
  if (imageValue.startsWith("http://") || imageValue.startsWith("https://") || imageValue.startsWith("/")) {
    return imageValue
  }

  return `/api/imagenes?filename=${encodeURIComponent(imageValue)}`
}

export function getProposalImages(imageValue?: string): string[] {
  if (!imageValue) return []
  return imageValue.split(',').map(img => img.trim()).filter(Boolean).map(getProposalImageUrl)
}

export const PROPOSAL_STATUSES = [
  "Pendiente",
  "Iniciada",
  "Avanzada",
  "Terminada"
]

export const proposals: Proposal[] = [
  {
    id: "1",
    codigo: "MC-001",
    titulo: "Plataforma para visualizacion de ordenes de compra de Destiny",
    quienPropone: "Godofredo Quesada",
    descripcion: "Desarrollo de una plataforma mediante IA para el seguimiento de ordenes de compra del cliente Destiny.",
    equipoMultidisciplinario: "Ventas, TI, Mejora Continua",
    factible: "SI",
    prioridad: "1",
    tipo: "Proyecto",
    proceso: "Ventas",
    status: "Avanzada",
    fechaInicio: "1/15/2026",
    fechaTermino: "",
    impactaA: "Objetivos del SGI",
    observaciones: ""
  },
  {
    id: "2",
    codigo: "MC-002",
    titulo: "Desarrollo de personal operativo para bolseo",
    quienPropone: "Fernando Escamilla",
    descripcion: "Matriz de aprendizajes para el proceso de bolseo, capacitacion de personal, seguimiento a nivel de capacidad de operadores.",
    equipoMultidisciplinario: "Bolseo, TI, THU",
    factible: "SI",
    prioridad: "1",
    tipo: "Proyecto",
    proceso: "Bolseo",
    status: "Iniciada",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Operaciones",
    observaciones: ""
  },
  {
    id: "3",
    codigo: "MC-003",
    titulo: "Mejora en empacado de bolsas pouch",
    quienPropone: "Blanca Munoz",
    descripcion: "Cambiar la forma de empacado de bolsas pouch agregando elementos extra en la caja para evitar arrugas y dobleces en las bolsas.",
    equipoMultidisciplinario: "Pouch",
    factible: "",
    prioridad: "",
    tipo: "Sencillo",
    proceso: "Pouch",
    status: "Pendiente",
    fechaInicio: "2/16/2026",
    fechaTermino: "",
    impactaA: "Calidad (productos)",
    observaciones: ""
  },
  {
    id: "4",
    codigo: "MC-004",
    titulo: "Herramental para microperforaciones laser en pouch",
    quienPropone: "Blanca Munoz, Iririana Martinez",
    descripcion: "Implementar un nuevo herramental de microperforaciones en maquina pouch.",
    equipoMultidisciplinario: "Pouch, Ingenieria",
    factible: "Revisar costo",
    prioridad: "",
    tipo: "Proyecto",
    proceso: "Pouch",
    status: "Pendiente",
    fechaInicio: "2/16/2026",
    fechaTermino: "",
    impactaA: "Operaciones",
    observaciones: ""
  },
  {
    id: "5",
    codigo: "MC-005",
    titulo: "Induccion con herramientas audiovisuales y lenguaje sencillo",
    quienPropone: "Karina Anguiano",
    descripcion: "La mejora consiste en la produccion de capsulas audiovisuales realizadas utilizando recursos internos y herramientas tecnologicas accesibles, lo que permite optimizar significativamente los costos de desarrollo.",
    equipoMultidisciplinario: "Comunicacion, THU",
    factible: "SI",
    prioridad: "",
    tipo: "Proyecto",
    proceso: "Comunicacion e induccion al proceso",
    status: "Avanzada",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Personas",
    observaciones: ""
  },
  {
    id: "6",
    codigo: "MC-006",
    titulo: "Marimbas de color en maquinas impresoras",
    quienPropone: "Sebastian Delgado, Rene Rodriguez",
    descripcion: "Implementacion de marimbas de color en las maquinas impresoras para visualizar de manera rapida y eficiente cualquier variacion de color en la corrida del producto.",
    equipoMultidisciplinario: "Impresion",
    factible: "SI",
    prioridad: "",
    tipo: "Sencillo",
    proceso: "Impresion",
    status: "Terminada",
    fechaInicio: "12/22/2025",
    fechaTermino: "",
    impactaA: "Calidad (productos)",
    observaciones: "Revisar con nadia que no sea accion correctiva"
  },
  {
    id: "7",
    codigo: "MC-007",
    titulo: "Sistema de mantenimiento preventivo para comedores",
    quienPropone: "Genova Gutierrez",
    descripcion: "Implementar un Sistema Preventivo Estructurado que permita calendarizar mantenimientos preventivos anuales.",
    equipoMultidisciplinario: "Comedores",
    factible: "",
    prioridad: "",
    tipo: "",
    proceso: "Comedores",
    status: "Pendiente",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "",
    observaciones: "Matriz de mantenimiento preventivo para comedores, junta con mantenimiento para seguimiento"
  },
  {
    id: "8",
    codigo: "MC-008",
    titulo: "Lista de registro sobre caracteristicas tecnicas de maquinas de bolseo",
    quienPropone: "Fernando Escamilla, Edgar Lupercio",
    descripcion: "Lista maestra para analizar los registros de produccion del proceso de Bolseo y las especificaciones tecnicas de la maquinaria con el objetivo de estandarizar los productos.",
    equipoMultidisciplinario: "Bolseo, Programacion, Ventas",
    factible: "",
    prioridad: "",
    tipo: "Sencillo",
    proceso: "Bolseo",
    status: "Pendiente",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Operaciones",
    observaciones: "Todos los productos? o solo los mas especificos?"
  },
  {
    id: "9",
    codigo: "MC-009",
    titulo: "Estaciones de limpieza en cada proceso",
    quienPropone: "Fernando Escamilla",
    descripcion: "Facilitar la localizacion y poner al alcance del equipo productivo los articulos de limpieza necesarios para realizar las actividades de esta indole con estaciones especiales de limpieza.",
    equipoMultidisciplinario: "Todo produccion",
    factible: "Revisar costo",
    prioridad: "",
    tipo: "Sencillo",
    proceso: "Bolseo",
    status: "Iniciada",
    fechaInicio: "9/1/2025",
    fechaTermino: "",
    impactaA: "Objetivos del SGI",
    observaciones: ""
  },
  {
    id: "10",
    codigo: "MC-010",
    titulo: "Indicadores de desempeno en bolseo",
    quienPropone: "Fernando Escamilla",
    descripcion: "Implementacion de indicadores de desempeno en el proceso de bolseo con incentivos al mejor equipo de manera mensual.",
    equipoMultidisciplinario: "Bolseo",
    factible: "Revisar costo, presupuesto",
    prioridad: "",
    tipo: "Sencillo",
    proceso: "Bolseo",
    status: "Avanzada",
    fechaInicio: "5/1/2025",
    fechaTermino: "",
    impactaA: "Operaciones",
    observaciones: "Quien pagaba los incentivos? es factible seguir haciendolo?"
  },
  {
    id: "11",
    codigo: "MC-011",
    titulo: "Manual digital con lenguaje sencillo y visual sobre las maquinas de bolseo",
    quienPropone: "Fernando Escamilla",
    descripcion: "Generar un MANUAL o CATALOGO de partes de maquina en un lenguaje sencillo (visual), y que sea accesible para su rapida asimilacion por parte del personal.",
    equipoMultidisciplinario: "Bolseo, TI",
    factible: "SI",
    prioridad: "",
    tipo: "Proyecto",
    proceso: "Bolseo",
    status: "Iniciada",
    fechaInicio: "1/4/2026",
    fechaTermino: "",
    impactaA: "Operaciones",
    observaciones: ""
  },
  {
    id: "12",
    codigo: "MC-012",
    titulo: "Visualizacion de requisitos de Destiny y ficha tecnica en BFX Advanced",
    quienPropone: "Michel Diaz",
    descripcion: "Incorporar un apartado en BFX Advanced para documentar los requisitos del cliente final Destiny y vincularlo al flujo de validacion tecnica actual y a la especificacion del producto, teniendo filtros por pedidos, visualizacion dividida en pantalla.",
    equipoMultidisciplinario: "Ingenieria, TI",
    factible: "",
    prioridad: "",
    tipo: "Sencillo",
    proceso: "Ingenieria-produccion",
    status: "Avanzada",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Objetivos del SGI",
    observaciones: ""
  },
  {
    id: "13",
    codigo: "MC-013",
    titulo: "Registro de informacion clave de cada producto para visualizacion entre areas",
    quienPropone: "Luis Segura",
    descripcion: "Implementar una plataforma o modulo ligado al sistema actual que concentre la informacion clave de cada producto, incluyendo estatus, prioridades, responsables permitiendo una visualizacion clara y compartida entre las areas involucradas.",
    equipoMultidisciplinario: "Ingenieria, TI, Programacion, Diseno, Placas",
    factible: "",
    prioridad: "",
    tipo: "Proyecto",
    proceso: "Ingenieria, TI, Programacion, Diseno, Placas",
    status: "Pendiente",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Operaciones",
    observaciones: "APQP?"
  },
  {
    id: "14",
    codigo: "MC-014",
    titulo: "Aplicacion digital con especificaciones tecnicas de maquinaria en planta",
    quienPropone: "Mario THU",
    descripcion: "Desarrollar e implementar una solucion digital integral en AppSheet que permita gestionar de manera eficiente y trazable las caracteristicas tecnicas y parametros operativos de la maquinaria en Bioflex.",
    equipoMultidisciplinario: "Talento Humano",
    factible: "",
    prioridad: "",
    tipo: "Sencillo",
    proceso: "Talento Humano, capacitacion operativa",
    status: "Pendiente",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Personas",
    observaciones: "Es muy tecnico, se implementaria en las tablets de cada proceso."
  },
  {
    id: "15",
    codigo: "MC-015",
    titulo: "Recuperacion de pellets tirados en el suelo",
    quienPropone: "Daniel Trevino",
    descripcion: "Recuperar maquina vibradora que se tenia en la anterior area de compuestos y habilitarla para hacer una separacion tipo tamizado, separando particulas y polvo de los pellets buenos.",
    equipoMultidisciplinario: "Extrusion, Molinos",
    factible: "",
    prioridad: "",
    tipo: "Proyecto",
    proceso: "Extrusion",
    status: "Pendiente",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Operaciones",
    observaciones: ""
  },
  {
    id: "16",
    codigo: "MC-016",
    titulo: "Sacos para las cajas de extrusion",
    quienPropone: "Daniel Trevino",
    descripcion: "Conseguir supersacos a la medida del interior de la caja y usar esto en vez de plastico para evitar derrames del material.",
    equipoMultidisciplinario: "Extrusion, Compras",
    factible: "",
    prioridad: "",
    tipo: "Sencillo",
    proceso: "Extrusion",
    status: "Pendiente",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Operaciones",
    observaciones: ""
  },
  {
    id: "17",
    codigo: "MC-017",
    titulo: "Cuarto especial para equipo de laboratorio",
    quienPropone: "Daniel Trevino",
    descripcion: "Fabricar un cuarto en area de extrusion con ambiente controlado para tener los equipos adecuados en piso (medidor universal, medidor de opacidad, estatica, etc).",
    equipoMultidisciplinario: "Extrusion, Compras",
    factible: "",
    prioridad: "",
    tipo: "Proyecto",
    proceso: "Extrusion",
    status: "Pendiente",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Operaciones",
    observaciones: ""
  },
  {
    id: "18",
    codigo: "MC-018",
    titulo: "Sistema electronico de verificacion para calidad comercial",
    quienPropone: "Oliver Guizar",
    descripcion: "Desarrollar una herramienta electronica que permita a los Validadores de Calidad Comercial que realicen, a traves de una tablet, el uso de informacion que ya se encuentra en alguna base de datos y que ahi mismo se puedan registrar los hallazgos de las validaciones de los distintos productos.",
    equipoMultidisciplinario: "Calidad comercial, TI",
    factible: "",
    prioridad: "",
    tipo: "Proyecto",
    proceso: "Calidad comercial",
    status: "Pendiente",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Calidad (productos)",
    observaciones: ""
  },
  {
    id: "19",
    codigo: "MC-019",
    titulo: "Bot automatizado en WhatsApp para soporte tecnico",
    quienPropone: "Luis Eduardo Espinosa",
    descripcion: "Desarrollar un bot automatizado en WhatsApp para la modernizacion del sistema de tickets actual, con el objetivo de optimizar tiempos de atencion, simplificar la interaccion del usuario y fortalecer la trazabilidad completa de las incidencias.",
    equipoMultidisciplinario: "TI",
    factible: "SI",
    prioridad: "",
    tipo: "Proyecto",
    proceso: "TI",
    status: "Pendiente",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Personas",
    observaciones: ""
  },
  {
    id: "20",
    codigo: "MC-020",
    titulo: "Hojas de color enmicadas para tarimas validadas por calidad comercial",
    quienPropone: "Oliver Guizar",
    descripcion: "Implementacion de hojas de color enmicadas para la visualizacion de tarimas aceptadas, rechazadas o con hallazgos, con el proposito de disminuir el consumo de hojas de papel y escribir en las hojas ya enmicadas.",
    equipoMultidisciplinario: "Calidad comercial",
    factible: "SI",
    prioridad: "",
    tipo: "Sencillo",
    proceso: "Calidad comercial",
    status: "Pendiente",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Operaciones",
    observaciones: ""
  },
  {
    id: "21",
    codigo: "MC-021",
    titulo: "Identificacion de MP por colores de acuerdo al mes de produccion",
    quienPropone: "Almacen de MP (Veronica Mtz)",
    descripcion: "Identificacion de las bobinas por mes de produccion, mediante colores que se distingan, colocar una tabla de colores como ayuda visual y asi tener mayor control con las primeras entradas, primeras salidas, disminuyendo el rezago de material que podria perder sus propiedades.",
    equipoMultidisciplinario: "Almacen de MP",
    factible: "SI",
    prioridad: "",
    tipo: "Sencillo",
    proceso: "Almacen de MP",
    status: "Avanzada",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Objetivos del SGI",
    observaciones: ""
  },
  {
    id: "22",
    codigo: "MC-022",
    titulo: "Bases porta navaja en bolseo para refilado de bobinas",
    quienPropone: "Edgar Lupercio",
    descripcion: "Instalacion de bases porta navaja, tubo de soplado con deposito para refile, para que las bobinas con excedente se puedan refilar en maquina de bolseo y evitar tiempo de espera en maquina de refilado.",
    equipoMultidisciplinario: "Bolseo, mantenimiento",
    factible: "Revisar costo",
    prioridad: "",
    tipo: "Proyecto",
    proceso: "Bolseo",
    status: "Pendiente",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Operaciones",
    observaciones: ""
  },
  {
    id: "23",
    codigo: "MC-023",
    titulo: "Guias laser para cambiar de tratado completo a seccionado",
    quienPropone: "Iris Segoviano",
    descripcion: "Instalacion de reglas de acero inoxidable y guias laser deslizables para actuar como indicadores para los operadores al momento de cambiar de tratado completo a seccionado.",
    equipoMultidisciplinario: "Extrusion, Compras",
    factible: "Revisar costo",
    prioridad: "",
    tipo: "Proyecto",
    proceso: "Extrusion",
    status: "Pendiente",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Operaciones",
    observaciones: ""
  },
  {
    id: "24",
    codigo: "MC-024",
    titulo: "Modelo matematico en SisPro para conversion y estandarizacion de medidas en bobinas",
    quienPropone: "Luis Segura",
    descripcion: "Desarrollar un modelo matematico e integrarlo en SisPro para la conversion de peso, diametro, metros lineales y piezas en bobinas de empaque flexible para reducir la desviacion entre el calculo teorico y el comportamiento real del proceso.",
    equipoMultidisciplinario: "Ingenieria, TI",
    factible: "SI",
    prioridad: "",
    tipo: "Proyecto",
    proceso: "Todo produccion",
    status: "Iniciada",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Operaciones",
    observaciones: ""
  },
  {
    id: "25",
    codigo: "MC-025",
    titulo: "Cartones estandarizados en color blanco para cliente Destiny",
    quienPropone: "Michel Diaz",
    descripcion: "Se disenaran e implementaran cartones estandarizados en color blanco, cada uno con perforaciones universales en forma de cruz, incorporando de 3 a 5 cruces por carton para cubrir las diferentes medidas de wicket requeridas en operacion.",
    equipoMultidisciplinario: "Ingenieria, Compras",
    factible: "SI",
    prioridad: "",
    tipo: "Proyecto",
    proceso: "Bolseo, empaque",
    status: "Pendiente",
    fechaInicio: "",
    fechaTermino: "",
    impactaA: "Objetivos del SGI",
    observaciones: ""
  }
]

export const ratingCriteria = [
  { id: "usoIA", label: "Uso de IA y Tecnologia", weight: 0.35 },
  { id: "impactoCliente", label: "Impacto en Satisfaccion al Cliente", weight: 0.25 },
  { id: "escalabilidad", label: "Escalabilidad", weight: 0.15 },
  { id: "facilidadImplementacion", label: "Facilidad de Implementacion", weight: 0.15 },
  { id: "costoBeneficio", label: "Costo-Beneficio", weight: 0.10 },
]

export interface Rating {
  proposalId: string
  costoBeneficio: number
  usoIA: number
  impactoCliente: number
  facilidadImplementacion: number
  escalabilidad: number
  totalScore: number
}

export function calculateTotalScore(ratings: Omit<Rating, 'proposalId' | 'totalScore'>): number {
  return (
    ratings.usoIA * 0.35 +
    ratings.impactoCliente * 0.25 +
    ratings.escalabilidad * 0.15 +
    ratings.facilidadImplementacion * 0.15 +
    ratings.costoBeneficio * 0.10

  )
}
