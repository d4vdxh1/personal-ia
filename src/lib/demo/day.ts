// Datos ficticios de presentación. Sin acceso a Supabase ni persistencia.
export const demoHabits = [
  { id: "water", name: "Tomar agua", detail: "Una pausa para vos", done: true },
  {
    id: "read",
    name: "Leer un rato",
    detail: "Unas páginas también cuentan",
    done: true,
  },
  {
    id: "plan",
    name: "Organizar el día",
    detail: "Elegir lo importante",
    done: true,
  },
  {
    id: "study",
    name: "Repasar un tema",
    detail: "Un paso a la vez",
    done: false,
  },
  {
    id: "note",
    name: "Escribir una nota",
    detail: "Algo que quieras recordar",
    done: false,
  },
];
export const demoAgenda = [
  {
    time: "17:30",
    title: "Pausa en casa",
    detail: "Preparar lo necesario para salir",
    tag: "Personal",
  },
  {
    time: "18:00",
    title: "Salir hacia clase",
    detail: "Dejar un margen para el viaje",
    tag: "Agenda",
  },
  {
    time: "18:30",
    title: "Clase de ejemplo",
    detail: "Llevar apuntes y material",
    tag: "Estudio",
  },
  {
    time: "22:30",
    title: "Cerrar el día",
    detail: "Una nota breve antes de descansar",
    tag: "Personal",
  },
];
