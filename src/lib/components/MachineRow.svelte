<script lang="ts">
import type { Machine, Queue } from '$lib/stores/queueStore';
import { moveToEndOfQueue, updateSessionMode } from '$lib/stores/queueStore';
import SessionSlot from './SessionSlot.svelte';

export let machine: Machine;
export let queue: Queue;

let editingSessionId: string | null = null;

function handleDoubleClick(sessionId: string) {
editingSessionId = sessionId;
}
</script>

<div class="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300">
<div class="card-body p-6">
<div class="flex items-center gap-4 mb-4">
<!-- Machine Icon -->
<div class="w-16 h-16 flex items-center justify-center text-4xl bg-primary rounded-2xl shadow-lg">
{machine.icon}
</div>

<!-- Machine Info -->
<div class="flex-1">
<h3 class="card-title font-sans text-2xl">{machine.name}</h3>
<div class="text-sm opacity-70">
{queue.sessions.length} session{queue.sessions.length !== 1 ? 's' : ''}
{#if machine.seats > 1}
<span class="badge badge-accent badge-sm ml-2">{machine.seats} seats</span>
{/if}
</div>
</div>
</div>

<!-- Queue Display -->
<div class="divider my-2"></div>

{#if queue.sessions.length === 0}
<div class="text-center text-base-content/50 italic py-8">No sessions in queue</div>
{:else}
<div class="flex items-center gap-3 overflow-x-auto pb-2">
{#each queue.sessions as session (session.id)}
<SessionSlot
{session}
onLongPress={() => {
if (session.playerSlots.length > 0) {
moveToEndOfQueue(session.playerSlots[0], machine.id);
}
}}
onDoubleClick={() => handleDoubleClick(session.id)}
/>
{/each}
</div>
{/if}
</div>
</div>

<style>
:global(.card) {
animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
from {
opacity: 0;
transform: translateY(20px);
}
to {
opacity: 1;
transform: translateY(0);
}
}
</style>
