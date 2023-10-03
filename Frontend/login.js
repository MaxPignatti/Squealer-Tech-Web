function LoginPage() {
    const formData = {
      email: "",
      password: ""
    };
  
    function handleLogin(event) {
      /* To be implemented */
    }
  
    const container = document.createElement("div");
    container.classList.add("container");
  
    const row = document.createElement("div");
    row.classList.add("row", "justify-content-center", "mt-5");
  
    const col = document.createElement("div");
    col.classList.add("col", "md-6");
  
    const card = document.createElement("div");
    card.classList.add("card");
  
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
  
    const textCenter = document.createElement("div");
    textCenter.classList.add("text-center", "mb-4");
  
    const img = document.createElement("img");
    img.src = "/Logo.png";
    img.alt = "Logo";
  
    const h2 = document.createElement("h2");
    h2.classList.add("text-center");
    h2.textContent = "Login";
  
    const form = document.createElement("form");
    form.onsubmit = handleLogin;
  
    const formGroupEmail = document.createElement("div");
    formGroupEmail.classList.add("form-group");
    formGroupEmail.id = "formBasicEmail";
  
    const formLabelEmail = document.createElement("label");
    formLabelEmail.textContent = "Email address";
  
    const formControlEmail = document.createElement("input");
    formControlEmail.type = "email";
    formControlEmail.placeholder = "Enter email";
    formControlEmail.value = formData.email;
    formControlEmail.oninput = function (e) {
      formData.email = e.target.value;
    };
    formControlEmail.setAttribute("aria-label", "Email Address");
    formControlEmail.setAttribute("aria-describedby", "emailHelp");
  
    const formGroupPassword = document.createElement("div");
    formGroupPassword.classList.add("form-group");
    formGroupPassword.id = "formBasicPassword";
  
    const formLabelPassword = document.createElement("label");
    formLabelPassword.textContent = "Password";
  
    const formControlPassword = document.createElement("input");
    formControlPassword.type = "password";
    formControlPassword.placeholder = "Password";
    formControlPassword.value = formData.password;
    formControlPassword.oninput = function (e) {
      formData.password = e.target.value;
    };
    formControlPassword.setAttribute("aria-label", "Password");
  
    const button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Login";
    button.classList.add("btn", "btn-primary", "btn-block");
  
    const cardFooter = document.createElement("div");
    cardFooter.classList.add("card-footer", "text-center");
  
    const p = document.createElement("p");
    p.innerHTML = "Don't have an account? <a href='/register'>Register</a>";
  
    textCenter.appendChild(img);
    formLabelEmail.appendChild(formControlEmail);
    formGroupEmail.appendChild(formLabelEmail);
    formGroupPassword.appendChild(formLabelPassword);
    formGroupPassword.appendChild(formControlPassword);
    form.appendChild(formGroupEmail);
    form.appendChild(formGroupPassword);
    form.appendChild(button);
    cardBody.appendChild(textCenter);
    cardBody.appendChild(h2);
    cardBody.appendChild(form);
    p.innerHTML = "Don't have an account? <a href='/register'>Register</a>";
    cardFooter.appendChild(p);
    card.appendChild(cardBody);
    card.appendChild(cardFooter);
    col.appendChild(card);
    row.appendChild(col);
    container.appendChild(row);
  
    return container;
  }
  