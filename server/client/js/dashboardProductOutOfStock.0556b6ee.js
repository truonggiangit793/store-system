"use strict";(self["webpackChunkstore_system"]=self["webpackChunkstore_system"]||[]).push([[720],{2954:function(t,a,s){s.r(a),s.d(a,{default:function(){return m}});var e=function(){var t=this,a=t._self._c;return a("main",[a("Loading",{attrs:{active:t.isLoading,"is-full-page":!0,"can-cancel":!1}}),a("div",{staticClass:"flex items-center mb-4 text-green-700 font-bold text-lg uppercase"},[a("ThemifyIcon",{attrs:{icon:"menu"}}),a("h1",{staticClass:"ml-2"},[t._v("Out of stock")])],1),a("div",{staticClass:"mb-8"},[a("div",{staticClass:"mb-2 text-md font-medium text-gray-900 flex items-center"},[a("ThemifyIcon",{attrs:{icon:"settings"}}),a("p",{staticClass:"ml-2"},[t._v("Export out of stock into excel:")])],1),a("div",{staticClass:"flex justify-center items-center transition-all text-white w-80 py-2 text-center rounded",class:{"bg-blue-400 hover:bg-blue-500 cursor-pointer":t.productsData.length>0,"bg-gray-400 ":t.productsData.length<=0},on:{click:function(a){return t.exportHandler()}}},[a("ThemifyIcon",{attrs:{icon:"export"}}),a("button",{staticClass:"ml-2",attrs:{disabled:t.productsData.length<=0}},[t._v("Export")])],1)]),a("div",{staticClass:"mb-2 text-md font-medium text-gray-900 flex items-center"},[a("ThemifyIcon",{attrs:{icon:"settings"}}),a("p",{staticClass:"ml-2"},[t._v("Out of stock data list:")])],1),a("div",{staticClass:"overflow-x-auto relative"},[a("table",{staticClass:"overflow-scroll w-full text-sm text-left text-gray-500 dark:text-gray-400 mb-4"},[t._m(0),t.productsData&&t.productsData.length>0?a("tbody",t._l(t.productsData,(function(s,e){return a("tr",{key:e,staticClass:"bg-white border-b dark:bg-gray-800 dark:border-gray-700"},[a("th",{staticClass:"py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white",attrs:{scope:"row"}},[t._v(" "+t._s(s.barcode)+" ")]),a("td",{staticClass:"py-4 px-6"},[t._v(t._s(s.productName))]),a("td",{staticClass:"py-4 px-6"},[t._v(t._s(s.supplierName))]),a("td",{staticClass:"py-4 px-6"},[t._v(t._s(s.quantity))]),a("td",{staticClass:"py-4 px-6"},[t._v(t._s(t.priceFormat(s.unitCost)))]),a("td",{staticClass:"py-4 px-6"},[t._v(t._s(t.dateFormat(s.updatedAt)))])])})),0):t._e()]),t.productsData&&t.productsData.length<=0?a("div",{staticClass:"flex w-full justify-center p-8"},[a("h1",{},[t._v("Empty list, there is no data!")])]):t._e()])],1)},o=[function(){var t=this,a=t._self._c;return a("thead",{staticClass:"text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"},[a("tr",[a("th",{staticClass:"py-3 px-6",attrs:{scope:"col"}},[t._v("Barcode")]),a("th",{staticClass:"py-3 px-6",attrs:{scope:"col"}},[t._v("Product name")]),a("th",{staticClass:"py-3 px-6",attrs:{scope:"col"}},[t._v("Supplier")]),a("th",{staticClass:"py-3 px-6",attrs:{scope:"col"}},[t._v("Quantity")]),a("th",{staticClass:"py-3 px-6",attrs:{scope:"col"}},[t._v("Unit cost")]),a("th",{staticClass:"py-3 px-6",attrs:{scope:"col"}},[t._v("Last modified")])])])}],r=(s(7658),s(196)),c=s(629),i=s(7398),n=s.n(i),l=s(1876),p=s(8510),d={data(){return{isLoading:!1,productsData:[]}},async mounted(){this.fetchData()},methods:{priceFormat:l.Z,dateFormat:p.Z,pagePagination(t){this.$router.push(`/dashboard/product/get-out-of-stock?page=${t}`),this.fetchData()},async fetchData(t=1){this.isLoading=!0;let a=this.$route.query?parseInt(this.$route.query.page):t;await r.ZP.get(`http://localhost:3000/api/v1/product/get-out-of-stock?page=${a}&token=${this.accessToken}`).then((t=>{t.data.status?this.productsData=t.data.result.data:this.productsData=[]})),this.isLoading=!1},async exportHandler(){const t=Date.now();await(0,r.ZP)({url:`http://localhost:3000/api/v1/product/out-of-stock/export?requestID=${t}&token=${this.accessToken}`,method:"GET",responseType:"blob"}).then((t=>{const a=window.URL.createObjectURL(new Blob([t.data])),s=document.createElement("a");s.href=a;const e="out-of-stock.xlsx";s.setAttribute("download",e),s.setAttribute("target","_blank"),document.body.appendChild(s),s.click(),s.remove()}))}},computed:{...(0,c.rn)(["accessToken","payload","toastify"])},components:{Loading:n()}},u=d,h=s(1001),f=(0,h.Z)(u,e,o,!1,null,null,null),m=f.exports},1876:function(t,a,s){function e(t){if(t&&t>=1e6){let a=Math.floor(t/1e6),s=Math.floor(t%1e6/1e3),e=Math.floor(t%1e6%1e3);return s=s<100?s<10?`00${s}`:`0${s}`:s,e=e<100?e<10?`00${e}`:`0${e}`:e,`${a},${s},${e} vnđ`}if(t&&t<1e6){let a=Math.floor(t/1e3),s=Math.floor(t)%1e3;return s=s<100?s<10?`00${s}`:`0${s}`:s,`${a},${s} vnđ`}return"0 vnđ"}s.d(a,{Z:function(){return e}})}}]);
//# sourceMappingURL=dashboardProductOutOfStock.0556b6ee.js.map