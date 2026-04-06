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
    // NUEVOS CAMPOS DE COMISIÓN
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
    // Nuevos campos
    this.generarComision = generarComision;
    this.garanteID = garanteID;
    this.garanteNombre = garanteNombre;
    this.porcentajeComision = porcentajeComision;
  }

  _normalizarFecha(fecha) {
    if (!fecha) return null;
    if (fecha instanceof Date) return fecha;
    if (fecha.toDate) return fecha.toDate();
    if (fecha._seconds) return new Date(fecha._seconds * 1000);
    if (fecha.seconds) return new Date(fecha.seconds * 1000);
    return new Date(fecha);
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
        const fechaProximoActual = this.fechaProximoPago || this.fechaPrestamo;
        const fechaBaseProx = this._normalizarFecha(fechaProximoActual);
        const diaProx = fechaBaseProx.getDate();
        const mesProx = fechaBaseProx.getMonth();
        const añoProx = fechaBaseProx.getFullYear();
        
        console.log(`  Fecha de próximo pago actual: ${fechaBaseProx.toLocaleDateString()}, Día: ${diaProx}`);
        
        if (diaProx === 15) {
          const nuevaFecha = new Date(añoProx, mesProx, 30);
          console.log(`  → Siguiente fecha: 30 del mismo mes (${nuevaFecha.toLocaleDateString()})`);
          return nuevaFecha;
        } else {
          const nuevaFecha = new Date(añoProx, mesProx + 1, 15);
          console.log(`  → Siguiente fecha: 15 del mes siguiente (${nuevaFecha.toLocaleDateString()})`);
          return nuevaFecha;
        }
        
      case 'mensual':
        let diaPago = this.diaPagoPersonalizado || dia;
        let fechaMensual = new Date(año, mes + 1, diaPago);
        if (fechaMensual.getMonth() !== (mes + 1) % 12) {
          fechaMensual = new Date(año, mes + 2, 0);
        }
        console.log(`  → Mensual (día ${diaPago}): ${fechaMensual.toLocaleDateString()}`);
        return fechaMensual;
        
      case 'personalizado':
        if (this.fechasPersonalizadas && this.fechasPersonalizadas.length > 0) {
          const fechas = this.fechasPersonalizadas.map(f => this._normalizarFecha(f));
          fechas.sort((a, b) => a - b);
          for (const fechaPago of fechas) {
            if (fechaPago > fecha) {
              console.log(`  → Personalizado: ${fechaPago.toLocaleDateString()}`);
              return fechaPago;
            }
          }
          const primeraFecha = new Date(fechas[0]);
          primeraFecha.setFullYear(primeraFecha.getFullYear() + 1);
          console.log(`  → Personalizado (próximo año): ${primeraFecha.toLocaleDateString()}`);
          return primeraFecha;
        }
        const fechaDefault = new Date(fecha);
        fechaDefault.setDate(dia + 30);
        console.log(`  → Default (30 días): ${fechaDefault.toLocaleDateString()}`);
        return fechaDefault;
        
      default:
        const fechaDefault2 = new Date(fecha);
        fechaDefault2.setDate(dia + 30);
        return fechaDefault2;
    }
  }

  calcularDistribucionPago(montoPago, fechaPago = new Date()) {
    const fechaPagoDate = this._normalizarFecha(fechaPago);
    const diasTranscurridos = this.calcularDiasDesdeUltimoPago(fechaPagoDate);
    const interesAdeudado = this.calcularInteresPorDias(Math.min(diasTranscurridos, 30));
    
    const fechaBaseParaMora = this.fechaProximoPago || this.fechaPrestamo;
    const diasAtraso = fechaBaseParaMora 
      ? Math.max(0, Math.ceil((fechaPagoDate - this._normalizarFecha(fechaBaseParaMora)) / (1000 * 60 * 60 * 24)))
      : 0;
    const mora = this.calcularMora(diasAtraso, interesAdeudado);
    
    let distribucion = {
      interes: 0,
      capital: 0,
      mora: 0,
      restoInteres: 0,
      nuevoCapital: this.capitalRestante,
      prestamoCompletado: false,
      periodosPagados: 0,
      diasCubiertos: 0
    };
    
    let montoRestante = montoPago;
    
    if (montoRestante >= mora) {
      distribucion.mora = mora;
      montoRestante -= mora;
    } else {
      distribucion.mora = montoRestante;
      distribucion.restoInteres = interesAdeudado;
      return distribucion;
    }
    
    if (montoRestante >= interesAdeudado) {
      distribucion.interes = interesAdeudado;
      montoRestante -= interesAdeudado;
      
      const interesPeriodo = this.calcularInteresPeriodo();
      if (interesPeriodo > 0) {
        distribucion.periodosPagados = Math.floor(interesAdeudado / interesPeriodo);
      }
      distribucion.diasCubiertos = distribucion.periodosPagados * 
        (this.frecuencia === 'quincenal' ? 15 : 
         this.frecuencia === 'semanal' ? 7 : 
         this.frecuencia === 'diario' ? 1 : 30);
      
      if (montoRestante > 0 && this.capitalRestante > 0) {
        distribucion.capital = Math.min(montoRestante, this.capitalRestante);
        distribucion.nuevoCapital = this.capitalRestante - distribucion.capital;
        distribucion.prestamoCompletado = distribucion.nuevoCapital <= 0;
      }
    } else {
      distribucion.interes = montoRestante;
      distribucion.restoInteres = interesAdeudado - montoRestante;
    }
    
    return distribucion;
  }

  // Método para calcular la comisión del garante
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
    
    // Solo actualizar la fecha de próximo pago si se pagó interés
    if (resultado.interes > 0) {
      this.fechaProximoPago = this.calcularSiguienteFechaPago(fechaPagoDate);
      console.log(`✅ Nueva fecha de próximo pago calculada (se pagó interés): ${this.fechaProximoPago.toLocaleDateString()}`);
    } else {
      console.log(`⚠️ No se pagó interés, la fecha de próximo pago NO cambia: ${this.fechaProximoPago?.toLocaleDateString()}`);
    }
    
    console.log(`   Fecha base utilizada: ${fechaPagoDate.toLocaleDateString()}`);
    console.log(`   Interés pagado: ${resultado.interes}, Capital pagado: ${resultado.capital}`);
    
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
      // Información de comisión
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