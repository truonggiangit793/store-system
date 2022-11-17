"use strict";(self["webpackChunkstore_system"]=self["webpackChunkstore_system"]||[]).push([[97],{27:function(t,a,s){s.r(a),s.d(a,{default:function(){return g}});var e=function(){var t=this,a=t._self._c;return a("main",[a("Loading",{attrs:{active:t.isLoading,"is-full-page":!0,"can-cancel":!1}}),a("div",{staticClass:"py-2 bg-green-400 rounded-full text-white text-center mb-9 font-bold text-lg cursor-pointer hover:bg-green-500 transition-all",on:{click:t.newTransactionHandler}},[a("ThemifyIcon",{attrs:{icon:"shopping-cart"}}),a("button",{staticClass:"ml-3"},[t._v("Create New Transaction")])],1),a("div",{staticClass:"mb-4 flex items-center text-green-900 font-bold text-xl"},[a("ThemifyIcon",{attrs:{icon:"settings"}}),a("h1",{staticClass:"ml-2"},[t._v("List of transactions:")])],1),a("div",{staticClass:"overflow-x-auto relative"},[a("table",{staticClass:"overflow-scroll w-full text-sm text-left text-gray-500 dark:text-gray-400"},[t._m(0),t.transactionList?a("tbody",t._l(t.transactionList,(function(s,e){return a("tr",{key:e,staticClass:"bg-white border-b dark:bg-gray-800 dark:border-gray-700",class:{"bg-pink-100":!s.payStatus}},[a("router-link",{attrs:{to:"/transaction/"+s.transactionID}},[a("th",{staticClass:"py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white",attrs:{scope:"row"}},[t._v(" "+t._s(s.transactionID)+" ")])]),a("td",{staticClass:"py-4 px-6"},[t._v(t._s(s.cashierCode))]),a("td",{staticClass:"py-4 px-6"},[a("div",{staticClass:"flex items-center"},[a("div",{staticClass:"h-2.5 w-2.5 rounded-full mr-2",class:{"bg-green-400":s.payStatus,"bg-red-400":!s.payStatus}}),t._v(" "+t._s(s.payStatus?"Paid":"Un-paid")+" ")])]),a("td",{staticClass:"py-4 px-6"},[t._v(t._s(s.customerID?s.customerID:"Unknown"))]),a("td",{staticClass:"py-4 px-6"},[t._v(t._s(t.priceFormat(s.totalPrice)))]),a("td",{staticClass:"py-4 px-6"},[t._v(t._s(t.dateFormat(s.createdAt)))]),a("td",{staticClass:"py-4 px-6"},[t._v(t._s(t.dateFormat(s.updatedAt)))])],1)})),0):t._e()]),t.transactionList&&t.transactionList.length<=0?a("div",{staticClass:"flex w-full justify-center p-8"},[a("h1",{},[t._v("Empty list, there is no data!")])]):t._e()])],1)},n=[function(){var t=this,a=t._self._c;return a("thead",{staticClass:"text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"},[a("tr",[a("th",{staticClass:"py-3 px-6",attrs:{scope:"col"}},[t._v("Transaction ID")]),a("th",{staticClass:"py-3 px-6",attrs:{scope:"col"}},[t._v("Cashier")]),a("th",{staticClass:"py-3 px-6",attrs:{scope:"col"}},[t._v("Status")]),a("th",{staticClass:"py-3 px-6",attrs:{scope:"col"}},[t._v("Customer")]),a("th",{staticClass:"py-3 px-6",attrs:{scope:"col"}},[t._v("Total price")]),a("th",{staticClass:"py-3 px-6",attrs:{scope:"col"}},[t._v("Created at")]),a("th",{staticClass:"py-3 px-6",attrs:{scope:"col"}},[t._v("Last modified")])])])}],r=(s(7658),s(196)),i=s(629),o=s(7973),c=s(8510),l=s(1876),d=s(7398),p=s.n(d),u={name:"POSView",data(){return{isLoading:!0,transactionList:null}},async mounted(){await r.ZP.get(`http://localhost:3000/api/v1/transaction/get-all?token=${this.$store.state.accessToken}`).then((t=>{t.data.status&&t.data.data&&(this.transactionList=t.data.data)})),this.isLoading=!1},methods:{dateFormat:c.Z,priceFormat:l.Z,async newTransactionHandler(){this.isLoading=!0,await r.ZP.post(`http://localhost:3000/api/v1/transaction/new?token=${this.accessToken}`).then((t=>{t.data.status?(this.toastify.success(t.data.msg.en),this.$router.push(`/transaction/${t.data.transaction.transactionID}`)):this.toastify.error(t.data.msg.en)})),this.isLoading=!1}},components:{ThemifyIcon:o.Z,Loading:p()},computed:{...(0,i.rn)(["accessToken","toastify"])}},h=u,f=s(1001),y=(0,f.Z)(h,e,n,!1,null,"7f32d700",null),g=y.exports},1876:function(t,a,s){function e(t){if(t&&t>=1e6){let a=Math.floor(t/1e6),s=Math.floor(t%1e6/1e3),e=Math.floor(t%1e6%1e3);return s=s<100?s<10?`00${s}`:`0${s}`:s,e=e<100?e<10?`00${e}`:`0${e}`:e,`${a},${s},${e} vnđ`}if(t&&t<1e6){let a=Math.floor(t/1e3),s=Math.floor(t)%1e3;return s=s<100?s<10?`00${s}`:`0${s}`:s,`${a},${s} vnđ`}return"0 vnđ"}s.d(a,{Z:function(){return e}})}}]);
//# sourceMappingURL=pos.36e6970f.js.map