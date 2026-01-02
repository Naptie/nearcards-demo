import { writable } from 'svelte/store';

export interface Notification {
	id: number;
	message: string;
	type: 'info' | 'success' | 'warning' | 'error';
	duration: number;
}

export const notifications = writable<Notification[]>([]);

let nextId = 1;

export function showNotification(
	message: string,
	type: 'info' | 'success' | 'warning' | 'error' = 'info',
	duration: number = 3000
) {
	const id = nextId++;
	const notification: Notification = { id, message, type, duration };

	notifications.update(n => [...n, notification]);

	setTimeout(() => {
		notifications.update(n => n.filter(notif => notif.id !== id));
	}, duration);
}
