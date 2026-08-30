class Usuario {
  constructor({
    id = null,
    email,
    nombre,
    rol = 'consultor',
    activo = true,
    fechaCreacion = new Date(),
    fechaActualizacion = null,
    ultimoAcceso = null,
    telefono = '',
    departamento = '',
    fotoUrl = null,
    // ✅ ELIMINADO: password = null, // NUNCA almacenar contraseñas en Firestore
  }) {
    this.id = id;
    this.email = email;
    this.nombre = nombre;
    // ❌ ELIMINADO: this.password = password;
    this.rol = rol;
    this.activo = activo;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
    this.ultimoAcceso = ultimoAcceso;
    this.telefono = telefono;
    this.departamento = departamento;
    this.fotoUrl = fotoUrl;
  }

  /**
   * Validar datos del usuario ANTES de guardar en Firestore
   * @throws {Error} Si hay errores de validación
   */
  validar() {
    const errors = [];
    
    // Validar email (obligatorio y formato válido)
    if (!this.email || !/\S+@\S+\.\S+/.test(this.email)) {
      errors.push('El email es obligatorio y debe tener un formato válido');
    }
    
    // Validar nombre (obligatorio y mínimo 2 caracteres)
    if (!this.nombre || this.nombre.trim().length < 2) {
      errors.push('El nombre es obligatorio y debe tener al menos 2 caracteres');
    }
    
    // Validar rol (debe ser uno de los permitidos)
    const rolesValidos = ['admin', 'supervisor', 'solicitante', 'consultor'];
    if (!this.rol || !rolesValidos.includes(this.rol)) {
      errors.push(`El rol es obligatorio y debe ser uno de: ${rolesValidos.join(', ')}`);
    }

    // Validar teléfono (opcional pero con formato válido si existe)
    if (this.telefono && !/^[0-9+\-\s()]{7,15}$/.test(this.telefono)) {
      errors.push('El teléfono debe tener un formato válido (ej: +1 809-555-1212)');
    }

    // Validar departamento (opcional)
    if (this.departamento && this.departamento.length > 100) {
      errors.push('El departamento no puede tener más de 100 caracteres');
    }

    // Validar fotoUrl (opcional pero debe ser URL válida si existe)
    if (this.fotoUrl && !/^https?:\/\/.+/.test(this.fotoUrl)) {
      errors.push('La URL de la foto debe ser una URL válida');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    return true;
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   * @param {string} permiso - Permiso a verificar
   * @returns {boolean} - True si tiene el permiso
   */
  puede(permiso) {
    // Tabla de permisos por rol (centralizada para fácil mantenimiento)
    const permisosPorRol = {
      admin: ['all'],
      supervisor: [
        'read_all',
        'create_solicitudes',
        'view_reports',
        'manage_clientes',
        'view_usuarios',
        'manage_usuarios',
        'manage_prestamos',
        'manage_pagos'
      ],
      solicitante: [
        'create_solicitudes',
        'view_clientes',
        'view_own_data',
        'view_own_prestamos'
      ],
      consultor: [
        'view_dashboard',
        'view_reports',
        'view_own_data',
        'view_clientes'
      ]
    };

    const permisos = permisosPorRol[this.rol] || [];
    
    // Si tiene 'all', tiene acceso a todo
    if (permisos.includes('all')) {
      return true;
    }

    // Verificar permiso específico
    return permisos.includes(permiso);
  }

  /**
   * Convertir usuario a objeto plano para Firestore
   * (Excluye datos sensibles)
   * @returns {Object} - Objeto seguro para almacenar
   */
  toFirestore() {
    return {
      email: this.email,
      nombre: this.nombre,
      rol: this.rol,
      activo: this.activo,
      fechaCreacion: this.fechaCreacion instanceof Date ? this.fechaCreacion.toISOString() : this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion instanceof Date ? this.fechaActualizacion.toISOString() : this.fechaActualizacion,
      ultimoAcceso: this.ultimoAcceso instanceof Date ? this.ultimoAcceso.toISOString() : this.ultimoAcceso,
      telefono: this.telefono || '',
      departamento: this.departamento || '',
      fotoUrl: this.fotoUrl || null
      // ❌ NUNCA incluir password en Firestore
    };
  }

  /**
   * Crear usuario desde datos de Firestore
   * @param {Object} data - Datos desde Firestore
   * @param {string} id - ID del documento
   * @returns {Usuario} - Instancia de Usuario
   */
  static fromFirestore(data, id) {
    return new Usuario({
      id: id || data.id,
      email: data.email,
      nombre: data.nombre,
      rol: data.rol || 'consultor',
      activo: data.activo !== undefined ? data.activo : true,
      fechaCreacion: data.fechaCreacion ? new Date(data.fechaCreacion) : new Date(),
      fechaActualizacion: data.fechaActualizacion ? new Date(data.fechaActualizacion) : null,
      ultimoAcceso: data.ultimoAcceso ? new Date(data.ultimoAcceso) : null,
      telefono: data.telefono || '',
      departamento: data.departamento || '',
      fotoUrl: data.fotoUrl || null
    });
  }

  /**
   * Obtener objeto seguro para respuesta API
   * (Excluye datos sensibles)
   * @returns {Object} - Datos seguros para enviar al cliente
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      nombre: this.nombre,
      rol: this.rol,
      activo: this.activo,
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion,
      ultimoAcceso: this.ultimoAcceso,
      telefono: this.telefono,
      departamento: this.departamento,
      fotoUrl: this.fotoUrl
      // ❌ NUNCA incluir password en respuestas API
    };
  }

  // ============================================
  // ROLES ESTÁTICOS
  // ============================================

  static roles = {
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    SOLICITANTE: 'solicitante',
    CONSULTOR: 'consultor'
  };

  /**
   * Obtener lista de roles válidos
   * @returns {string[]} - Array de roles
   */
  static getRolesValidos() {
    return Object.values(this.roles);
  }

  /**
   * Verificar si un rol es válido
   * @param {string} rol - Rol a verificar
   * @returns {boolean} - True si es válido
   */
  static esRolValido(rol) {
    return this.getRolesValidos().includes(rol);
  }

  /**
   * Obtener permisos de un rol específico
   * @param {string} rol - Rol del usuario
   * @returns {string[]} - Array de permisos
   */
  static getPermisosPorRol(rol) {
    const permisosPorRol = {
      admin: ['all'],
      supervisor: [
        'read_all',
        'create_solicitudes',
        'view_reports',
        'manage_clientes',
        'view_usuarios',
        'manage_usuarios',
        'manage_prestamos',
        'manage_pagos'
      ],
      solicitante: [
        'create_solicitudes',
        'view_clientes',
        'view_own_data',
        'view_own_prestamos'
      ],
      consultor: [
        'view_dashboard',
        'view_reports',
        'view_own_data',
        'view_clientes'
      ]
    };

    return permisosPorRol[rol] || [];
  }
}

module.exports = Usuario;