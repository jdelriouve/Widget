<template>
  <div class="renting-sdk-container">
    <template v-if="(showEmpresa || showParticular) && showProduct">
      <div class="renting-sdk-customer-type-toggle">
        <div class="renting-sdk-toggle-wrapper" :class="{ 'renting-sdk-single': !showEmpresa || !showParticular }">
          <template v-if="showEmpresa && showParticular">
            <button class="renting-sdk-toggle-btn" :class="{ 'renting-sdk-active': customerType === 'empresa' }"
              @click="customerType = 'empresa'">
              Empresa
            </button>
            <button class="renting-sdk-toggle-btn" :class="{ 'renting-sdk-active': customerType === 'particular' }"
              @click="customerType = 'particular'">
              Particular
            </button>
          </template>
          <template v-else>
            <button class="renting-sdk-toggle-btn renting-sdk-active" disabled>
              {{ showEmpresa ? 'Empresa' : 'Particular' }}
            </button>
          </template>
        </div>
      </div>

      <div class="renting-sdk-duration-selector">
        <div class="renting-sdk-duration-title">
          <h3>Elige la duración de tu renting (en meses):</h3>
        </div>

        <div class="renting-sdk-content-wrapper">
          <div class="renting-sdk-months-container">
            <VChipGroup v-model="selectedMonth" class="renting-sdk-months-chip-group" mandatory>
              <template v-for="(option, i) in chipOptions" :key="i">
                <div class="renting-sdk-chip-wrapper">
                  <VChip :value="option" class="renting-sdk-month-chip"
                    :class="{ 'renting-sdk-chip-active': selectedMonth?.months === option.months }">
                    {{ option.months }}
                  </VChip>
                  <div class="renting-sdk-dot"
                    :class="{ 'renting-sdk-dot-active': selectedMonth?.months === option.months }" />
                </div>
              </template>
            </VChipGroup>
          </div>

          <div class="renting-sdk-price-section">
            <div class="renting-sdk-price-amount">{{ currentPrice }} €</div>
            <div class="renting-sdk-price-details">
              al mes durante <span class="renting-sdk-highlight">{{ currentMonths }} meses</span>. Impuestos incluidos
            </div>
            <a href="#" class="renting-sdk-conditions-link">
              Ver condiciones del producto ↗
            </a>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="renting-sdk-no-options">
        <p>No hay opciones de renting para este producto.</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { VChip, VChipGroup } from 'vuetify/components'

const props = defineProps({
  sku: String,
  price: Number,
  packType: String,
  category: {
    type: String,
    default: 'desktop'
  }
})

const store = useStore()

const customerType = ref('particular')
const selectedMonth = ref(null)

const calculatedInstallments = ref([])
const particularInstallments = ref([])

const showEmpresa = ref(false)
const showParticular = ref(false)
const showProduct = ref(false)

const chipOptions = computed(() => {
  if (customerType.value === 'empresa' && calculatedInstallments.value.length) {
    return calculatedInstallments.value.map(item => ({
      months: item.term,
      calculatedPrice: item.installment,
      type: 'calculated'
    }))
  }

  if (customerType.value === 'particular' && particularInstallments.value.length) {
    return particularInstallments.value
  }

  return []
})

const currentPrice = computed(() => {
  if (!selectedMonth.value) return '0,00'

  let price
  if (customerType.value === 'empresa' && selectedMonth.value.type === 'calculated') {
    price = selectedMonth.value.calculatedPrice
  } else {
    price = selectedMonth.value.priceParticular
  }

  return price !== undefined ? price.toFixed(2).replace('.', ',') : '0,00'
})

const currentMonths = computed(() => {
  return selectedMonth.value?.months || 0
})

const selectedProduct = computed(() => {
  return {
    [props.category]: {
      price: props.price,
      quantity: 1,
      packType: "basic"
    }
  }
})

const fetchParticularData = async () => {
  const sku = props.sku
  const moduleNames = Object.keys(store.state || {})
  let moduleName = null

  for (const name of moduleNames) {
    if (store.state[name] && 'marketProductSku' in store.state[name]) {
      moduleName = name
      break
    }
  }
  if (moduleName) {
    try {
      const productSkuData = await store.dispatch(`${moduleName}/getMarketProductSku`, sku)
      if (productSkuData?.data) {
        const { active: isActive, activeb2b, activeb2c } = productSkuData.data
        showProduct.value = !!isActive
        showEmpresa.value = !!activeb2b
        showParticular.value = !!activeb2c

        if (activeb2b && !activeb2c) {
          customerType.value = 'empresa'
        } else if (!activeb2b && activeb2c) {
          customerType.value = 'particular'
        }
      }
      if (showParticular.value) {
        const response = await store.dispatch(`${moduleName}/getMarketProductsBySku`, sku)
        const productData = response?.data?.['hydra:member']?.[0]

        if (productData?.installment?.length) {
          const flatInstallments = productData.installment.flat()
          particularInstallments.value = flatInstallments.map(i => ({
            months: i.months,
            priceParticular: i.installment,
            type: 'dynamic'
          }))
          selectedMonth.value = particularInstallments.value.at(-1)
        } else {
          particularInstallments.value = []
          selectedMonth.value = null
        }
      }
    } catch (e) {
      console.error('Error fetching market product data:', e)
    }
  }
}


watch(customerType, async (newType) => {
  const moduleNames = Object.keys(store.state || {})
  let moduleName = null

  for (const name of moduleNames) {
    if (store.state[name] && 'installments' in store.state[name]) {
      moduleName = name
      break
    }
  }

  if (newType === 'empresa') {
    try {
      const response = await store.dispatch(`${moduleName}/postInstallments`, selectedProduct.value)
      if (Array.isArray(response.data) && response.data.length) {
        calculatedInstallments.value = response.data
        const maxTerm = Math.max(...response.data.map(i => i.term))
        const maxInstallment = response.data.find(i => i.term === maxTerm)
        selectedMonth.value = {
          months: maxInstallment.term,
          calculatedPrice: maxInstallment.installment,
          type: 'calculated'
        }
      } else {
        calculatedInstallments.value = []
        selectedMonth.value = null
      }
    } catch (error) {
      selectedMonth.value = null
    }
  } else {
    selectedMonth.value = null
    await fetchParticularData()
  }
}, { immediate: true })
</script>

<style scoped>
.renting-sdk-container :deep(.v-chip--variant-tonal .v-chip__underlay:not(.v-chip--selected)) {
  background-color: transparent !important;
}

.renting-sdk-container :deep(.v-chip-group .v-chip) {
  margin: 0 !important;
}

.renting-sdk-container :deep(.v-theme--light.v-chip:not(.v-chip--selected)) {
  background: white !important;
  box-shadow: 0 1px 4px 0 rgba(35, 23, 74, 0.1) !important;
  color: #ff6b35 !important;
  width: 48px !important;
  height: 48px !important;
  border-radius: 26px !important;
  text-align: center !important;
  font-family: "DM Sans", sans-serif !important;
  font-size: 18px !important;
  font-weight: 500 !important;
  letter-spacing: 0.09px !important;
  line-height: 24px !important;
}

.renting-sdk-container :deep(.v-chip .v-chip__content) {
  align-items: center !important;
  display: inline-flex !important;
  height: 100% !important;
  max-width: 100% !important;
  text-align: center !important;
  justify-content: center !important;
  width: 48px !important;
  right: 0 !important;
  left: 0 !important;
  position: relative !important;
}

.renting-sdk-container :deep(.v-slide-group__content) {
  gap: 8px !important;
}

.renting-sdk-container :deep(.v-chip.v-chip--selected.renting-sdk-month-chip),
.renting-sdk-month-chip.renting-sdk-chip-active,
.renting-sdk-container :deep(.v-chip-group .v-chip.v-chip--selected) {
  background: #ff6b35 !important;
  color: white !important;
}

@media only screen and (max-width: 370px) {
  .renting-sdk-container :deep(span.v-chip.v-chip--clickable.v-chip--no-color.v-theme--light.v-size--default) {
    margin: auto 6px 6px 0 !important;
  }
}

.renting-sdk-no-options {
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #666;
}
</style>