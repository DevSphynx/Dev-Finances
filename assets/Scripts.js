const Modal = {
  open() {
    // Abrir modal
    // Adicionar a class active ao modal
    document.querySelector('.modal-overlay').classList.add('active');
  },
  close() {
    // Fechar modal
    // Remover a class active do modal
    document.querySelector('.modal-overlay').classList.remove('active');
  },
  // Can use toggle()
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('df:transactions')) || [];
  },

  set(transactions) {
    localStorage.setItem('df:transactions', JSON.stringify(transactions));
  },
};

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);

    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    // Somar as entradas
    let income = 0;
    Transaction.all.forEach((transaction) => {
      // Arrow Functions
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    return income;
  },
  expenses() {
    //Somar Saídas
    let expense = 0;
    Transaction.all.forEach((transaction) => {
      // Arrow Functions
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });
    return expense;
  },
  total() {
    // Entradas - Saídas
    return Transaction.incomes() + Transaction.expenses();
  },
  nextIncome() {},
  nextExpense() {},
  nextTotal() {},
};

// Calcular diferença entre datas
const dateTransaction = {
  validateVenc() {
    let date = Form.getValues().date;
    let dueDate = Form.getValues().dueDate;

    date = new Date(date);
    dueDate = new Date(dueDate);
    window.alert(date, dueDate);
    let diffInTime = dueDate - date; // Math.abs() para converter pra positivo
    let timeInOneDay = 1000 * 60 * 60 * 24; // milisegundos * segundos * minutos * horas dia
    let diffInDays = diffInTime / timeInOneDay;
    if (diffInDays < 0) {
      throw new Error(
        'Data de Vencimento não pode anteceder a data de transação'
      );
    }
  },

  currentOrFuture() {},
};

// Substituir os dados do HTML com os dados do JS
const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),
  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense'; // Se o amount da transação for maior q 0 add "income"...

    const amount = Utils.formatCurrency(transaction.amount);
    const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td class="dueDate"> ${transaction.dueDate}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/imgs/minus.svg" alt="Remover Transação">
            </td>
        `;
    return html;
  },

  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );

    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );

    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = '';
  },
};

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : '';

    value = String(value).replace(/\D/g, ''); // RegEx(Expressões Regulares)

    value = Number(value) / 100;

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return signal + value;
  },

  formatAmount(value) {
    value = value * 100;

    return Math.round(value);
  },

  formatDate(date) {
    const splittedDate = date.split('-');
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },
};

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),
  dueDate: document.querySelector('input#dueDate'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
      dueDate: Form.dueDate.value,
    };
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();
    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Por favor, preencha todos os campos');
    }
  },

  formatValues() {
    let { description, amount, date, dueDate } = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);
    dueDate = Utils.formatDate(dueDate);
    return {
      description,
      amount,
      date,
      dueDate,
    };
  },

  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  clearFields() {
    Form.description.value = '';
    Form.amount.value = '';
    Form.date.value = '';
  },

  submit(event) {
    event.preventDefault();

    try {
      dateTransaction.validateVenc();
      //Form.validateFields()
      const transaction = Form.formatValues();
      Form.saveTransaction(transaction);
      Form.clearFields();
      Modal.close();
    } catch (error) {
      console.log('catch');
      window.alert(error.message);
    }
    // Form.submit()
  },
};

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);

    DOM.updateBalance();

    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
