export interface FaqItem {
  question: string;
  answer: string;
}

export const PRESTAMO_FAQS: FaqItem[] = [
  {
    question: '¿Qué es un Préstamo Preconcedido?',
    answer: 'Es un préstamo personal que el banco te ofrece con una cantidad y condiciones ya aprobadas según tu perfil. Puedes contratarlo online en pocos minutos, sin necesidad de adjuntar documentación adicional, y recibir el dinero en tu cuenta en menos de 24 horas.'
  },
  {
    question: '¿Qué características tiene el Préstamo Preconcedido Online?',
    answer: 'El préstamo preconcedido online permite solicitar hasta 45.000 € con varios plazos de amortización (entre 30 y 96 meses). El proceso es 100 % digital: personalizas la cuota, revisas los detalles, firmas el contrato electrónicamente y el importe se ingresa en la cuenta que elijas.'
  },
  {
    question: '¿Qué ocurre si solicito un importe que supera el límite de contratación preconcedido?',
    answer: 'Si solicitas un importe superior al preconcedido, la solicitud se evaluará como una nueva operación. En ese caso, el banco podría pedir documentación complementaria y el plazo de resolución puede ser mayor. Te recomendamos no superar el límite indicado para mantener la agilidad del proceso.'
  },
  {
    question: '¿Cuál es el plazo de reembolso para un Préstamo Preconcedido?',
    answer: 'Puedes elegir el plazo de reembolso según tu conveniencia. Los plazos disponibles suelen ir desde 30 meses hasta 96 meses (8 años), en función del importe y de tu perfil. A mayor plazo, la cuota mensual es menor, pero el total de intereses será mayor.'
  },
  {
    question: '¿Qué ocurre si me retraso en el pago de mi Préstamo Preconcedido Online?',
    answer: 'En caso de retraso en el pago, se aplicarán los intereses de demora y, si el impago se prolonga, se podrían iniciar las actuaciones previstas en el contrato. Te recomendamos contactar con el banco ante cualquier dificultad para valorar opciones de refinanciación o modificación de cuotas.'
  }
];

export const SEGURO_FAQS: FaqItem[] = [
  {
    question: '¿Qué es la Garantía de Fallecimiento?',
    answer: 'La aseguradora garantiza el pago del capital asegurado en caso de fallecimiento del asegurado por cualquier causa, al beneficiario designado en la póliza. Garantiza el pago del capital asegurado en caso de fallecimiento por cualquier causa.'
  },
  {
    question: '¿Qué es la Incapacidad permanente absoluta?',
    answer: 'Se entenderá por incapacidad permanente absoluta aquella situación física o psíquica, e irreversible del asegurado, a consecuencia de accidente o enfermedad, que le haya producido una total y permanente inhabilitación para el desempeño de cualquier servicio retribuido por cuenta ajena o actividad profesional autónoma. Es la situación física/psíquica irreversible, que inhabilita a una persona para cualquier trabajo retribuido.'
  },
  {
    question: '¿Existe algún tipo de restricciones en las coberturas de fallecimiento o invalidez permanente absoluta?',
    answer: 'En las Condiciones Generales y Especiales están detalladas las exclusiones de ambas garantías. A título de ejemplo queda excluido: el suicidio y sus consecuencias; los siniestros derivados de la práctica de cualquier deporte con carácter profesional; las consecuencias de cualquier trastorno mental psicológico; etc. En las Condiciones Generales y Especiales están detalladas las exclusiones del seguro.'
  },
  {
    question: '¿Quién cobra el seguro de vida?',
    answer: 'Los beneficiarios designados en el Certificado individual del seguro.'
  },
  {
    question: '¿Puedo cambiar el beneficiario designado?',
    answer: 'El tomador del seguro podrá designar beneficiario de las coberturas de fallecimiento o incapacidad permanente absoluta o modificar la designación anteriormente realizada, sin necesidad de consentimiento de la entidad aseguradora. La designación de beneficiario podrá hacerse en el alta de la póliza, y en una posterior declaración escrita comunicada a la entidad aseguradora o en testamento. Sí, es posible modificarlo en cualquier momento posterior al alta.'
  },
  {
    question: '¿Cómo se percibe la prestación y cuál será su fiscalidad?',
    answer: 'Si la prestación se abona a Banco Sabadell por la deuda pendiente: La prestación de fallecimiento no está sujeta a tributación en el ISD de los herederos. La prestación de incapacidad permanente absoluta estará sujeta a tributación en el IRPF del asegurado y el pago no está sujeto a retención a cuenta en IRPF. Si la prestación se abona al asegurado o al beneficiario designado por la diferencia, en caso de existir, entre el capital asegurado y el importe de la deuda pendiente: La prestación de fallecimiento estará sujeta a tributación en el ISD del beneficiario. La prestación de incapacidad permanente absoluta estará sujeta a tributación en el IRPF del asegurado y el pago está sujeto a retención a cuenta en IRPF. La tributación de las prestaciones estará sujeta, en todo caso, a la normativa tributaria vigente y a los criterios interpretativos de la Administración Tributaria u otros organismos que pudieran resultarles de aplicación. La prestación la recibe el beneficiario mediante transferencia bancaria, y está sujeta a la normativa tributaria vigente.'
  },
  {
    question: '¿Puedo cancelar este seguro asociado al préstamo en algún momento?',
    answer: 'El Tomador puede oponerse a la prórroga anual del contrato mediante una notificación escrita a la Aseguradora, efectuada en un plazo mínimo de 1 mes de antelación a la conclusión de la anualidad. Sí es posible cancelarlo en las posteriores renovaciones anuales, solicitándolo con un plazo mínimo de 1 mes de antelación.'
  },
  {
    question: '¿El capital asegurado se ajusta cada año?',
    answer: 'El capital asegurado es constante y no se actualiza anualmente. No obstante, el cliente puede anualmente solicitar la adaptación del capital asegurado a la deuda viva. No se ajusta anualmente. Pero el tomador puede solicitar anualmente modificaciones en el capital asegurado.'
  },
  {
    question: '¿Cuál es el proceso de reclamación del pago de la prestación en caso de fallecimiento o incapacidad permanente absoluta?',
    answer: 'En caso de la ocurrencia del riesgo previsto en el certificado individual de seguro, el tomador, asegurado o beneficiario deberá comunicar al asegurador el acaecimiento del siniestro dentro del plazo máximo de siete días de haberlo conocido. Las comunicaciones entre el asegurador, el tomador del seguro y el asegurado, se realizarán en el domicilio de los mismos que conste en el contrato de seguro. Las comunicaciones se realizarán en el domicilio de la aseguradora que conste en el contrato.'
  },
  {
    question: '¿Es obligatorio tener un seguro de vida para solicitar un préstamo?',
    answer: 'El préstamo y sus condiciones se ofrecen independientemente de los productos de seguros, no requiriéndose su contratación para la concesión del préstamo u obtener sus condiciones. No se requiere su contratación para la concesión del préstamo.'
  },
  {
    question: '¿Puedo contratar un seguro de vida sabiendo que sufro una enfermedad degenerativa?',
    answer: 'Para contratar el seguro es imprescindible que el asegurado responda a la declaración de salud definida por la aseguradora y lo firme. A partir de las respuestas de este cuestionario y, si es necesario, de la información médica correspondiente, BanSabadell Vida hará la evaluación del riesgo del seguro y decidirá si acepta la contratación y los términos de la misma, pudiendo determinarse alguna exclusión o limitación de cobertura y/o un recargo sobre la prima del seguro. Deberá informarse de cualquier patología en la declaración de salud, y la aseguradora decidirá si acepta la contratación.'
  }
];
