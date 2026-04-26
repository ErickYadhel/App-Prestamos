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
  // FUNCIÓN CORREGIDA PARA NORMALIZAR FECHAS
  // Mantiene la fecha LOCAL sin conversión UTC
  // ============================================
  _normalizarFecha(fecha) {
    if (!fecha) return null;
    
    // Si ya es un objeto Date válido
    if (fecha instanceof Date && !isNaN(fecha.getTime())) {
      // Crear nueva fecha manteniendo el día local
      return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    }
    
    // Si es timestamp de Firestore
    if (fecha && typeof fecha === 'object') {
      if (fecha._seconds !== undefined) {
        const d = new Date(fecha._seconds * 1000);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }
      if (fecha.seconds !== undefined) {
        const d = new Date(fecha.seconds * 1000);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }
      if (fecha.toDate) {
        const d = fecha.toDate();
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }
    }
    
    // Si es string ISO
    if (typeof fecha === 'string') {
      // Intentar parsear como fecha local primero (YYYY-MM-DD)
      const parts = fecha.split('T')[0].split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (!isNaN(d.getTime())) return d;
      }
      const d = new Date(fecha);
      if (!isNaN(d.getTime())) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }
    }
    
    // Si es número (timestamp)
    if (typeof fecha === 'number') {
      const d = new Date(fecha);
      if (!isNaN(d.getTime())) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }
    }
    
    console.warn('⚠️ Fecha inválida:', fecha);
    return new Date();
  }

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
    const fechaBaseDate = this._normalizarFecha(fechaBase);
    const fechaRef = this._normalizarFecha(fechaReferencia);
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
    const fecha = this._normalizarFecha(fechaBase);
    if (!fecha) return new Date();
    
    const dia = fecha.getDate();
    const mes = fecha.getMonth();
    const año = fecha.getFullYear();
    
    console.log(`📅 Calculando siguiente fecha pago - Frecuencia: ${this.frecuencia}, Fecha base: ${fecha.toLocaleDateString()}, Día: ${dia}`);
    
    switch (this.frecuencia) {
      case 'diario':
        const fechaDiaria = new Date(fecha);
        fechaDiaria.setDate(dia + 1);
        console.log(`  → Diario: ${fechaDiaria.toLocaleDateString()}`);
        return fechaDiaria;
        
      case 'semanal':
        const fechaSemanal = new Date(fecha);
        fechaSemanal.setDate(dia + 7);
        console.log(`  → Semanal: ${fechaSemanal.toLocaleDateString()}`);
        return fechaSemanal;
        
      case 'quincenal':
        const fechaActualQuincenal = this.fechaProximoPago ? this._normalizarFecha(this.fechaProximoPago) : fecha;
        const diaActualQuincenal = fechaActualQuincenal.getDate();
        const mesActualQuincenal = fechaActualQuincenal.getMonth();
        const añoActualQuincenal = fechaActualQuincenal.getFullYear();
        
        console.log(`  Fecha de próximo pago actual: ${fechaActualQuincenal.toLocaleDateString()}, Día: ${diaActualQuincenal}`);
        
        if (diaActualQuincenal === 15) {
          const ultimoDia = new Date(añoActualQuincenal, mesActualQuincenal + 1, 0).getDate();
          const nuevaFecha = new Date(añoActualQuincenal, mesActualQuincenal, ultimoDia);
          console.log(`  → Quincenal: de 15 a ${ultimoDia} del mismo mes (${nuevaFecha.toLocaleDateString()})`);
          return nuevaFecha;
        } else {
          let mesSiguiente = mesActualQuincenal + 1;
          let añoSiguiente = añoActualQuincenal;
          if (mesSiguiente > 11) {
            mesSiguiente = 0;
            añoSiguiente++;
          }
          const nuevaFecha = new Date(añoSiguiente, mesSiguiente, 15);
          console.log(`  → Quincenal: de ${diaActualQuincenal} a 15 del mes siguiente (${nuevaFecha.toLocaleDateString()})`);
          return nuevaFecha;
        }
        
      case 'mensual':
        const fechaActualMensual = this.fechaProximoPago ? this._normalizarFecha(this.fechaProximoPago) : fecha;
        const diaActualMensual = fechaActualMensual.getDate();
        const mesActualMensual = fechaActualMensual.getMonth();
        const añoActualMensual = fechaActualMensual.getFullYear();
        
        console.log(`  Fecha de próximo pago actual: ${fechaActualMensual.toLocaleDateString()}, Día: ${diaActualMensual}`);
        
        let diaPagoMensual = this.diaPagoPersonalizado || diaActualMensual;
        let fechaMensual = new Date(añoActualMensual, mesActualMensual + 1, diaPagoMensual);
        
        if (fechaMensual.getMonth() !== (mesActualMensual + 1) % 12) {
          fechaMensual = new Date(añoActualMensual, mesActualMensual + 2, 0);
          console.log(`  → Mensual: día ${diaPagoMensual} no existe, ajustado al último día: ${fechaMensual.toLocaleDateString()}`);
        } else {
          console.log(`  → Mensual (día configurado ${diaPagoMensual}): ${fechaMensual.toLocaleDateString()}`);
        }
        return fechaMensual;
        
      case 'personalizado':
        if (this.fechasPersonalizadas && this.fechasPersonalizadas.length > 0) {
          const fechaReferencia = this.fechaProximoPago ? this._normalizarFecha(this.fechaProximoPago) : fecha;
          const fechas = this.fechasPersonalizadas.map(f => this._normalizarFecha(f));
          fechas.sort((a, b) => a - b);
          for (const fechaPago of fechas) {
            if (fechaPago > fechaReferencia) {
              console.log(`  → Personalizado: siguiente fecha programada ${fechaPago.toLocaleDateString()}`);
              return fechaPago;
            }
          }
          const primeraFecha = new Date(fechas[0]);
          primeraFecha.setFullYear(primeraFecha.getFullYear() + 1);
          console.log(`  → Personalizado: no hay más fechas, usando primera del próximo año: ${primeraFecha.toLocaleDateString()}`);
          return primeraFecha;
        }
        const fechaDefault = new Date(fecha);
        fechaDefault.setDate(dia + 30);
        console.log(`  → Personalizado (default): ${fechaDefault.toLocaleDateString()}`);
        return fechaDefault;
        
      default:
        const fechaDefault2 = new Date(fecha);
        fechaDefault2.setDate(dia + 30);
        return fechaDefault2;
    }
  }

  calcularDistribucionPago(montoPago, fechaPago = new Date()) {
    const fechaPagoDate = this._normalizarFecha(fechaPago);
    
    let diasTranscurridos = 0;
    let fechaBase = this.fechaUltimoPago || this.fechaPrestamo;
    
    if (fechaBase) {
      const fechaBaseDate = this._normalizarFecha(fechaBase);
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
      const fechaEsperada = this._normalizarFecha(fechaBaseParaMora);
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
    
    console.log(`💰 Calculando distribución del pago: RD$ ${montoPago.toFixed(2)}`);
    console.log(`   Días transcurridos: ${diasTranscurridos}`);
    console.log(`   Interés diario: RD$ ${interesDiario.toFixed(4)}`);
    console.log(`   Interés adeudado: RD$ ${interesAdeudado.toFixed(2)}`);
    console.log(`   Mora calculada: RD$ ${mora.toFixed(2)}`);
    console.log(`   Capital restante: RD$ ${this.capitalRestante.toFixed(2)}`);
    
    if (mora > 0 && montoRestante > 0) {
      moraAplicada = Math.min(montoRestante, mora);
      montoRestante -= moraAplicada;
      console.log(`   ✅ Mora aplicada: RD$ ${moraAplicada.toFixed(2)}, Restante: RD$ ${montoRestante.toFixed(2)}`);
    }
    
    if (montoRestante > 0) {
      interesAplicado = Math.min(montoRestante, interesAdeudado);
      montoRestante -= interesAplicado;
      
      console.log(`   ✅ Interés aplicado: RD$ ${interesAplicado.toFixed(2)}, Restante: RD$ ${montoRestante.toFixed(2)}`);
      
      if (interesAplicado < interesAdeudado) {
        restoInteres = interesAdeudado - interesAplicado;
        console.log(`   ⚠️ Interés incompleto! Pendiente: RD$ ${restoInteres.toFixed(2)}`);
      }
    } else {
      restoInteres = interesAdeudado;
      console.log(`   ⚠️ No hay dinero para interés después de mora. Pendiente: RD$ ${restoInteres.toFixed(2)}`);
    }
    
    if (montoRestante > 0 && restoInteres === 0) {
      capitalAplicado = Math.min(montoRestante, this.capitalRestante);
      montoRestante -= capitalAplicado;
      console.log(`   ✅ Capital aplicado: RD$ ${capitalAplicado.toFixed(2)}, Restante: RD$ ${montoRestante.toFixed(2)}`);
    } else if (montoRestante > 0 && restoInteres > 0) {
      console.log(`   ⚠️ No se aplica a capital porque aún hay interés pendiente: RD$ ${restoInteres.toFixed(2)}`);
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
    
    console.log(`   📊 Resultado final:`);
    console.log(`      - Interés pagado: RD$ ${interesAplicado.toFixed(2)}`);
    console.log(`      - Mora pagada: RD$ ${moraAplicada.toFixed(2)}`);
    console.log(`      - Capital pagado: RD$ ${capitalAplicado.toFixed(2)}`);
    console.log(`      - Nuevo capital: RD$ ${nuevoCapital.toFixed(2)}`);
    console.log(`      - Interés pendiente: RD$ ${restoInteres.toFixed(2)}`);
    
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
    const fechaPagoDate = this._normalizarFecha(fechaPago);
    const resultado = distribucion || this.calcularDistribucionPago(montoPago, fechaPagoDate);
    
    const capitalAnterior = this.capitalRestante;
    
    this.capitalRestante = resultado.nuevoCapital;
    this.fechaUltimoPago = fechaPagoDate;
    
    if (resultado.interes > 0 && resultado.restoInteres === 0) {
      this.fechaProximoPago = this.calcularSiguienteFechaPago(fechaPagoDate);
      console.log(`✅ Nueva fecha de próximo pago calculada (se pagó interés completo): ${this.fechaProximoPago.toLocaleDateString()}`);
    } else if (resultado.interes > 0 && resultado.restoInteres > 0) {
      console.log(`⚠️ Se pagó interés parcial (RD$ ${resultado.interes.toFixed(2)}), pero no es suficiente. Fecha de próximo pago NO cambia.`);
      console.log(`   Pendiente: RD$ ${resultado.restoInteres.toFixed(2)}`);
    } else {
      console.log(`⚠️ No se pagó interés, la fecha de próximo pago NO cambia: ${this.fechaProximoPago?.toLocaleDateString()}`);
    }
    
    if (this.capitalRestante <= 0) {
      this.estado = 'completado';
    } else if (this.configuracionMora?.enabled && this.fechaProximoPago) {
      const diasAtraso = Math.max(0, Math.ceil((new Date() - this._normalizarFecha(this.fechaProximoPago)) / (1000 * 60 * 60 * 24)));
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
    const fechaRef = this._normalizarFecha(fechaReferencia);
    const diasTranscurridos = this.calcularDiasDesdeUltimoPago(fechaRef);
    const interesAdeudado = this.calcularInteresPorDias(Math.min(diasTranscurridos, 30));
    
    const diasAtraso = this.fechaProximoPago 
      ? Math.max(0, Math.ceil((fechaRef - this._normalizarFecha(this.fechaProximoPago)) / (1000 * 60 * 60 * 24)))
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
    const fechaRef = this._normalizarFecha(fechaReferencia);
    const diasAtraso = Math.max(0, Math.ceil((fechaRef - this._normalizarFecha(this.fechaProximoPago)) / (1000 * 60 * 60 * 24)));
    return diasAtraso > (this.configuracionMora.diasGracia || 3);
  }
}

module.exports = Prestamo;