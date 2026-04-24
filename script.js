"use strict";

// Utility Tambahan
const utils = {
  toNumber: (v) => Number(v) || 0,
  toRupiah: (v) => `Rp. ${v.toLocaleString()}`,
  toUSD: () => {},
};

// Model Object : Transaksi
function Transaction({ type, amount, category }) {
  this.id = Date.now();
  this.type = type;
  this.amount = utils.toNumber(amount);
  this.category = category;
}

Transaction.prototype.info = function () {
  return `${this.type} - ${utils.toRupiah(this.amount)} (${this.category})`;
};

// Manage Finance
const Finance = (() => {
  const data = [];
  const categoryMap = new Map();
  const categorySet = new Set();

  let balance = 0;
  let saving = 0;

  const add = (trx) => {
    data.push(trx);

    if (trx.type === "income") balance += trx.amount;
    if (trx.type === "expense") balance -= trx.amount;
    if (trx.type === "saving") {
      saving += trx.amount;
      balance -= trx.amount;
    }

    updateCategory(trx);

    return trx;
  };
  const updateCategory = (trx) => {
    const current = categoryMap.get(trx.category) || 0;
    categoryMap.set(trx.category, current + trx.amount);
    categorySet.add(trx.category);
  };

  const summary = () => {
    return {
      balance,
      saving,
      totalTransaction: data.length,
    };
  };
  const all = () => [...data];

  return {
    add,
    summary,
    all,
    categoryMap,
    categorySet,
  };
})();

const Storage = {
  save(data) {
    localStorage.setItem("data", JSON.stringify(data));
  },
  load() {
    return JSON.parse(localStorage.getItem("data")) || [];
  },
  reset() {
    localStorage.clear();
  },
};

// UI -> DOM
const UI = (() => {
  const form = document.getElementById("form");
  const listParent = document.getElementById("list");
  const balance = document.getElementById("balance");
  const saving = document.getElementById("saving");

  const render = () => {
    listParent.innerHTML = "";

    Finance.all().forEach((trx) => {
      const li = document.createElement("li");
      li.textContent = trx.info();
      listParent.appendChild(li);
    });

    const sum = Finance.summary();

    console.log(sum);

    balance.textContent = utils.toRupiah(sum.balance);
    saving.textContent = utils.toRupiah(sum.saving);
  };

  const bind = () => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const type = document.getElementById("type").value;
      const amount = document.getElementById("amount").value;
      const category = document.getElementById("category").value;

      if (!amount) return;

      const trx = new Transaction({ type, amount, category });

      Finance.add(trx);
      Storage.save(Finance.all());

      render();
    });
  };

  return {
    render,
    bind,
  };
})();

(function () {
  const saved = Storage.load();

  saved.forEach((item) => {
    Finance.add(new Transaction(item));
  });

  UI.render();
  UI.bind();

  console.log("Categories : ", Finance.categorySet);
})();
