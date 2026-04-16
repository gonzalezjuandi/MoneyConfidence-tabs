import {
  Component,
  EventEmitter,
  Output,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  HostListener,
  ViewChild,
  ElementRef
} from '@angular/core';
import { PRESTAMO_SABADELL_ONBOARDING_FAQS } from '../../constants/prestamo-sabadell-faq';
import {
  PRESTAMO_SABADELL_FINALIDADES,
  PRESTAMO_SABADELL_COTITULARES_DEMO,
  FinalidadOption
} from '../../constants/prestamo-sabadell-simulacion';
import {
  SABADELL_LABORAL_SITUACIONES,
  SABADELL_LABORAL_PROFESIONES,
  SABADELL_LABORAL_ACTIVIDADES
} from '../../constants/prestamo-sabadell-laborales';
import { SABADELL_ESTADO_CIVIL } from '../../constants/prestamo-sabadell-familiares';
import { SABADELL_VIVIENDA_SITUACIONES } from '../../constants/prestamo-sabadell-vivienda';
import {
  getDatosInterstitialSlideForPhase,
  SabadellDatosInterstitialSlide
} from '../../constants/prestamo-sabadell-datos-interstitial';

declare var lucide: any;

export interface SabadellSimulacionPaso1Payload {
  finalidad: string;
  precioBien: number;
  prestamoCompartido: boolean;
  /** Solo si préstamo compartido */
  cotitularId?: string | null;
}

/** Tras el simulador (importe, plazo, cuota); amplía el paso 1 de simulación */
export interface SabadellSimulacionSimuladorPayload extends SabadellSimulacionPaso1Payload {
  importePrestamo: number;
  plazoMeses: number;
  cuotaMensual: number;
  tinAnual: number;
  taeAnual: number;
}

@Component({
  selector: 'app-prestamo-sabadell-flow',
  templateUrl: './prestamo-sabadell-flow.component.html',
  styleUrls: ['./prestamo-sabadell-flow.component.scss']
})
export class PrestamoSabadellFlowComponent implements AfterViewInit, OnDestroy {
  constructor(private cdr: ChangeDetectorRef) {}

  @ViewChild('docScroll') docScroll?: ElementRef<HTMLElement>;

  /** Tras «Continuar» en simulador: spinner de carga → documento previo obligatorio */
  documentFlowPhase: null | 'spinner' | 'document' = null;
  /** El usuario ha llegado al final del documento (o el contenido cabe sin scroll) */
  documentReadComplete = false;

  private docSpinnerTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly docSpinnerDurationMs = 1600;

  /** Tras «Aceptar» documento: spinner previo a «Datos laborales» */
  postAceptarDocPhase: null | 'accelerator' = null;
  private acceleratorTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly postAceptarAcceleratorMs = 4500;

  /**
   * Intersticial con spinner **entre** pantallas de datos (un solo mensaje por salto, pocos segundos).
   */
  datosStepInterstitialActive = false;
  private datosInterstitialPendingTarget: {
    phase: 'datos-familiares' | 'datos-vivienda' | 'datos-economicos';
    step: number;
  } | null = null;
  private datosInterstitialFinishTimeoutId: ReturnType<typeof setTimeout> | null = null;
  /** Duración del intersticial antes de mostrar la siguiente pantalla */
  private readonly datosInterstitialDurationMs = 2400;

  /** Tras ver la oferta estimada: mensaje que invita a continuar (aparece con retardo) */
  showSimuladorOfertaHint = false;
  private simuladorOfertaHintTimerId: ReturnType<typeof setTimeout> | null = null;
  private readonly simuladorOfertaHintDelayMs = 2800;

  @Output() close = new EventEmitter<void>();
  /** Cuando el usuario completa el paso 1 de simulación (5 pasos totales en el asistente) */
  @Output() personalizarSimulacion = new EventEmitter<SabadellSimulacionPaso1Payload>();
  /** Tras «Continuar» en el simulador (importe / plazo / cuota) */
  @Output() continuarSimulador = new EventEmitter<SabadellSimulacionSimuladorPayload>();

  /** 0 = onboarding, 1 = simulación paso 1 de 5 */
  step: 0 | 1 = 0;

  /**
   * Subpaso: formulario inicial → simulador → datos laborales / familiares tras documento.
   */
  simulationPhase:
    | 'datos'
    | 'simulador'
    | 'datos-laborales'
    | 'datos-familiares'
    | 'datos-vivienda'
    | 'datos-economicos' = 'datos';

  readonly simulationTotalSteps = 5;
  /** Paso global del asistente (1–5): barra de progreso y «Paso X de 5» */
  simulationAssistantStep = 1;

  readonly laboralSituaciones = SABADELL_LABORAL_SITUACIONES;
  readonly laboralProfesiones = SABADELL_LABORAL_PROFESIONES;
  readonly laboralActividades = SABADELL_LABORAL_ACTIVIDADES;
  readonly familiarEstadosCiviles = SABADELL_ESTADO_CIVIL;
  readonly viviendaSituaciones = SABADELL_VIVIENDA_SITUACIONES;

  laboralSituacion = '';
  laboralProfesion = '';
  laboralActividad = '';
  /** Años en la empresa (número entero ≥ 0) */
  laboralAniosEmpresa = '';
  laboralProfesionQuery = '';
  laboralDropdownOpen: null | 'situacion' | 'profesion' | 'actividad' = null;

  familiarEstadoCivil = '';
  familiarMiembrosUnidad = '';
  familiarDropdownOpen: null | 'estadoCivil' = null;

  viviendaSituacion = '';
  /** Código postal (España): 5 dígitos */
  viviendaCodigoPostal = '';
  viviendaDropdownOpen: null | 'situacion' = null;

  /** Simulador: importe y plazo */
  simAmount = 10000;
  simTermMonths = 96;
  readonly simMinAmount = 3000;
  readonly simMaxAmount = 20000;
  readonly simMinTerm = 18;
  readonly simMaxTerm = 96;
  /**
   * Tope del importe en el simulador: no puede superar el precio del bien indicado en el paso anterior
   * ni el máximo de producto (`simMaxAmount`).
   */
  get simMaxPrestamoOferta(): number {
    const cap = this.simMaxAmount;
    const precio = this.precioBienAmount;
    if (!Number.isFinite(precio) || precio <= 0) {
      return cap;
    }
    return Math.min(cap, precio);
  }
  /** TIN / TAE ilustrativos (cuota coherente con TIN vía amortización francesa) */
  readonly simTinAnual = 4;
  readonly simTaeAnual = 4.84;

  finalidadOptions = PRESTAMO_SABADELL_FINALIDADES;
  cotitularOptions = PRESTAMO_SABADELL_COTITULARES_DEMO;
  /** Valor interno de finalidad; vacío = sin elegir */
  finalidad = '';
  /** Desplegable custom de finalidad (referencia diseño) */
  finalidadDropdownOpen = false;
  /** Texto libre del importe (formato ES) */
  precioBienInput = '';
  /** null = sin elegir; true/false = préstamo compartido */
  prestamoCompartido: boolean | null = null;
  /** Cotitular elegido si préstamo compartido = Sí */
  cotitularId: string | null = null;

  showProgressModal = false;
  /** Info «Préstamo compartido» (bottom sheet) */
  showPrestamoCompartidoInfo = false;

  faqs = PRESTAMO_SABADELL_ONBOARDING_FAQS;
  expandedFaqIndex: number | null = 0;
  showExtraFaqs = false;

  readonly steps = [
    {
      icon: 'coins',
      title: 'Simula tu cuota',
      text: 'Obtén una estimación de lo que pagarás.'
    },
    {
      icon: 'file-text',
      title: 'Completa tus datos',
      text: 'Introduce tus datos para calcular la mejor oferta.'
    },
    {
      icon: 'upload',
      title: 'Sube la documentación',
      text: 'Validaremos la información y te daremos una respuesta.'
    },
    {
      icon: 'pen-line',
      title: 'Firma tu préstamo',
      text: 'Con tu firma, recibirás el dinero en cuenta.'
    }
  ] as readonly {
    icon: string;
    title: string;
    text: string;
  }[];

  readonly wizardProgressLabels = [
    'Finalidad e importe',
    'Personalización',
    'Datos personales',
    'Documentación',
    'Firma'
  ];

  ngAfterViewInit(): void {
    this.scrollTopAndIcons();
  }

  ngOnDestroy(): void {
    this.clearDocumentFlowState();
    this.clearAcceleratorState();
    this.clearSimuladorOfertaHintSchedule();
    this.clearDatosStepInterstitial();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const t = event.target as HTMLElement;
    if (this.finalidadDropdownOpen && this.step === 1 && this.simulationPhase === 'datos') {
      if (t.closest('.sabadell-finalidad-dropdown')) {
        return;
      }
      this.finalidadDropdownOpen = false;
    }
    if (this.laboralDropdownOpen && this.step === 1 && this.simulationPhase === 'datos-laborales') {
      if (t.closest('.sabadell-laboral-dropdown')) {
        return;
      }
      this.laboralDropdownOpen = null;
      this.cdr.markForCheck();
    }
    if (this.familiarDropdownOpen && this.step === 1 && this.simulationPhase === 'datos-familiares') {
      if (t.closest('.sabadell-familiar-dropdown')) {
        return;
      }
      this.familiarDropdownOpen = null;
      this.cdr.markForCheck();
    }
    if (this.viviendaDropdownOpen && this.step === 1 && this.simulationPhase === 'datos-vivienda') {
      if (t.closest('.sabadell-vivienda-dropdown')) {
        return;
      }
      this.viviendaDropdownOpen = null;
      this.cdr.markForCheck();
    }
  }

  toggleFinalidadDropdown(ev: Event): void {
    ev.stopPropagation();
    this.finalidadDropdownOpen = !this.finalidadDropdownOpen;
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  selectFinalidad(o: FinalidadOption, ev: Event): void {
    ev.stopPropagation();
    this.finalidad = o.value;
    this.finalidadDropdownOpen = false;
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  getFinalidadLabel(): string {
    return this.finalidadOptions.find((x) => x.value === this.finalidad)?.label ?? '';
  }

  /** Importe numérico a partir del input (miles con punto, decimales con coma, opcional €) */
  get precioBienAmount(): number {
    let s = this.precioBienInput.trim().replace(/\s/g, '').replace(/€/g, '');
    const raw = s.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '').trim();
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : NaN;
  }

  /** Cuota mensual (amortización constante, TIN nominal anual) */
  get simCuotaMensual(): number {
    return this.monthlyPayment(this.simAmount, this.simTermMonths, this.simTinAnual);
  }

  get simImporteTotalAdeudado(): number {
    return this.simCuotaMensual * this.simTermMonths;
  }

  /** Intereses + comisiones (solo intereses si comisión 0) */
  get simCosteTotalPrestamo(): number {
    return Math.max(0, this.simImporteTotalAdeudado - this.simAmount);
  }

  get termSliderProgressPercent(): number {
    const span = this.simMaxTerm - this.simMinTerm;
    if (span <= 0) {
      return 0;
    }
    return ((this.simTermMonths - this.simMinTerm) / span) * 100;
  }

  /**
   * Segmentos activos en la barra superior (paso 1 = solo simulación inicial; ≥2 = pasos posteriores).
   */
  get progressActiveSegments(): number {
    if (
      this.simulationPhase === 'datos-laborales' ||
      this.simulationPhase === 'datos-familiares' ||
      this.simulationPhase === 'datos-vivienda' ||
      this.simulationPhase === 'datos-economicos'
    ) {
      return this.simulationAssistantStep;
    }
    return 1;
  }

  isProgressModalItemCurrent(index: number): boolean {
    if (this.step !== 1) {
      return false;
    }
    if (this.simulationAssistantStep >= 2) {
      return index === this.simulationAssistantStep - 1;
    }
    if (this.simulationPhase === 'datos') {
      return index === 0;
    }
    if (this.simulationPhase === 'simulador') {
      return index === 1;
    }
    return index === 0;
  }

  isProgressModalItemDone(index: number): boolean {
    if (this.step !== 1) {
      return false;
    }
    if (this.simulationAssistantStep >= 2) {
      return index < this.simulationAssistantStep - 1;
    }
    if (this.simulationPhase === 'simulador') {
      return index === 0;
    }
    return false;
  }

  formatEuro(amount: number): string {
    return amount.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatTinPercent(value: number): string {
    return value.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatTaePercent(value: number): string {
    return value.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  private monthlyPayment(principal: number, months: number, tinAnnualPercent: number): number {
    const r = tinAnnualPercent / 100 / 12;
    if (r <= 0) {
      return principal / months;
    }
    const factor = Math.pow(1 + r, months);
    return (principal * r * factor) / (factor - 1);
  }

  private clampRoundAmountToStep(raw: number): number {
    const step = 500;
    const max = this.simMaxPrestamoOferta;
    const min = this.simMinAmount;
    const clamped = Math.min(max, Math.max(min, raw));
    let rounded = Math.round(clamped / step) * step;
    if (rounded > max) {
      rounded = Math.floor(max / step) * step;
    }
    if (rounded < min) {
      rounded = min;
    }
    return rounded;
  }

  get simulationStepValid(): boolean {
    const precio = this.precioBienAmount;
    const base =
      this.finalidad.trim() !== '' &&
      Number.isFinite(precio) &&
      precio >= 3000 &&
      this.prestamoCompartido !== null;
    if (!base) {
      return false;
    }
    if (this.prestamoCompartido === true) {
      return this.cotitularId !== null && this.cotitularId.trim() !== '';
    }
    return true;
  }

  setPrestamoCompartido(v: boolean): void {
    this.prestamoCompartido = v;
    if (v === false) {
      this.cotitularId = null;
    }
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  selectCotitular(id: string): void {
    this.cotitularId = id;
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  onPrecioBienBlur(): void {
    const n = this.precioBienAmount;
    if (!this.precioBienInput.trim()) {
      return;
    }
    if (Number.isFinite(n) && n > 0) {
      const whole = Math.abs(n - Math.round(n)) < 1e-9;
      this.precioBienInput = whole
        ? `${Math.round(n).toLocaleString('es-ES')} €`
        : `${n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
    }
    this.cdr.markForCheck();
  }

  clearPrecioBien(): void {
    this.precioBienInput = '';
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  onBack(): void {
    if (this.documentFlowPhase === 'spinner') {
      this.clearDocumentFlowState();
      return;
    }
    if (this.documentFlowPhase === 'document') {
      this.clearDocumentFlowState();
      return;
    }
    if (this.postAceptarDocPhase === 'accelerator') {
      this.clearAcceleratorState();
      this.simulationPhase = 'simulador';
      this.simulationAssistantStep = 1;
      this.scheduleSimuladorOfertaHint();
      return;
    }
    if (this.datosStepInterstitialActive) {
      this.clearDatosStepInterstitial();
      return;
    }
    if (this.step === 1) {
      if (this.simulationPhase === 'datos-economicos') {
        this.viviendaDropdownOpen = null;
        this.simulationPhase = 'datos-vivienda';
        this.simulationAssistantStep = 4;
        this.scrollTopAndIcons();
        return;
      }
      if (this.simulationPhase === 'datos-vivienda') {
        this.viviendaDropdownOpen = null;
        this.familiarDropdownOpen = null;
        this.simulationPhase = 'datos-familiares';
        this.simulationAssistantStep = 3;
        this.scrollTopAndIcons();
        return;
      }
      if (this.simulationPhase === 'datos-familiares') {
        this.familiarDropdownOpen = null;
        this.simulationPhase = 'datos-laborales';
        this.simulationAssistantStep = 2;
        this.scrollTopAndIcons();
        return;
      }
      if (this.simulationPhase === 'datos-laborales') {
        this.laboralDropdownOpen = null;
        this.simulationPhase = 'simulador';
        this.simulationAssistantStep = 1;
        this.closeProgressModal();
        this.scrollTopAndIcons();
        this.scheduleSimuladorOfertaHint();
        return;
      }
      if (this.simulationPhase === 'simulador') {
        this.clearSimuladorOfertaHintSchedule();
        this.simulationPhase = 'datos';
        this.closeProgressModal();
        this.scrollTopAndIcons();
        return;
      }
      this.finalidadDropdownOpen = false;
      this.closePrestamoCompartidoInfo();
      this.closeProgressModal();
      this.step = 0;
      this.simulationPhase = 'datos';
      this.simulationAssistantStep = 1;
      this.scrollTopAndIcons();
      return;
    }
    this.close.emit();
  }

  onCloseRequest(): void {
    if (this.datosStepInterstitialActive) {
      this.clearDatosStepInterstitial();
    }
    if (this.documentFlowPhase !== null) {
      this.clearDocumentFlowState();
    }
    if (this.postAceptarDocPhase !== null) {
      this.clearAcceleratorState();
    }
    this.closePrestamoCompartidoInfo();
    this.closeProgressModal();
    this.close.emit();
  }

  onAyuda(): void {
    if (this.step !== 0) {
      return;
    }
    const el = document.getElementById('sabadell-faq-heading');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onEmpezar(): void {
    this.step = 1;
    this.simulationPhase = 'datos';
    this.simulationAssistantStep = 1;
    this.scrollTopAndIcons();
  }

  onChatSimulation(): void {
    /* Integración chat cuando exista */
  }

  openPrestamoCompartidoInfo(): void {
    this.finalidadDropdownOpen = false;
    this.showProgressModal = false;
    this.showPrestamoCompartidoInfo = true;
    document.body.style.overflow = 'hidden';
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  closePrestamoCompartidoInfo(): void {
    this.showPrestamoCompartidoInfo = false;
    document.body.style.overflow = '';
  }

  toggleProgressModal(): void {
    if (this.datosStepInterstitialActive) {
      this.clearDatosStepInterstitial();
    }
    this.finalidadDropdownOpen = false;
    this.laboralDropdownOpen = null;
    this.familiarDropdownOpen = null;
    this.viviendaDropdownOpen = null;
    this.showPrestamoCompartidoInfo = false;
    this.showProgressModal = !this.showProgressModal;
    if (this.showProgressModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  closeProgressModal(): void {
    this.showProgressModal = false;
    document.body.style.overflow = '';
  }

  onPersonalizarSimulacion(): void {
    if (!this.simulationStepValid) {
      return;
    }
    const precio = this.precioBienAmount;
    this.simAmount = this.clampRoundAmountToStep(Number.isFinite(precio) ? precio : this.simMinAmount);
    this.simTermMonths = this.simMaxTerm;
    this.personalizarSimulacion.emit({
      finalidad: this.finalidad,
      precioBien: this.precioBienAmount,
      prestamoCompartido: this.prestamoCompartido as boolean,
      cotitularId:
        this.prestamoCompartido === true ? this.cotitularId : null
    });
    this.finalidadDropdownOpen = false;
    this.closeProgressModal();
    this.simulationPhase = 'simulador';
    this.cdr.markForCheck();
    this.scrollTopAndIcons();
    this.scheduleSimuladorOfertaHint();
  }

  onSimAmountChange(value: number): void {
    this.simAmount = value;
    this.cdr.markForCheck();
  }

  onSimTermSliderChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const v = parseInt(input.value, 10);
    if (!Number.isFinite(v)) {
      return;
    }
    this.simTermMonths = v;
    this.cdr.markForCheck();
  }

  onContinuarDesdeSimulador(): void {
    this.clearSimuladorOfertaHintSchedule();
    if (this.docSpinnerTimeoutId != null) {
      clearTimeout(this.docSpinnerTimeoutId);
      this.docSpinnerTimeoutId = null;
    }
    this.documentReadComplete = false;
    this.documentFlowPhase = 'spinner';
    document.body.style.overflow = 'hidden';
    this.cdr.markForCheck();

    this.docSpinnerTimeoutId = setTimeout(() => {
      this.docSpinnerTimeoutId = null;
      this.documentFlowPhase = 'document';
      this.cdr.markForCheck();
      setTimeout(() => {
        this.syncDocumentReadState();
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }, 0);
    }, this.docSpinnerDurationMs);
  }

  onDocumentScroll(): void {
    this.syncDocumentReadState();
  }

  scrollDocumentToBottom(): void {
    const el = this.docScroll?.nativeElement;
    if (!el) {
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setTimeout(() => this.syncDocumentReadState(), 450);
  }

  /** Zoom / descarga: integración futura con visor PDF */
  onDocumentZoom(): void {}

  onDocumentDownload(): void {}

  onRechazarDocumento(): void {
    this.clearDocumentFlowState();
  }

  onAceptarDocumento(): void {
    if (!this.documentReadComplete) {
      return;
    }
    this.emitContinuarSimuladorPayload();
    this.documentFlowPhase = null;
    this.documentReadComplete = false;
    if (this.docSpinnerTimeoutId != null) {
      clearTimeout(this.docSpinnerTimeoutId);
      this.docSpinnerTimeoutId = null;
    }
    this.postAceptarDocPhase = 'accelerator';
    document.body.style.overflow = 'hidden';
    this.cdr.markForCheck();

    this.acceleratorTimeoutId = setTimeout(() => {
      this.acceleratorTimeoutId = null;
      this.postAceptarDocPhase = null;
      this.simulationPhase = 'datos-laborales';
      this.simulationAssistantStep = 2;
      document.body.style.overflow = '';
      this.cdr.markForCheck();
      this.scrollTopAndIcons();
    }, this.postAceptarAcceleratorMs);
  }

  onIrADatosFamiliares(): void {
    if (!this.laboralFormValid) {
      return;
    }
    this.laboralDropdownOpen = null;
    this.startDatosStepInterstitial({ phase: 'datos-familiares', step: 3 });
  }

  onIrADatosVivienda(): void {
    if (!this.familiarFormValid) {
      return;
    }
    this.familiarDropdownOpen = null;
    this.startDatosStepInterstitial({ phase: 'datos-vivienda', step: 4 });
  }

  onIrADatosEconomicos(): void {
    if (!this.viviendaFormValid) {
      return;
    }
    this.viviendaDropdownOpen = null;
    this.startDatosStepInterstitial({ phase: 'datos-economicos', step: 5 });
  }

  get datosInterstitialCurrentSlide(): SabadellDatosInterstitialSlide {
    const t = this.datosInterstitialPendingTarget;
    if (!t) {
      return { title: '', bodyLines: [] };
    }
    return getDatosInterstitialSlideForPhase(t.phase);
  }

  private startDatosStepInterstitial(target: {
    phase: 'datos-familiares' | 'datos-vivienda' | 'datos-economicos';
    step: number;
  }): void {
    this.clearDatosStepInterstitialTimersOnly();
    this.datosInterstitialPendingTarget = target;
    this.datosStepInterstitialActive = true;
    document.body.style.overflow = 'hidden';
    this.cdr.markForCheck();

    this.datosInterstitialFinishTimeoutId = setTimeout(() => {
      this.datosInterstitialFinishTimeoutId = null;
      this.finishDatosStepInterstitial();
    }, this.datosInterstitialDurationMs);
  }

  private finishDatosStepInterstitial(): void {
    const target = this.datosInterstitialPendingTarget;
    this.clearDatosStepInterstitialTimersOnly();
    this.datosStepInterstitialActive = false;
    this.datosInterstitialPendingTarget = null;
    document.body.style.overflow = '';
    if (target) {
      this.simulationPhase = target.phase;
      this.simulationAssistantStep = target.step;
    }
    this.cdr.markForCheck();
    this.scrollTopAndIcons();
  }

  private clearDatosStepInterstitialTimersOnly(): void {
    if (this.datosInterstitialFinishTimeoutId !== null) {
      clearTimeout(this.datosInterstitialFinishTimeoutId);
      this.datosInterstitialFinishTimeoutId = null;
    }
  }

  /** Cancela el intersticial (Atrás, cerrar wizard, destrucción del componente). */
  private clearDatosStepInterstitial(): void {
    this.clearDatosStepInterstitialTimersOnly();
    this.datosInterstitialPendingTarget = null;
    if (this.datosStepInterstitialActive) {
      this.datosStepInterstitialActive = false;
      document.body.style.overflow = '';
      this.cdr.markForCheck();
    }
  }

  get viviendaFormValid(): boolean {
    if (!this.viviendaSituacion.trim()) {
      return false;
    }
    const cp = this.viviendaCodigoPostal.trim();
    return /^\d{5}$/.test(cp);
  }

  getViviendaSituacionLabel(): string {
    return this.viviendaSituaciones.find((x) => x.value === this.viviendaSituacion)?.label ?? '';
  }

  toggleViviendaDropdown(ev: Event): void {
    ev.stopPropagation();
    this.viviendaDropdownOpen = this.viviendaDropdownOpen === 'situacion' ? null : 'situacion';
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  selectViviendaSituacion(value: string, ev: Event): void {
    ev.stopPropagation();
    this.viviendaSituacion = value;
    this.viviendaDropdownOpen = null;
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  clearViviendaCodigoPostal(): void {
    this.viviendaCodigoPostal = '';
    this.cdr.markForCheck();
  }

  get familiarFormValid(): boolean {
    if (!this.familiarEstadoCivil.trim()) {
      return false;
    }
    const raw = this.familiarMiembrosUnidad.trim();
    if (raw === '') {
      return false;
    }
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 1;
  }

  getEstadoCivilLabel(): string {
    return this.familiarEstadosCiviles.find((x) => x.value === this.familiarEstadoCivil)?.label ?? '';
  }

  toggleFamiliarDropdown(field: 'estadoCivil', ev: Event): void {
    ev.stopPropagation();
    this.familiarDropdownOpen = this.familiarDropdownOpen === field ? null : field;
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  selectFamiliarEstadoCivil(value: string, ev: Event): void {
    ev.stopPropagation();
    this.familiarEstadoCivil = value;
    this.familiarDropdownOpen = null;
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  clearFamiliarMiembros(): void {
    this.familiarMiembrosUnidad = '';
    this.cdr.markForCheck();
  }

  get showLaboralExtraFields(): boolean {
    return !!this.laboralSituacion && !!this.laboralProfesion;
  }

  get laboralProfesionesFiltered(): string[] {
    const q = this.laboralProfesionQuery.trim().toLowerCase();
    if (!q) {
      return this.laboralProfesiones;
    }
    return this.laboralProfesiones.filter((p) => p.toLowerCase().includes(q));
  }

  get laboralFormValid(): boolean {
    if (!this.laboralSituacion || !this.laboralProfesion || !this.laboralActividad) {
      return false;
    }
    const y = this.laboralAniosEmpresa.trim();
    if (y === '') {
      return false;
    }
    const n = parseInt(y, 10);
    return Number.isFinite(n) && n >= 0;
  }

  getLaboralSituacionLabel(): string {
    return this.laboralSituaciones.find((x) => x.value === this.laboralSituacion)?.label ?? '';
  }

  toggleLaboralDropdown(field: 'situacion' | 'profesion' | 'actividad', ev: Event): void {
    ev.stopPropagation();
    this.laboralDropdownOpen = this.laboralDropdownOpen === field ? null : field;
    if (field === 'profesion' && this.laboralDropdownOpen === 'profesion') {
      this.laboralProfesionQuery = '';
    }
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  selectLaboralSituacion(value: string, ev: Event): void {
    ev.stopPropagation();
    this.laboralSituacion = value;
    this.laboralDropdownOpen = null;
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  selectLaboralProfesion(label: string, ev: Event): void {
    ev.stopPropagation();
    this.laboralProfesion = label;
    this.laboralDropdownOpen = null;
    this.laboralProfesionQuery = '';
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  selectLaboralActividad(label: string, ev: Event): void {
    ev.stopPropagation();
    this.laboralActividad = label;
    this.laboralDropdownOpen = null;
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  clearLaboralAniosEmpresa(): void {
    this.laboralAniosEmpresa = '';
    this.cdr.markForCheck();
  }

  private emitContinuarSimuladorPayload(): void {
    const base: SabadellSimulacionPaso1Payload = {
      finalidad: this.finalidad,
      precioBien: this.precioBienAmount,
      prestamoCompartido: this.prestamoCompartido as boolean,
      cotitularId: this.prestamoCompartido === true ? this.cotitularId : null
    };
    this.continuarSimulador.emit({
      ...base,
      importePrestamo: this.simAmount,
      plazoMeses: this.simTermMonths,
      cuotaMensual: this.simCuotaMensual,
      tinAnual: this.simTinAnual,
      taeAnual: this.simTaeAnual
    });
  }

  private clearAcceleratorState(): void {
    if (this.acceleratorTimeoutId != null) {
      clearTimeout(this.acceleratorTimeoutId);
      this.acceleratorTimeoutId = null;
    }
    this.postAceptarDocPhase = null;
    document.body.style.overflow = '';
  }

  private syncDocumentReadState(): void {
    const el = this.docScroll?.nativeElement;
    if (!el) {
      return;
    }
    const threshold = 36;
    const atBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
    const fitsWithoutScroll = el.scrollHeight <= el.clientHeight + 8;
    const next = atBottom || fitsWithoutScroll;
    if (next !== this.documentReadComplete) {
      this.documentReadComplete = next;
      this.cdr.markForCheck();
    }
  }

  private scheduleSimuladorOfertaHint(): void {
    this.clearSimuladorOfertaHintSchedule();
    this.simuladorOfertaHintTimerId = setTimeout(() => {
      this.simuladorOfertaHintTimerId = null;
      if (this.simulationPhase !== 'simulador') {
        return;
      }
      this.showSimuladorOfertaHint = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }, 0);
    }, this.simuladorOfertaHintDelayMs);
  }

  private clearSimuladorOfertaHintSchedule(): void {
    if (this.simuladorOfertaHintTimerId != null) {
      clearTimeout(this.simuladorOfertaHintTimerId);
      this.simuladorOfertaHintTimerId = null;
    }
    this.showSimuladorOfertaHint = false;
  }

  private clearDocumentFlowState(): void {
    if (this.docSpinnerTimeoutId != null) {
      clearTimeout(this.docSpinnerTimeoutId);
      this.docSpinnerTimeoutId = null;
    }
    this.documentFlowPhase = null;
    this.documentReadComplete = false;
    document.body.style.overflow = '';
  }

  solicitarOtroImporte(): void {}

  resetPlazoAlMinimo(): void {
    this.simTermMonths = this.simMinTerm;
    this.cdr.markForCheck();
  }

  toggleFaq(index: number): void {
    this.expandedFaqIndex = this.expandedFaqIndex === index ? null : index;
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  toggleVerMasPreguntas(): void {
    this.showExtraFaqs = !this.showExtraFaqs;
    this.cdr.markForCheck();
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  get visibleFaqs() {
    return this.showExtraFaqs ? this.faqs : this.faqs.slice(0, 4);
  }

  private scrollTopAndIcons(): void {
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
      const wizard = document.querySelector('.wizard-content');
      if (wizard) {
        (wizard as HTMLElement).scrollTop = 0;
      }
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }
}
