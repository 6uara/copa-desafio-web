'use strict';
// Service worker de Copa Desafío: muestra los avisos (notificaciones push) aunque la app esté cerrada.
// No guarda archivos en caché ni intercepta pedidos: la app se actualiza como cualquier página.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()));

// Cada push tiene que mostrar una notificación: si no, el navegador puede cancelar la suscripción.
self.addEventListener('push', (evento) => {
	let datos = {};
	try {
		datos = evento.data ? evento.data.json() : {};
	} catch (e) {
		datos = { cuerpo: evento.data ? evento.data.text() : '' };
	}
	const opciones = {
		body: datos.cuerpo || '',
		icon: 'icono-180.png',
		badge: 'icono-180.png',
		lang: 'es',
		data: { url: self.registration.scope },
	};
	// Con la misma etiqueta, el aviso nuevo reemplaza al anterior en vez de apilarse.
	if (datos.etiqueta) {
		opciones.tag = datos.etiqueta;
		opciones.renotify = true;
	}
	evento.waitUntil(self.registration.showNotification(datos.titulo || 'Copa Desafío', opciones));
});

// Al tocar el aviso se abre la app (o se trae al frente si ya estaba abierta).
self.addEventListener('notificationclick', (evento) => {
	evento.notification.close();
	const url = (evento.notification.data && evento.notification.data.url) || self.registration.scope;
	evento.waitUntil((async () => {
		const abiertas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
		for (const c of abiertas) {
			if (c.url.startsWith(self.registration.scope) && 'focus' in c) return c.focus();
		}
		return self.clients.openWindow(url);
	})());
});
