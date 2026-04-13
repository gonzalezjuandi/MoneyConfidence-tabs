import { Component, EventEmitter, Output, AfterViewInit, Input, OnInit } from '@angular/core';

declare var lucide: any;

@Component({
  selector: 'app-prestamo-coche-firma',
  templateUrl: './prestamo-coche-firma.component.html',
  styleUrls: ['./prestamo-coche-firma.component.scss']
})
export class PrestamoCocheFirmaComponent implements OnInit, AfterViewInit {
  @Input() loanData?: any;
  /** true cuando es la pantalla de firma del seguro (seguro-firma) */
  @Input() isSeguroFirma = false;
  @Output() complete = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  // Clave de firma digital
  signatureKey = '861523';
  signatureKeyArray = this.signatureKey.split('');
  
  // Estado del input
  inputValue = '';
  inputMask = '••••••';

  // Estado de ayuda
  showHelp = false;

  ngOnInit(): void {
    // Mezclar la clave para mostrarla desordenada
    this.shuffleKey();
  }

  ngAfterViewInit(): void {
    // Asegurar que la pantalla del flujo se muestre siempre desde arriba
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

  shuffleKey(): void {
    // Crear una copia mezclada de la clave para mostrar
    const shuffled = [...this.signatureKeyArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    this.signatureKeyArray = shuffled;
  }

  /** Arrastre del bloque completo de dígitos (HTML5 DnD) */
  onKeyDragStart(event: DragEvent): void {
    if (!event.dataTransfer) return;
    event.dataTransfer.setData('text/plain', this.signatureKey);
    event.dataTransfer.effectAllowed = 'copy';
  }

  onKeyDragEnd(): void {
    // Opcional: quitar clase visual si se usara
  }

  onDropZoneDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onDropZoneDragLeave(event: DragEvent): void {
    event.preventDefault();
  }

  onKeyDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.handleDrop();
  }

  handleDrop(): void {
    // En el prototipo, al arrastrar a la zona inferior se considera
    // que se han arrastrado TODOS los dígitos de la clave a la vez.
    if (this.inputValue.length === 0) {
      this.inputValue = this.signatureKey;
      this.updateInputMask();
      this.verifySignature();
    }
  }

  onDigitClick(digit: string, index: number): void {
    // En el prototipo, al hacer clic en cualquier dígito se considera
    // que se utiliza la clave completa de una sola vez.
    if (this.inputValue.length === 0) {
      this.inputValue = this.signatureKey;
      this.updateInputMask();
      this.verifySignature();
    }
  }

  /** Escribir la clave con teclado: solo dígitos, máximo 6 */
  onSignatureInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = (input.value || '').replace(/\D/g, '').slice(0, 6);
    this.inputValue = raw;
    input.value = raw;
    this.updateInputMask();
  }

  /** Permitir solo teclas numéricas y navegación */
  onSignatureKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
      return;
    }
    if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(key.toLowerCase())) {
      return;
    }
    if (!/^\d$/.test(key)) {
      event.preventDefault();
    }
  }

  updateInputMask(): void {
    const filled = this.inputValue.length;
    const empty = 6 - filled;
    this.inputMask = '•'.repeat(filled) + '•'.repeat(empty);
  }

  verifySignature(): void {
    // Verificar que la clave introducida sea correcta
    if (this.inputValue === this.signatureKey) {
      // Firma correcta
      setTimeout(() => {
        this.complete.emit();
      }, 500);
    } else {
      // Firma incorrecta - resetear
      alert('La clave de firma no es correcta. Por favor, inténtalo de nuevo.');
      this.resetSignature();
    }
  }

  resetSignature(): void {
    this.inputValue = '';
    this.inputMask = '••••••';
    this.shuffleKey();
  }

  onSign(): void {
    // Si la clave está completa, verificar; si no, continuar directamente
    if (this.inputValue.length === 6) {
      this.verifySignature();
    } else {
      // Permitir continuar sin completar la clave (para desarrollo/demo)
      setTimeout(() => {
        this.complete.emit();
      }, 100);
    }
  }

  onBack(): void {
    this.back.emit();
  }

  toggleHelp(): void {
    this.showHelp = !this.showHelp;
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }
}
