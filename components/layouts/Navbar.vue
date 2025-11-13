<template>
  <nav
    class="fixed w-full z-0 bg-white border-b px-8 h-[60px] flex items-center justify-between"
  >
    <h3 class="font-semibold ml-[18.5%] text-gray-900">
      Inventory Management System
    </h3>
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
