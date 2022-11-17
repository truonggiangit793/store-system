<template>
    <main>
        <Loading :active="isLoading" :is-full-page="true" :can-cancel="false" />
        <div
            class="py-2 bg-green-400 rounded-full text-white text-center mb-9 font-bold text-lg cursor-pointer hover:bg-green-500 transition-all"
            v-on:click="newTransactionHandler"
        >
            <ThemifyIcon icon="shopping-cart" />
            <button class="ml-3">Create New Transaction</button>
        </div>
        <div class="mb-4 flex items-center text-green-900 font-bold text-xl">
            <ThemifyIcon icon="settings" />
            <h1 class="ml-2">List of transactions:</h1>
        </div>
        <div class="overflow-x-auto relative">
            <table class="overflow-scroll w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="py-3 px-6">Transaction ID</th>
                        <th scope="col" class="py-3 px-6">Cashier</th>
                        <th scope="col" class="py-3 px-6">Status</th>
                        <th scope="col" class="py-3 px-6">Customer</th>
                        <th scope="col" class="py-3 px-6">Total price</th>
                        <th scope="col" class="py-3 px-6">Created at</th>
                        <th scope="col" class="py-3 px-6">Last modified</th>
                    </tr>
                </thead>
                <tbody v-if="transactionList">
                    <tr
                        class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                        v-for="(transaction, i) in transactionList"
                        :key="i"
                        :class="{ 'bg-pink-100': !transaction.payStatus }"
                    >
                        <router-link :to="'/transaction/' + transaction.transactionID">
                            <th scope="row" class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {{ transaction.transactionID }}
                            </th>
                        </router-link>
                        <td class="py-4 px-6">{{ transaction.cashierCode }}</td>
                        <td class="py-4 px-6">
                            <div class="flex items-center">
                                <div class="h-2.5 w-2.5 rounded-full mr-2" :class="{ 'bg-green-400': transaction.payStatus, 'bg-red-400': !transaction.payStatus }"></div>
                                {{ transaction.payStatus ? "Paid" : "Un-paid" }}
                            </div>
                        </td>
                        <td class="py-4 px-6">{{ transaction.customerID ? transaction.customerID : "Unknown" }}</td>
                        <td class="py-4 px-6">{{ priceFormat(transaction.totalPrice) }}</td>
                        <td class="py-4 px-6">{{ dateFormat(transaction.createdAt) }}</td>
                        <td class="py-4 px-6">{{ dateFormat(transaction.updatedAt) }}</td>
                    </tr>
                </tbody>
            </table>
            <div v-if="transactionList && transactionList.length <= 0" class="flex w-full justify-center p-8">
                <h1 class="">Empty list, there is no data!</h1>
            </div>
        </div>
    </main>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import ThemifyIcon from "vue-themify-icons/ThemifyIcon.vue";
import dateFormat from "@/helpers/dateFormat";
import priceFormat from "../helpers/priceFormat";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";

export default {
    name: "POSView",
    data() {
        return {
            isLoading: true,
            transactionList: null,
        };
    },
    async mounted() {
        await axios.get(`${process.env.VUE_APP_API_URL}/transaction/get-all?token=${this.$store.state.accessToken}`).then((res) => {
            if (res.data.status && res.data.data) {
                this.transactionList = res.data.data;
            }
        });
        this.isLoading = false;
    },
    methods: {
        dateFormat,
        priceFormat,
        async newTransactionHandler() {
            this.isLoading = true;
            await axios.post(`${process.env.VUE_APP_API_URL}/transaction/new?token=${this.accessToken}`).then((res) => {
                if (res.data.status) {
                    this.toastify.success(res.data.msg.en);
                    this.$router.push(`/transaction/${res.data.transaction.transactionID}`);
                } else {
                    this.toastify.error(res.data.msg.en);
                }
            });
            this.isLoading = false;
        },
    },
    components: { ThemifyIcon, Loading },
    computed: {
        ...mapState(["accessToken", "toastify"]),
    },
};
</script>

<style scoped></style>
