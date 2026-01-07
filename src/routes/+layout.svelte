<script lang="ts">
  import "../app.css";
  import { onMount, onDestroy } from "svelte";
  import { initSerialListener } from "$lib/serial";

  onMount(async () => {
    // Initialize Serial Listener
    await initSerialListener();

    // Initialize Preline
    if (typeof window !== "undefined") {
      await import("preline/preline");
      // @ts-ignore
      window.HSStaticMethods.autoInit();
    }
  });
</script>

<slot />
