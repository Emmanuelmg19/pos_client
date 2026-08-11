<script setup>
import AppLayout from '../layouts/AppLayout.vue'

const modulos = [
  { to: '/productos', nombre: 'Productos', desc: 'Catálogo — Node / MongoDB' },
  { to: '/inventario', nombre: 'Inventario', desc: 'Stock por producto — Laravel / PostgreSQL' },
  { to: '/clientes', nombre: 'Clientes', desc: 'Alta y edición de clientes' },
  { to: '/ventas', nombre: 'Ventas', desc: 'Carrito y registro de transacciones' },
  { to: '/reportes', nombre: 'Reportes', desc: 'Resumen y exportación CSV' },
]
</script>

<template>
  <AppLayout>
    <div class="page-header">
      <h1>Dashboard</h1>
      <p style="color: var(--ink-muted);">Sesión iniciada correctamente.</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px;">
      <router-link
        v-for="m in modulos"
        :key="m.to"
        :to="m.to"
        class="card"
        style="text-decoration: none; color: inherit; display: block;"
      >
        <h2 style="margin-bottom: 8px;">{{ m.nombre }}</h2>
        <p style="margin: 0; font-size: 13px; color: var(--ink-muted);">{{ m.desc }}</p>
      </router-link>
    </div>
  </AppLayout>
</template>
