'use strict';

// USER DATA
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [
    200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300, 100, 500,
  ],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2024-04-01T10:17:24.185Z',
    '2024-05-08T14:11:59.604Z',
    '2024-05-27T17:01:17.194Z',
    '2024-06-17T23:36:17.929Z',
    '2024-06-18T10:51:36.790Z',
    '2024-06-19T14:34:28.181Z',
    '2024-06-20T11:34:28.181Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30, 600, -400],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2022-02-05T16:33:06.386Z',
    '2022-04-10T14:43:26.374Z',
    '2024-06-17T18:49:59.371Z',
    '2024-06-18T12:01:20.894Z',
    '2024-06-19T14:34:28.181Z',
    '2024-06-20T12:34:28.181Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.abs(Math.round((date1 - date2) / (1000 * 60 * 60 * 24)));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed < 1) return `YESTERDAY`;
  else if (daysPassed === 1) return `TODAY`;
  else if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: `${currency}`,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movSorted = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movSorted.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formatCur(
      mov,
      acc.locale,
      acc.currency
    )}</div>
  </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const createUserName = accs => {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name.at(0))
      .join('');
  });
};
createUserName(accounts);

const updateUI = function (acc) {
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, curr, i, arr) => acc + curr, 0);

  labelBalance.textContent = `${formatCur(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

const calcDisplaySummary = acc => {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumIn.textContent = `${formatCur(incomes, acc.locale, acc.currency)}`;

  const out = Math.abs(
    acc.movements.filter(mov => mov < 0).reduce((acc, curr) => acc + curr)
  );
  labelSumOut.textContent = `${formatCur(out, acc.locale, acc.currency)}`;

  const interests = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(interest => interest >= 1)
    .reduce((acc, interest) => acc + interest, 0);
  labelSumInterest.textContent = `${formatCur(
    interests,
    acc.locale,
    acc.currency
  )}`;
};

const startLogOutTimer = function () {
  // set timer to 5 minutes
  let time = 300;
  // to start the timer immediately and not after 1st second, create a tick function
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // print time
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
    time--;
  };
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentUserAccount, timer;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentUserAccount = accounts.find(function (acc) {
    return acc.username === inputLoginUsername.value;
  });

  if (currentUserAccount?.pin === +inputLoginPin.value) {
    // display ui

    containerApp.style.opacity = 100;

    // clear input
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();
    // Display welcome
    labelWelcome.textContent = `Welcome, ${
      currentUserAccount.owner.split(' ')[0]
    }`;

    // Display date
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentUserAccount.locale,
      options
    ).format(now);

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // display balance
    updateUI(currentUserAccount);
  } else {
    alert('INCORRECT USERNAME/PIN!');
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amountToTransfer = +inputTransferAmount.value;

  const receiverAccount = accounts.find(function (acc) {
    return acc.username === inputTransferTo.value;
  });

  if (
    amountToTransfer > 0 &&
    receiverAccount &&
    currentUserAccount.balance >= amountToTransfer &&
    receiverAccount?.username !== currentUserAccount.username
  ) {
    receiverAccount.movements.push(amountToTransfer);
    currentUserAccount.movements.push(-amountToTransfer);

    currentUserAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());
    inputTransferAmount.value = inputTransferTo.value = '';
    inputTransferTo.blur();

    updateUI(currentUserAccount);

    clearInterval(timer);
    timer = startLogOutTimer();
  } else {
    alert('INCORRECT RECIVER INFO/WRONG AMOUNT!');
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loanAmount = Math.floor(inputLoanAmount.value);
  if (
    loanAmount > 0 &&
    currentUserAccount.movements.some(mov => mov >= loanAmount * 0.1)
  ) {
    setTimeout(function () {
      // make loan credit
      currentUserAccount.movements.push(loanAmount);

      // add loan date
      currentUserAccount.movementsDates.push(new Date().toISOString());
      // update ui
      updateUI(currentUserAccount);
    }, 2500);

    // To prevent inactivity logout
    clearInterval(timer);
    timer = startLogOutTimer();
  } else {
    alert('Amount too large');
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentUserAccount.username &&
    +inputClosePin.value === currentUserAccount.pin
  ) {
    const accountIndex = accounts.findIndex(
      acc => acc.username === inputCloseUsername.value
    );
    accounts.splice(accountIndex, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  }
});

let sorted = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();

  displayMovements(currentUserAccount, !sorted);
  sorted = !sorted;
});


