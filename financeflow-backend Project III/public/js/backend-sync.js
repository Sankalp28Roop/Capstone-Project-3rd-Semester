(function(){
  const API = '';

  function getToken() {
    return localStorage.getItem('ff_token');
  }

  async function apiFetch(path, opts = {}) {
    opts.headers = opts.headers || {};
    const token = getToken();
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    opts.headers['Content-Type'] = 'application/json';
    const res = await fetch('/api' + path, opts);
    if (!res.ok) {
      const err = await res.json().catch(()=>({error: 'Server error'}));
      throw err;
    }
    return res.json();
  }

  window.FFAuth = {
    async signup(name, email, password){
      const data = await apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({name,email,password}) });
      localStorage.setItem('ff_token', data.token);
      return data;
    },
    async login(email, password){
      const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({email,password}) });
      localStorage.setItem('ff_token', data.token);
      return data;
    },
    logout(){
      localStorage.removeItem('ff_token');
    },
    getToken
  };

  window.FFData = {
    async loadAll(){
      const token = getToken();
      if (!token) return null;
      const [transactions, budgets, groups] = await Promise.all([
        apiFetch('/transactions'),
        apiFetch('/budgets'),
        apiFetch('/groups')
      ]);
      const budgetsObj = {};
      budgets.forEach(b => budgetsObj[b.category] = b.amount);
      return { transactions, budgets: budgetsObj, groups };
    },
    async addTransaction(tx){
      return apiFetch('/transactions', { method: 'POST', body: JSON.stringify(tx) });
    },
    async updateTransaction(id, tx){
      return apiFetch('/transactions/' + id, { method: 'PUT', body: JSON.stringify(tx) });
    },
    async deleteTransaction(id){
      return apiFetch('/transactions/' + id, { method: 'DELETE' });
    },
    async setBudget(category, amount){
      return apiFetch('/budgets', { method: 'POST', body: JSON.stringify({category, amount}) });
    },
    async deleteBudget(category){
      return apiFetch('/budgets/' + category, { method: 'DELETE' });
    },
    async createGroup(payload){
      return apiFetch('/groups', { method: 'POST', body: JSON.stringify(payload) });
    },
    async addGroupExpense(groupId, expense){
      return apiFetch('/groups/' + groupId + '/expense', { method: 'POST', body: JSON.stringify(expense) });
    },
    async settleGroupBalance(groupId, member){
      return apiFetch('/groups/' + groupId + '/settle', { method: 'POST', body: JSON.stringify({ member }) });
    }
  };

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const data = await window.FFData.loadAll();
      if (data) {
        if (Array.isArray(data.transactions)) {
          transactions = data.transactions.map(t => ({ id: t._id, type: t.type, amount: t.amount, category: t.category, date: t.date, notes: t.notes, timestamp: t.createdAt }));
        }
        budgets = data.budgets || {};
        groups = (data.groups || []).map(g => {
          const balances = {};
          if (g.balances) {
            Object.entries(g.balances).forEach(([k,v]) => balances[k] = v);
          }
          return { id: g._id, name: g.name, members: g.members, expenses: g.expenses, balances, created: g.createdAt };
        });
        saveData && saveData();
        updateDashboard && updateDashboard();
        renderTransactions && renderTransactions();
        renderBudgets && renderBudgets();
        renderGroups && renderGroups();
      }
    } catch (err) {
      console.warn('Backend sync failed', err);
    }
  });

})();