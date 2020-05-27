const myForm = document.querySelector('#my-form');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const msg = document.querySelector('.msg');

myForm.addEventListener('submit', onSubmit);

// load name and email
nameInput.value = localStorage.getItem('name');
emailInput.value = localStorage.getItem('email');

var name = localStorage.getItem('name'); // set userID if exists 
if(name != '')    {
    nameInput.value = name;
}

var email = localStorage.getItem('email'); // set userID if exists 
if(email != '')    {
    emailInput.value = email;
}

function onSubmit(e) {
    e.preventDefault();

    console.log(nameInput.value);
    console.log(emailInput.value);

    if(nameInput.value == '' || emailInput.value == '') {
        msg.classList.add('error');
        msg.innerHTML = 'Please enter fields'

        setTimeout(()=> msg.remove(), 3000);
    } else {
        // update name and email
        localStorage.setItem('name',nameInput.value);
        localStorage.setItem('email',emailInput.value);

        // clear fields
        nameInput.value = '';
        emailInput.value = '';

        window.location.href = "chat.html";
    }
}

