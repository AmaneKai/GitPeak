<div class="dashboard fade-in-up">
  <div class="col">
    <div class="glass rounded-2xl p-4 sm:p-6 flex items-start gap-3 sm:gap-5 overflow-hidden">
      <div class="shimmer w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl"></div>
      <div class="flex flex-col gap-2.5 flex-1 pt-1">
        <div class="shimmer h-6 w-40 rounded-lg"></div>
        <div class="shimmer h-3 w-full rounded-md opacity-60"></div>
        <div class="shimmer h-3 w-2/3 rounded-md opacity-60"></div>
      </div>
    </div>
    <div class="flex flex-col gap-3">
      <div class="grid grid-cols-2 gap-3">
        {#each [0, 1] as i}
          <div
            class="shimmer rounded-2xl h-24"
            style="background:color-mix(in srgb, var(--surface) 60%, transparent);
                   border:1px solid color-mix(in srgb, var(--highlight-med) 10%, transparent);
                   animation-delay:{i * 60}ms"
          ></div>
        {/each}
      </div>
      <div class="grid grid-cols-3 gap-2 sm:gap-2.5">
        {#each [0, 1, 2, 3, 4, 5] as i}
          <div
            class="shimmer rounded-[14px] h-20"
            style="background:color-mix(in srgb, var(--surface) 60%, transparent);
                   border:1px solid color-mix(in srgb, var(--highlight-med) 10%, transparent);
                   animation-delay:{i * 60}ms"
          ></div>
        {/each}
      </div>
    </div>
  </div>
  <div class="col">
    <div class="glass rounded-2xl overflow-hidden">
      <div class="p-4 sm:p-5 pb-0">
        <div class="flex items-center gap-2">
          <div class="shimmer h-2.5 w-20 rounded-md"></div>
          <div class="flex-1 h-px" style="background:color-mix(in srgb, var(--subtle) 10%, transparent)"></div>
          <div class="shimmer h-5 w-14 rounded-full"></div>
        </div>
      </div>
      <div class="p-4 sm:p-5 pt-4">
        <div class="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          <div class="shimmer shrink-0 rounded-full w-[160px] h-[160px] sm:w-[200px] sm:h-[200px]"></div>
          <div class="flex flex-col gap-0.5 w-full">
            {#each [0, 1, 2, 3, 4] as i}
              <div class="flex items-center gap-2 py-1 px-1.5" style="animation-delay:{i * 60}ms">
                <div class="shimmer w-6 h-6 rounded-md shrink-0"></div>
                <div class="shimmer h-3 flex-1 rounded-md"></div>
                <div class="shimmer h-[3px] w-[60px] rounded-full"></div>
                <div class="shimmer h-2.5 w-7 rounded-full"></div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
    <div class="glass rounded-2xl overflow-hidden">
      <div class="p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col gap-2 flex-1">
            <div class="shimmer h-2 w-28 rounded-md"></div>
            <div class="shimmer h-5 w-40 rounded-lg"></div>
            <div class="shimmer h-6 w-20 rounded-lg mt-1"></div>
          </div>
          <div class="shimmer w-8 h-8 rounded-xl shrink-0"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .dashboard {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    touch-action: pan-y pinch-zoom;
  }
  @media (min-width: 860px) {
    .dashboard { grid-template-columns: 1.05fr 1fr; align-items: start; }
  }
  .col { display: flex; flex-direction: column; gap: 14px; touch-action: pan-y; }
  @media (max-width: 640px) {
    .dashboard { gap: 12px; }
    .col { gap: 12px; }
  }
</style>
