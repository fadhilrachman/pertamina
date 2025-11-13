<template>
  <nav
    class="w-full bg-white border-b px-8 h-[60px] flex items-center justify-end"
  >
    <div class="flex items-center space-x-4">
      <GeneralTextInput
        class="w-[400px] placeholder:text-neutral-400"
        :clearable="true"
        placeholder="Search SKU, Warehouse, or Transaction..."
      />
      <div class="flex items-center space-x-4">
        <IconsBell size="18" class="stroke-neutral-600" />
        <div
          class="bg-blue-600 h-9 w-9 rounded-full flex items-center justify-center"
        >
          <IconsUser size="18" class="stroke-white" />
        </div>
      </div>
    </div>
  </nav>
</template>
