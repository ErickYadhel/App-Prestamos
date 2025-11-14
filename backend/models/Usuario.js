class Usuario {
  constructor({
    id = null,
    email,
    nombre,
    password = null, // NUEVO CAMPO
    rol = 'consultor',
    activo = true,
    fechaCreacion = new Date(),
    fechaActualizacion = null,
    ultimoAcceso = null,
    telefono = '',
    departamento = '',
    fotoUrl = null
  }) {
    this.id = id;
    this.email = email;
    this.nombre = nombre;
    this.password = password; // NUEVO CAMPO
    this.rol = rol;
    this.activo = activo;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
    this.ultimoAcceso = ultimoAcceso;
    this.telefono = telefono;
    this.departamento = departamento;
    this.fotoUrl = fotoUrl;
  }

  validar() {
    const errors = [];
    
    if (!this.email || !/\S+@\S+\.\S+/.test(this.email)) {
      errors.push('El email es obligatorio y debe tener un formato válido');
    }
    
    if (!this.nombre || this.nombre.trim().length < 2) {
      errors.push('El nombre es obligatorio y debe tener al menos 2 caracteres');
    }
    
    // Validar contraseña solo si se está creando un nuevo usuario
    if (!this.id && (!this.password || this.password.length < 6)) {
      errors.push('La contraseña es obligatoria y debe tener al menos 6 caracteres');
    }
    
    const rolesValidos = ['admin', 'supervisor', 'solicitante', 'consultor'];
    if (!this.rol || !rolesValidos.includes(this.rol)) {
      errors.push(`El rol es obligatorio y debe ser uno de: ${rolesValidos.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    return true;
  }

  puede(permiso) {
    const permisos = {
      admin: ['all'],
      supervisor: ['read_all', 'create_solicitudes', 'view_reports', 'manage_clientes', 'view_usuarios'],
      solicitante: ['create_solicitudes', 'view_clientes', 'view_own_data'],
      consultor: ['view_dashboard', 'view_reports', 'view_own_data']
    };

    return permisos[this.rol]?.includes('all') || 
           permisos[this.rol]?.includes(permiso);
  }

  static roles = {
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    SOLICITANTE: 'solicitante',
    CONSULTOR: 'consultor'
  };
}

module.exports = Usuario;