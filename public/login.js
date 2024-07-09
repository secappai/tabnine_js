document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Send a POST request to the server
fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email, password })
})
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Login successful.') {
      // Store the JWT token in local storage or session storage
      localStorage.setItem('jwtToken', data.token);
      console.log('JWT token stored:', data.token);  // Debug log
      
      // Redirect the user to the home page or dashboard
      window.location.href = 'home.html';
    } else {
      // Display error message or handle the failed login scenario
      document.getElementById('message').textContent = data.message;
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
});