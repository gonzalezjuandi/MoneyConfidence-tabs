export interface SabadellFaqItem {
  question: string;
  /** Párrafos o viñetas mostrados al expandir */
  answerParagraphs: string[];
}

export const PRESTAMO_SABADELL_ONBOARDING_FAQS: SabadellFaqItem[] = [
  {
    question: '¿Qué requisitos debes cumplir para poder solicitar el Préstamo Sabadell?',
    answerParagraphs: [
      'Ser mayor de edad.',
      'Ser cliente de Banco Sabadell desde hace más de 6 meses.',
      'Tener residencia en España.',
      'Tener acceso a la banca a distancia de Banco Sabadell.',
      'Tener un correo electrónico y un teléfono móvil actualizados en el banco.'
    ]
  },
  {
    question: '¿Cómo puedo solicitar un Préstamo Sabadell?',
    answerParagraphs: [
      'Puedes iniciar la solicitud desde esta app: simula tu cuota, completa tus datos y, si continúas, te indicaremos la documentación necesaria para el estudio de tu operación.'
    ]
  },
  {
    question: '¿Cómo sabré si me han concedido el Préstamo Sabadell?',
    answerParagraphs: [
      'Una vez validada la documentación y completado el estudio, recibirás la resolución por los canales que tengas habilitados con el banco (notificación en la app, correo, etc.).'
    ]
  },
  {
    question: '¿Cómo puedo saber el tipo de interés de mi préstamo?',
    answerParagraphs: [
      'El tipo de interés y la TAE resultantes forman parte de la oferta personalizada que recibirás tras completar tus datos y el análisis correspondiente.'
    ]
  },
  {
    question: '¿Cuáles son las características principales del Préstamo Sabadell?',
    answerParagraphs: [
      'Es un préstamo personal con solicitud online: puedes simular la cuota, aportar tus datos para obtener una oferta y, si la aceptas, aportar la documentación para su validación antes de la firma.'
    ]
  },
  {
    question: '¿Qué plazos de devolución están disponibles?',
    answerParagraphs: [
      'Los plazos disponibles dependen del importe y de tu perfil; podrás revisarlos en la simulación y en el detalle de la oferta antes de continuar.'
    ]
  }
];
