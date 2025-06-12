<template>
  <div class="widget-wrapper">
    <QuotaWidget :sku="sku" />
  </div>
</template>

<script setup>
import QuotaWidget from './views/quotaWidget.vue'

defineProps({
  sku: {
    type: String,
    required: true
  }
})
</script>

<style>
@import "https://cdn.jsdelivr.net/npm/vuetify@3.3.19/dist/vuetify.min.css";
@import "./assets/css/style.css";
.widget-wrapper{
  margin-top: 20px;
}
</style>
