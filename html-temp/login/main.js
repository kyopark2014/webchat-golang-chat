const myForm = document.querySelector('#my-form');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const msg = document.querySelector('.msg');
const userList = document.querySelector('#users');

myForm.addEventListener('submit', onSubmit);

// load name and email
nameInput.value = localStorage.getItem('name');
emailInput.value = localStorage.getItem('email');

const ul = document.querySelector('.items');
ul.firstElementChild.textContent = `${nameInput.value} : ${emailInput.value}`;

function onSubmit(e) {
    e.preventDefault();

    console.log(nameInput.value);
    console.log(emailInput.value);

    if(nameInput.value === '' || emailInput.value === '') {
        // alert('Please enter fields');
        msg.classList.add('error');
        msg.innerHTML = 'Please enter fields'

        setTimeout(()=> msg.remove(), 3000);
    } else {
        // console.log('success');
        const li = document.createElement('li');  // list item
        li.appendChild(document.createTextNode(`${nameInput.value} : ${emailInput.value}`));
        userList.appendChild(li);

        // update name and email
        localStorage.setItem('name',nameInput.value);
        localStorage.setItem('email',emailInput.value);

        const ul = document.querySelector('.items');
        ul.firstElementChild.textContent = `${nameInput.value} : ${emailInput.value}`;
        console.log('name: ' + localStorage.getItem('name') + ' email: ' + emailInput.value);

        // clear fields
        nameInput.value = '';
        emailInput.value = '';
    }
}

