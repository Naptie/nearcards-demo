<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";

  onMount(async () => {
    // Initialize Preline
    if (typeof window !== "undefined") {
      await import("preline/preline");
      // @ts-ignore
      window.HSStaticMethods.autoInit();
    }
  });
</script>

<slot />
