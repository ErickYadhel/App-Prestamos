class Usuario {
  constructor({
    id,
    email,
    nombre,
    rol,
    activo = true,
    fechaCreacion = new Date(),
    fotoUrl = null
  }) {
    this.id = id;
    this.email = email;
    this.nombre = nombre;
    this.rol = rol; // 'admin', 'supervisor', 'solicitante', 'consultor'
    this.activo = activo;
    this.fechaCreacion = fechaCreacion;
    this.fotoUrl = fotoUrl;
  }

  static roles = {
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor', 
    SOLICITANTE: 'solicitante',
    CONSULTOR: 'consultor'
  };

  can(permission) {
    const permissions = {
      admin: ['all'],
      supervisor: ['read_all', 'create_solicitudes', 'view_reports'],
      solicitante: ['create_solicitudes', 'view_clientes'],
      consultor: ['view_dashboard', 'view_reports']
    };
    
    return permissions[this.rol]?.includes('all') || 
           permissions[this.rol]?.includes(permission);
  }
}

module.exports = Usuario;