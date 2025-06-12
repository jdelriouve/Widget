import HTTP from "../../utils/http-common";
const state = {
  partner:'',
  installments: [],
  marketProductSku: [],
  marketProductsSku: [],
}
const getters = {};
const actions = {
    async getPartnerCode({ commit }, data) {
        let endPoint = "/api/v1/partners" + data;
        try {
          const response = await HTTP.get(endPoint);
          const isError = response instanceof Error;
          if (!isError) {
            commit("GET_PARTNER", { data: response.data });
            return response;
          } else {
            return response;
          }
        } catch (error) {
          return error.response;
        }
      },
      async getMarketProductSku({ commit }, data) {
        let endPoint = "/api/v1/open-market-product/" + data;
        try {
          const response = await HTTP.get(endPoint);
          const isError = response instanceof Error;
          if (!isError) {
            commit("GET_MARKET_PRODUCT_SKU", { data: response.data });
            return response;
          } else {
            return response;
          }
        } catch (error) {
          return error.response;
        }
      },
      async getMarketProductsBySku({ commit }, data) {
        let endPoint = "/api/v1/open-market-products?skuRetailer=" + data;
        try {
          const response = await HTTP.get(endPoint);
          const isError = response instanceof Error;
          if (!isError) {
            commit("GET_MARKET_PRODUCTS_SKU", { data: response.data });
            return response;
          } else {
            return response;
          }
        } catch (error) {
          return error.response;
        }
      },
      async postInstallments({ commit }, data) {
        let endPoint = 'api/v1/b2b-installments'
        try {
          const response = await HTTP.post(endPoint, data)
          const isError = response instanceof Error
          if (!isError) {
            commit('GET_INSTALLMENT', { data: response.data })
            return response
          } else {
            return response;
          }
        } catch (error) {
          return error.response;
        }
      },
}
const mutations = {
  GET_PARTNER(state, actions) {
    state.partner = actions.data;
  },
  GET_INSTALLMENT(state, actions) {
    state.installments = actions.data;
  },
  GET_MARKET_PRODUCT_SKU(state, actions) {
    state.marketProductSku = actions.data;
  },
  GET_MARKET_PRODUCTS_SKU(state, actions) {
    state.marketProductsSku = actions.data;
  }
}
export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
  };