document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const rePassword = document.getElementById('rePassword').value;

  // Validate the form data
  if (!email || !password || !rePassword) {
    document.getElementById('message').textContent = 'Please fill in all fields.';
    return;
  }

  if (password !== rePassword) {
    document.getElementById('message').textContent = 'Passwords do not match.';
    return;
  }

  // Send a POST request to the server
  fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email, password: password, rePassword: rePassword })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'User registered successfully.') {
      // Redirect to the success page or display a success message
      window.location.href = 'login.html';
    } else {
      document.getElementById('message').textContent = data.message;
    }
  })
  .catch(error => {
    console.error('Error:', error);
    document.getElementById('message').textContent = 'An error occurred while registering. Please try again.';
  });
});