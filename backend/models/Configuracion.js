class Configuracion {
  constructor({
    empresaNombre = 'EYS Inversiones',
    dueno = '',
    ubicacion = '',
    numero = '',
    correo = '',
    logoUrl = '',
    moneda = 'DOP',
    capitalDisponible = 0,
    tipoCarga = 'manual',
    monedasDisponibles = ['DOP'],
    backupFolder = '',
    sesionTiempo = 60,
    fechaHoraModificacion = new Date(),
    colores = {
      primario: '#DC2626',
      secundario: '#000000'
    }
  }) {
    this.empresaNombre = empresaNombre;
    this.dueno = dueno;
    this.ubicacion = ubicacion;
    this.numero = numero;
    this.correo = correo;
    this.logoUrl = logoUrl;
    this.moneda = moneda;
    this.capitalDisponible = capitalDisponible;
    this.tipoCarga = tipoCarga;
    this.monedasDisponibles = monedasDisponibles;
    this.backupFolder = backupFolder;
    this.sesionTiempo = sesionTiempo;
    this.fechaHoraModificacion = fechaHoraModificacion;
    this.colores = colores;
  }
}

module.exports = Configuracion;