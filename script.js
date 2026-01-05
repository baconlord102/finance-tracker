const transactionList = document.getElementById("transactionList");
const toggleFormBtn = document.getElementById("toggleForm");
const form = document.getElementById("transactionForm");
const addBtn = document.getElementById("addTransaction");
const cancelBtn = document.getElementById("cancelForm");

const monthNameEl = document.getElementById("monthName");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
let currentMonth = new Date();

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function getCurrentMonthTransactions() {
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return (
      d.getMonth() === currentMonth.getMonth() &&
      d.getFullYear() === currentMonth.getFullYear()
    );
  });
}

function updateMonthDisplay() {
  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  monthNameEl.textContent = monthName;
  renderTransactions();
  updateStats();
}

function renderTransactions() {
  const list = getCurrentMonthTransactions().sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  transactionList.innerHTML = "";
  if (list.length === 0) {
    transactionList.innerHTML =
      '<li style="text-align:center;color:#c4b5fd;padding:1rem;">No transactions yet.</li>';
    return;
  }
  list.forEach((t) => {
    const li = document.createElement("li");
    li.className = "transaction-item";
    li.innerHTML = `
      <div>
        <p>${t.notes}</p>
        <small>${t.date} • ${t.category}</small>
      </div>
      <div>
        <strong style="color:${t.type === "credit" ? "#4ade80" : "#f87171"}">
          ${t.type === "credit" ? "+" : "-"}$${t.amount.toFixed(2)}
        </strong>
        <button onclick="deleteTransaction(${t.id})">Delete</button>
      </div>
    `;
    transactionList.appendChild(li);
  });
}

function updateStats() {
  const prevTransactions = transactions.filter(
    (t) =>
      new Date(t.date) <
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  );
  const prevBalance = prevTransactions.reduce(
    (sum, t) => sum + (t.type === "credit" ? t.amount : -t.amount),
    0
  );

  const current = getCurrentMonthTransactions();
  const debits = current
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);
  const credits = current
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  document.getElementById("startBalance").textContent = `$${prevBalance.toFixed(
    2
  )}`;
  document.getElementById("income").textContent = `$${credits.toFixed(2)}`;
  document.getElementById("expenses").textContent = `$${debits.toFixed(2)}`;
  document.getElementById("endBalance").textContent = `$${(
    prevBalance +
    credits -
    debits
  ).toFixed(2)}`;
}

function addTransaction() {
  const date = document.getElementById("date").value;
  const notes = document.getElementById("notes").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;

  if (!date || !notes || isNaN(amount)) return alert("Please fill all fields.");

  const transaction = {
    id: Date.now(),
    date,
    notes,
    amount,
    type,
    category,
  };

  transactions.unshift(transaction);
  saveTransactions();
  form.classList.add("hidden");
  renderTransactions();
  updateStats();
}

function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  renderTransactions();
  updateStats();
}

toggleFormBtn.addEventListener("click", () => form.classList.toggle("hidden"));
cancelBtn.addEventListener("click", () => form.classList.add("hidden"));
addBtn.addEventListener("click", addTransaction);

prevMonthBtn.addEventListener("click", () => {
  currentMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1,
    1
  );
  updateMonthDisplay();
});
nextMonthBtn.addEventListener("click", () => {
  currentMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    1
  );
  updateMonthDisplay();
});

updateMonthDisplay();
