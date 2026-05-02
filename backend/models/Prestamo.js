class Prestamo {
  constructor({
    id,
    clienteID,
    clienteNombre,
    montoPrestado,
    capitalRestante,
    interesPercent,
    frecuencia,
    fechaPrestamo = new Date(),
    estado = 'activo',
    fechaUltimoPago = null,
    fechaProximoPago = null,
    diaPagoPersonalizado = null,
    diaSemana = null,
    fechasPersonalizadas = [],
    configuracionMora = null,
    nota = '',
    historialPagos = [],
    generarComision = false,
    garanteID = null,
    garanteNombre = null,
    porcentajeComision = 50
  }) {
    this.id = id;
    this.clienteID = clienteID;
    this.clienteNombre = clienteNombre;
    this.montoPrestado = parseFloat(montoPrestado) || 0;
    this.capitalRestante = parseFloat(capitalRestante) || 0;
    this.interesPercent = parseFloat(interesPercent) || 0;
    this.frecuencia = frecuencia;
    // 🔥 CORREGIDO: Guardar como STRING en formato DD-MM-YYYY
    this.fechaPrestamo = this._normalizarFecha(fechaPrestamo);
    this.estado = estado;
    this.fechaUltimoPago = this._normalizarFecha(fechaUltimoPago);
    this.fechaProximoPago = this._normalizarFecha(fechaProximoPago);
    this.diaPagoPersonalizado = diaPagoPersonalizado ? parseInt(diaPagoPersonalizado) : null;
    this.diaSemana = diaSemana;
    this.fechasPersonalizadas = fechasPersonalizadas || [];
    this.configuracionMora = configuracionMora;
    this.nota = nota || '';
    this.historialPagos = historialPagos || [];
    this.fechaActualizacion = new Date();
    this.generarComision = generarComision;
    this.garanteID = garanteID;
    this.garanteNombre = garanteNombre;
    this.porcentajeComision = porcentajeComision;
  }

  // ============================================
  // 🔥 VERSIÓN CON FORMATO DD-MM-YYYY
  // ============================================
  _normalizarFecha(fecha) {
    if (!fecha) return null;
    
    // 1. Si ya es string en formato DD-MM-YYYY, devolverlo directamente
    if (typeof fecha === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
      console.log('📅 [Prestamo] Fecha ya es string DD-MM-YYYY:', fecha);
      return fecha;
    }
    
    // 2. Convertir cualquier otra cosa a string DD-MM-YYYY en LOCAL
    let dateObj;
    
    if (fecha instanceof Date && !isNaN(fecha.getTime())) {
      dateObj = fecha;
    } else if (fecha && typeof fecha === 'object') {
      if (fecha._seconds !== undefined) {
        dateObj = new Date(fecha._seconds * 1000);
      } else if (fecha.seconds !== undefined) {
        dateObj = new Date(fecha.seconds * 1000);
      } else if (fecha.toDate && typeof fecha.toDate === 'function') {
        dateObj = fecha.toDate();
      } else {
        dateObj = new Date(fecha);
      }
    } else if (typeof fecha === 'string') {
      // Intentar parsear string ISO o YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        const [year, month, day] = fecha.split('-');
        dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        dateObj = new Date(fecha);
      }
    } else if (typeof fecha === 'number') {
      dateObj = new Date(fecha);
    } else {
      dateObj = new Date(fecha);
    }
    
    // Validar que la fecha sea válida
    if (isNaN(dateObj.getTime())) {
      const hoy = new Date();
      const day = String(hoy.getDate()).padStart(2, '0');
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const year = hoy.getFullYear();
      console.warn('⚠️ [Prestamo] Fecha inválida, usando hoy:', `${day}-${month}-${year}`);
      return `${day}-${month}-${year}`;
    }
    
    // Extraer componentes en LOCAL (sin conversión UTC)
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    const fechaString = `${day}-${month}-${year}`;
    console.log('📅 [Prestamo] Fecha convertida a string DD-MM-YYYY:', fechaString);
    
    return fechaString;
  }

  // ============================================
  // 🔥 Convertir string DD-MM-YYYY a Date para cálculos
  // ============================================
  _stringToDate(fechaStr) {
    if (!fechaStr) return null;
    if (fechaStr instanceof Date) return fechaStr;
    
    // Formato DD-MM-YYYY
    if (typeof fechaStr === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(fechaStr)) {
      const [day, month, year] = fechaStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Formato YYYY-MM-DD (para compatibilidad con datos antiguos)
    if (typeof fechaStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
      const [year, month, day] = fechaStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    if (typeof fechaStr === 'string') {
      return new Date(fechaStr);
    }
    
    if (fechaStr && typeof fechaStr === 'object') {
      if (fechaStr._seconds !== undefined) return new Date(fechaStr._seconds * 1000);
      if (fechaStr.seconds !== undefined) return new Date(fechaStr.seconds * 1000);
      if (fechaStr.toDate) return fechaStr.toDate();
    }
    
    return new Date(fechaStr);
  }

  // ============================================
  // MÉTODOS EXISTENTES (modificados para usar _stringToDate)
  // ============================================

  calcularInteresDiario() {
    if (!this.capitalRestante || !this.interesPercent) return 0;
    return (this.capitalRestante * this.interesPercent) / 100 / 30;
  }

  calcularInteresPorDias(dias) {
    return this.calcularInteresDiario() * dias;
  }

  calcularInteresPeriodo() {
    const interesDiario = this.calcularInteresDiario();
    switch (this.frecuencia) {
      case 'diario': return interesDiario;
      case 'semanal': return interesDiario * 7;
      case 'quincenal': return interesDiario * 15;
      case 'mensual': return interesDiario * 30;
      default: return interesDiario * 30;
    }
  }

  calcularDiasDesdeUltimoPago(fechaReferencia = new Date()) {
    const fechaBase = this.fechaUltimoPago || this.fechaPrestamo;
    if (!fechaBase) return 0;
    
    const fechaBaseDate = this._stringToDate(fechaBase);
    const fechaRef = this._stringToDate(fechaReferencia);
    
    if (!fechaBaseDate || !fechaRef) return 0;
    
    const diffTime = Math.abs(fechaRef - fechaBaseDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calcularMora(diasAtraso, interesAdeudado) {
    if (!this.configuracionMora?.enabled) return 0;
    const diasGracia = this.configuracionMora.diasGracia || 3;
    if (diasAtraso <= diasGracia) return 0;
    const diasMora = diasAtraso - diasGracia;
    const porcentajeMora = this.configuracionMora.porcentaje || 5;
    const moraDiaria = (interesAdeudado * porcentajeMora) / 100 / 30;
    return moraDiaria * diasMora;
  }

  calcularSiguienteFechaPago(fechaBase) {
    // Convertir string a Date para cálculos
    const fecha = this._stringToDate(fechaBase);
    if (!fecha) return this._normalizarFecha(new Date());
    
    const dia = fecha.getDate();
    const mes = fecha.getMonth();
    const año = fecha.getFullYear();
    
    let nuevaFecha;
    
    switch (this.frecuencia) {
      case 'diario':
        nuevaFecha = new Date(fecha);
        nuevaFecha.setDate(dia + 1);
        break;
        
      case 'semanal':
        nuevaFecha = new Date(fecha);
        nuevaFecha.setDate(dia + 7);
        break;
        
      case 'quincenal':
        const fechaActualQuincenal = this.fechaProximoPago 
          ? this._stringToDate(this.fechaProximoPago) 
          : fecha;
        const diaActualQuincenal = fechaActualQuincenal.getDate();
        const mesActualQuincenal = fechaActualQuincenal.getMonth();
        const añoActualQuincenal = fechaActualQuincenal.getFullYear();
        
        if (diaActualQuincenal === 15) {
          const ultimoDia = new Date(añoActualQuincenal, mesActualQuincenal + 1, 0).getDate();
          nuevaFecha = new Date(añoActualQuincenal, mesActualQuincenal, ultimoDia);
        } else {
          let mesSiguiente = mesActualQuincenal + 1;
          let añoSiguiente = añoActualQuincenal;
          if (mesSiguiente > 11) {
            mesSiguiente = 0;
            añoSiguiente++;
          }
          nuevaFecha = new Date(añoSiguiente, mesSiguiente, 15);
        }
        break;
        
      case 'mensual':
        const fechaActualMensual = this.fechaProximoPago 
          ? this._stringToDate(this.fechaProximoPago) 
          : fecha;
        const diaActualMensual = fechaActualMensual.getDate();
        const mesActualMensual = fechaActualMensual.getMonth();
        const añoActualMensual = fechaActualMensual.getFullYear();
        
        let diaPagoMensual = this.diaPagoPersonalizado || diaActualMensual;
        let fechaMensual = new Date(añoActualMensual, mesActualMensual + 1, diaPagoMensual);
        
        if (fechaMensual.getMonth() !== (mesActualMensual + 1) % 12) {
          fechaMensual = new Date(añoActualMensual, mesActualMensual + 2, 0);
        }
        nuevaFecha = fechaMensual;
        break;
        
      case 'personalizado':
        if (this.fechasPersonalizadas && this.fechasPersonalizadas.length > 0) {
          const fechaReferencia = this.fechaProximoPago 
            ? this._stringToDate(this.fechaProximoPago) 
            : fecha;
          const fechas = this.fechasPersonalizadas.map(f => this._stringToDate(f));
          fechas.sort((a, b) => a - b);
          
          let fechaEncontrada = null;
          for (const fechaPago of fechas) {
            if (fechaPago > fechaReferencia) {
              fechaEncontrada = fechaPago;
              break;
            }
          }
          
          if (fechaEncontrada) {
            nuevaFecha = fechaEncontrada;
          } else {
            nuevaFecha = new Date(fechas[0]);
            nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1);
          }
        } else {
          nuevaFecha = new Date(fecha);
          nuevaFecha.setDate(dia + 30);
        }
        break;
        
      default:
        nuevaFecha = new Date(fecha);
        nuevaFecha.setDate(dia + 30);
    }
    
    // Devolver como string DD-MM-YYYY
    return this._normalizarFecha(nuevaFecha);
  }

  calcularDistribucionPago(montoPago, fechaPago = new Date()) {
    const fechaPagoDate = this._stringToDate(fechaPago);
    
    let diasTranscurridos = 0;
    let fechaBase = this.fechaUltimoPago || this.fechaPrestamo;
    
    if (fechaBase) {
      const fechaBaseDate = this._stringToDate(fechaBase);
      diasTranscurridos = Math.max(1, Math.ceil((fechaPagoDate - fechaBaseDate) / (1000 * 60 * 60 * 24)));
    } else {
      diasTranscurridos = 30;
    }
    
    const interesDiario = this.calcularInteresDiario();
    const interesAdeudado = interesDiario * Math.min(diasTranscurridos, 30);
    
    const fechaBaseParaMora = this.fechaProximoPago || this.fechaPrestamo;
    let diasAtraso = 0;
    let mora = 0;
    
    if (fechaBaseParaMora) {
      const fechaEsperada = this._stringToDate(fechaBaseParaMora);
      diasAtraso = Math.max(0, Math.ceil((fechaPagoDate - fechaEsperada) / (1000 * 60 * 60 * 24)));
      
      if (diasAtraso > 0 && this.configuracionMora?.enabled) {
        const diasGracia = this.configuracionMora.diasGracia || 3;
        if (diasAtraso > diasGracia) {
          const diasMora = diasAtraso - diasGracia;
          const porcentajeMora = this.configuracionMora.porcentaje || 5;
          mora = (interesAdeudado * porcentajeMora / 100) * (diasMora / 30);
        }
      }
    }
    
    let montoRestante = montoPago;
    let interesAplicado = 0;
    let moraAplicada = 0;
    let capitalAplicado = 0;
    let restoInteres = 0;
    
    if (mora > 0 && montoRestante > 0) {
      moraAplicada = Math.min(montoRestante, mora);
      montoRestante -= moraAplicada;
    }
    
    if (montoRestante > 0) {
      interesAplicado = Math.min(montoRestante, interesAdeudado);
      montoRestante -= interesAplicado;
      
      if (interesAplicado < interesAdeudado) {
        restoInteres = interesAdeudado - interesAplicado;
      }
    } else {
      restoInteres = interesAdeudado;
    }
    
    if (montoRestante > 0 && restoInteres === 0) {
      capitalAplicado = Math.min(montoRestante, this.capitalRestante);
      montoRestante -= capitalAplicado;
    }
    
    const nuevoCapital = this.capitalRestante - capitalAplicado;
    const prestamoCompletado = nuevoCapital <= 0;
    
    let periodosPagados = 0;
    if (interesAplicado >= interesAdeudado && interesAdeudado > 0) {
      const interesPeriodo = this.calcularInteresPeriodo();
      if (interesPeriodo > 0) {
        periodosPagados = Math.floor(interesAplicado / interesPeriodo);
      } else {
        periodosPagados = 1;
      }
    }
    
    return {
      interes: interesAplicado,
      capital: capitalAplicado,
      mora: moraAplicada,
      restoInteres: restoInteres,
      nuevoCapital: nuevoCapital,
      prestamoCompletado: prestamoCompletado,
      periodosPagados: periodosPagados,
      diasCubiertos: diasTranscurridos
    };
  }

  calcularComision(interesPagado) {
    if (!this.generarComision || !this.garanteID || interesPagado <= 0) {
      return { monto: 0, porcentaje: 0 };
    }
    
    const montoComision = (interesPagado * this.porcentajeComision) / 100;
    
    return {
      monto: montoComision,
      porcentaje: this.porcentajeComision
    };
  }

  aplicarPago(montoPago, fechaPago = new Date(), distribucion = null) {
    const fechaPagoDate = this._stringToDate(fechaPago);
    const resultado = distribucion || this.calcularDistribucionPago(montoPago, fechaPagoDate);
    
    const capitalAnterior = this.capitalRestante;
    
    this.capitalRestante = resultado.nuevoCapital;
    this.fechaUltimoPago = this._normalizarFecha(fechaPagoDate);
    
    if (resultado.interes > 0 && resultado.restoInteres === 0) {
      this.fechaProximoPago = this.calcularSiguienteFechaPago(fechaPagoDate);
      console.log(`✅ Nueva fecha de próximo pago calculada: ${this.fechaProximoPago}`);
    } else if (resultado.interes > 0 && resultado.restoInteres > 0) {
      console.log(`⚠️ Se pagó interés parcial (RD$ ${resultado.interes.toFixed(2)}), fecha NO cambia.`);
    } else {
      console.log(`⚠️ No se pagó interés, fecha NO cambia.`);
    }
    
    if (this.capitalRestante <= 0) {
      this.estado = 'completado';
    } else if (this.configuracionMora?.enabled && this.fechaProximoPago) {
      const fechaProximo = this._stringToDate(this.fechaProximoPago);
      const diasAtraso = Math.max(0, Math.ceil((new Date() - fechaProximo) / (1000 * 60 * 60 * 24)));
      if (diasAtraso > (this.configuracionMora.diasGracia || 3)) {
        this.estado = 'moroso';
      } else {
        this.estado = 'activo';
      }
    } else {
      this.estado = 'activo';
    }
    
    this.historialPagos.push({
      fecha: fechaPagoDate,
      monto: montoPago,
      distribucion: {
        interes: resultado.interes,
        capital: resultado.capital,
        mora: resultado.mora,
        restoInteres: resultado.restoInteres,
        nuevoCapital: resultado.nuevoCapital,
        prestamoCompletado: resultado.prestamoCompletado,
        periodosPagados: resultado.periodosPagados,
        diasCubiertos: resultado.diasCubiertos
      },
      capitalAnterior: capitalAnterior,
      capitalNuevo: this.capitalRestante
    });
    
    this.fechaActualizacion = new Date();
    
    return resultado;
  }

  obtenerResumenDeuda(fechaReferencia = new Date()) {
    const fechaRef = this._stringToDate(fechaReferencia);
    const diasTranscurridos = this.calcularDiasDesdeUltimoPago(fechaRef);
    const interesAdeudado = this.calcularInteresPorDias(Math.min(diasTranscurridos, 30));
    
    const fechaProximo = this.fechaProximoPago ? this._stringToDate(this.fechaProximoPago) : null;
    const diasAtraso = fechaProximo 
      ? Math.max(0, Math.ceil((fechaRef - fechaProximo) / (1000 * 60 * 60 * 24)))
      : 0;
    const mora = this.calcularMora(diasAtraso, interesAdeudado);
    
    return {
      capitalRestante: this.capitalRestante,
      interesAdeudado,
      mora,
      totalAdeudado: interesAdeudado + mora,
      diasTranscurridos,
      diasAtraso,
      enMora: this.estaEnMora(fechaRef),
      fechaProximoPago: this.fechaProximoPago,
      fechaUltimoPago: this.fechaUltimoPago,
      generarComision: this.generarComision,
      garanteID: this.garanteID,
      garanteNombre: this.garanteNombre,
      porcentajeComision: this.porcentajeComision
    };
  }

  estaEnMora(fechaReferencia = new Date()) {
    if (!this.configuracionMora?.enabled) return false;
    if (this.estado !== 'activo') return false;
    if (!this.fechaProximoPago) return false;
    
    const fechaRef = this._stringToDate(fechaReferencia);
    const fechaProximo = this._stringToDate(this.fechaProximoPago);
    const diasAtraso = Math.max(0, Math.ceil((fechaRef - fechaProximo) / (1000 * 60 * 60 * 24)));
    
    return diasAtraso > (this.configuracionMora.diasGracia || 3);
  }
}

module.exports = Prestamo;